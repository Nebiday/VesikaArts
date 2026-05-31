const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenSwap", function () {
  let vesikaCoin, factory, tokenSwap, artistToken;
  let owner, artist, approver, user;

  const POOL_MAIN = ethers.utils.parseEther("10000");
  const POOL_ARTIST = ethers.utils.parseEther("10000");

  beforeEach(async function () {
    [owner, artist, approver, user] = await ethers.getSigners();

    // Deploy VesikaCoin (ana token) - owner ilk arzı alır
    const VesikaCoin = await ethers.getContractFactory("VesikaCoin");
    vesikaCoin = await VesikaCoin.deploy();
    await vesikaCoin.deployed();

    // Deploy Factory
    const ArtistTokenFactory = await ethers.getContractFactory("ArtistTokenFactory");
    factory = await ArtistTokenFactory.deploy(vesikaCoin.address);
    await factory.deployed();

    // Deploy TokenSwap (owner -> ADMIN_ROLE + LIQUIDITY_MANAGER_ROLE)
    const TokenSwap = await ethers.getContractFactory("TokenSwap");
    tokenSwap = await TokenSwap.deploy(vesikaCoin.address, factory.address);
    await tokenSwap.deployed();

    // Factory akışı: sanatçı kaydı -> onay -> token talebi -> onay -> deploy
    const APPROVER_ROLE = await factory.APPROVER_ROLE();
    await factory.grantRole(APPROVER_ROLE, approver.address);

    await factory.connect(artist).registerArtist("ipfs://artist");
    await factory.connect(approver).approveArtist(artist.address);

    const tx = await factory.connect(artist).requestToken(
      "ArtistToken1",
      "ART1",
      ethers.utils.parseEther("1000000"),
      ethers.utils.parseEther("10"),
      "Artist token",
      "ipfs://token"
    );
    const receipt = await tx.wait();
    const requestId = receipt.events.find(e => e.event === "TokenRequested").args.requestId;

    await factory.connect(approver).approveTokenRequest(requestId);
    await factory.connect(artist).deployToken(requestId);

    const details = await factory.getRequestDetails(requestId);
    artistToken = await ethers.getContractAt("ArtistToken", details.tokenAddress);

    // ArtistToken transfer-kısıtlı: havuz işlemleri için TokenSwap'i whitelist'le
    await artistToken.connect(artist).updateWhitelist(tokenSwap.address, true);

    // Owner'a likidite için sanatçı token aktar (artist whitelist'te olduğundan transfer serbest)
    await artistToken.connect(artist).transfer(owner.address, POOL_ARTIST);

    // Onaylar ve havuz oluşturma
    await vesikaCoin.approve(tokenSwap.address, POOL_MAIN);
    await artistToken.approve(tokenSwap.address, POOL_ARTIST);
    await tokenSwap.createPool(artistToken.address, POOL_MAIN, POOL_ARTIST);
  });

  describe("getAmountOut (AMM formülü)", function () {
    it("x*y=k formülüne göre doğru çıktı hesaplar", async function () {
      const amountIn = ethers.utils.parseEther("100");
      const reserveIn = ethers.utils.parseEther("1000");
      const reserveOut = ethers.utils.parseEther("1000");

      const out = await tokenSwap.getAmountOut(amountIn, reserveIn, reserveOut);
      // 100*1000 / (1000+100) = 90.909...
      const expected = amountIn.mul(reserveOut).div(reserveIn.add(amountIn));
      expect(out).to.equal(expected);
    });

    it("sıfır girdi için revert eder", async function () {
      await expect(
        tokenSwap.getAmountOut(0, 1000, 1000)
      ).to.be.revertedWith("Invalid input amount");
    });
  });

  describe("createPool", function () {
    it("havuz rezervlerini ve durumunu doğru ayarlar", async function () {
      const info = await tokenSwap.getPoolInfo(artistToken.address);
      expect(info.mainTokenReserve).to.equal(POOL_MAIN);
      expect(info.artistTokenReserve).to.equal(POOL_ARTIST);
      expect(info.isActive).to.equal(true);
      expect(await tokenSwap.supportedTokens(artistToken.address)).to.equal(true);
    });

    it("aynı havuz iki kez oluşturulamaz", async function () {
      await expect(
        tokenSwap.createPool(artistToken.address, POOL_MAIN, POOL_ARTIST)
      ).to.be.revertedWith("Pool already exists");
    });
  });

  describe("swapMainToArtist", function () {
    const amountIn = ethers.utils.parseEther("1000");

    beforeEach(async function () {
      // user'a VSK ver ve TokenSwap'e onay ver
      await vesikaCoin.transfer(user.address, amountIn);
      await vesikaCoin.connect(user).approve(tokenSwap.address, amountIn);
    });

    it("fee düşülmüş girdi üzerinden doğru çıktı verir", async function () {
      const info = await tokenSwap.getPoolInfo(artistToken.address);
      const fee = amountIn.mul(30).div(10000); // %0.3
      const amountAfterFee = amountIn.sub(fee);
      const expectedOut = await tokenSwap.getAmountOut(
        amountAfterFee,
        info.mainTokenReserve,
        info.artistTokenReserve
      );

      const balBefore = await artistToken.balanceOf(user.address);
      await tokenSwap.connect(user).swapMainToArtist(artistToken.address, amountIn, 0);
      const balAfter = await artistToken.balanceOf(user.address);

      expect(balAfter.sub(balBefore)).to.equal(expectedOut);
    });

    it("fee havuzda kalır: k (rezerv çarpımı) artar", async function () {
      const before = await tokenSwap.getPoolInfo(artistToken.address);
      const kBefore = before.mainTokenReserve.mul(before.artistTokenReserve);

      await tokenSwap.connect(user).swapMainToArtist(artistToken.address, amountIn, 0);

      const after = await tokenSwap.getPoolInfo(artistToken.address);
      const kAfter = after.mainTokenReserve.mul(after.artistTokenReserve);

      // Bug düzeltmesinin kilidi: fee LP'lere yansıdığı için k kesinlikle artmalı
      expect(kAfter).to.be.gt(kBefore);
    });

    it("tüm girdi havuza eklenir, çıktı rezervden düşülür", async function () {
      const before = await tokenSwap.getPoolInfo(artistToken.address);
      const fee = amountIn.mul(30).div(10000);
      const expectedOut = await tokenSwap.getAmountOut(
        amountIn.sub(fee),
        before.mainTokenReserve,
        before.artistTokenReserve
      );

      await tokenSwap.connect(user).swapMainToArtist(artistToken.address, amountIn, 0);

      const after = await tokenSwap.getPoolInfo(artistToken.address);
      expect(after.mainTokenReserve).to.equal(before.mainTokenReserve.add(amountIn));
      expect(after.artistTokenReserve).to.equal(before.artistTokenReserve.sub(expectedOut));
    });

    it("slippage (minOut) karşılanmazsa revert eder", async function () {
      const tooMuch = ethers.utils.parseEther("100000");
      await expect(
        tokenSwap.connect(user).swapMainToArtist(artistToken.address, amountIn, tooMuch)
      ).to.be.revertedWith("Insufficient output amount");
    });
  });

  describe("swapArtistToMain", function () {
    const amountIn = ethers.utils.parseEther("1000");

    beforeEach(async function () {
      // user'a sanatçı token ver (artist whitelist'te) ve onay ver
      await artistToken.connect(artist).transfer(user.address, amountIn);
      await artistToken.connect(user).approve(tokenSwap.address, amountIn);
    });

    it("fee düşülmüş girdi üzerinden doğru çıktı verir", async function () {
      const info = await tokenSwap.getPoolInfo(artistToken.address);
      const fee = amountIn.mul(30).div(10000);
      const expectedOut = await tokenSwap.getAmountOut(
        amountIn.sub(fee),
        info.artistTokenReserve,
        info.mainTokenReserve
      );

      const balBefore = await vesikaCoin.balanceOf(user.address);
      await tokenSwap.connect(user).swapArtistToMain(artistToken.address, amountIn, 0);
      const balAfter = await vesikaCoin.balanceOf(user.address);

      expect(balAfter.sub(balBefore)).to.equal(expectedOut);
    });

    it("fee havuzda kalır: k artar", async function () {
      const before = await tokenSwap.getPoolInfo(artistToken.address);
      const kBefore = before.mainTokenReserve.mul(before.artistTokenReserve);

      await tokenSwap.connect(user).swapArtistToMain(artistToken.address, amountIn, 0);

      const after = await tokenSwap.getPoolInfo(artistToken.address);
      const kAfter = after.mainTokenReserve.mul(after.artistTokenReserve);

      expect(kAfter).to.be.gt(kBefore);
    });
  });

  describe("updateSwapFee", function () {
    it("admin fee güncelleyebilir", async function () {
      await tokenSwap.updateSwapFee(50);
      expect(await tokenSwap.swapFee()).to.equal(50);
    });

    it("%10 üzerinde fee reddedilir", async function () {
      await expect(tokenSwap.updateSwapFee(1001)).to.be.revertedWith("Fee too high");
    });

    it("admin olmayan fee güncelleyemez", async function () {
      await expect(tokenSwap.connect(user).updateSwapFee(50)).to.be.reverted;
    });
  });
});
