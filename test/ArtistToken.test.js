const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtistToken", function () {
  let artistToken;
  let owner, artist, factory, user, other;
  let mainTokenAddr;

  const MAX_SUPPLY = ethers.utils.parseEther("1000000");
  const ARTIST_SHARE = ethers.utils.parseEther("300000"); // %30
  const FACTORY_SHARE = ethers.utils.parseEther("700000"); // %70
  const SWAP_RATE = ethers.utils.parseEther("10");

  beforeEach(async function () {
    [owner, artist, factory, user, other] = await ethers.getSigners();
    mainTokenAddr = ethers.Wallet.createRandom().address;

    const ArtistToken = await ethers.getContractFactory("ArtistToken");
    artistToken = await ArtistToken.deploy(
      "ArtistToken1",
      "ART1",
      artist.address,
      factory.address,
      mainTokenAddr,
      MAX_SUPPLY,
      SWAP_RATE
    );
    await artistToken.deployed();
  });

  describe("Deployment", function () {
    it("doğru isim ve sembol", async function () {
      expect(await artistToken.name()).to.equal("ArtistToken1");
      expect(await artistToken.symbol()).to.equal("ART1");
    });

    it("ilk arzı %30 sanatçı / %70 factory olarak dağıtır", async function () {
      expect(await artistToken.balanceOf(artist.address)).to.equal(ARTIST_SHARE);
      expect(await artistToken.balanceOf(factory.address)).to.equal(FACTORY_SHARE);
      expect(await artistToken.totalSupply()).to.equal(MAX_SUPPLY);
    });

    it("sanatçı, factory ve mainToken'ı whitelist'e ekler", async function () {
      expect(await artistToken.whitelist(artist.address)).to.equal(true);
      expect(await artistToken.whitelist(factory.address)).to.equal(true);
      expect(await artistToken.whitelist(mainTokenAddr)).to.equal(true);
    });

    it("varsayılan durumları ayarlar", async function () {
      expect(await artistToken.swapRate()).to.equal(SWAP_RATE);
      expect(await artistToken.maxSupply()).to.equal(MAX_SUPPLY);
      expect(await artistToken.transferRestricted()).to.equal(true);
      expect(await artistToken.swapEnabled()).to.equal(true);
    });
  });

  describe("Transfer kısıtlaması", function () {
    it("whitelist'teki adresten transfere izin verir", async function () {
      // artist (whitelist) -> user (whitelist degil): from whitelist oldugundan serbest
      await artistToken.connect(artist).transfer(user.address, ethers.utils.parseEther("100"));
      expect(await artistToken.balanceOf(user.address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("iki taraf da whitelist dışıysa transferi reddeder", async function () {
      await artistToken.connect(artist).transfer(user.address, ethers.utils.parseEther("100"));

      // user (whitelist degil) -> other (whitelist degil): revert
      await expect(
        artistToken.connect(user).transfer(other.address, ethers.utils.parseEther("10"))
      ).to.be.revertedWith("Transfer restricted to whitelisted addresses");
    });

    it("alıcı whitelist'e eklenince transfer çalışır", async function () {
      await artistToken.connect(artist).transfer(user.address, ethers.utils.parseEther("100"));
      await artistToken.connect(artist).updateWhitelist(other.address, true);

      await artistToken.connect(user).transfer(other.address, ethers.utils.parseEther("10"));
      expect(await artistToken.balanceOf(other.address)).to.equal(ethers.utils.parseEther("10"));
    });

    it("kısıtlama kapatılınca herkes transfer edebilir", async function () {
      await artistToken.connect(artist).transfer(user.address, ethers.utils.parseEther("100"));
      await artistToken.connect(artist).setTransferRestriction(false);

      await artistToken.connect(user).transfer(other.address, ethers.utils.parseEther("10"));
      expect(await artistToken.balanceOf(other.address)).to.equal(ethers.utils.parseEther("10"));
    });
  });

  describe("Whitelist yönetimi", function () {
    it("WHITELIST_MANAGER güncelleyebilir", async function () {
      await artistToken.connect(artist).updateWhitelist(user.address, true);
      expect(await artistToken.whitelist(user.address)).to.equal(true);
    });

    it("yetkisiz adres güncelleyemez", async function () {
      await expect(
        artistToken.connect(user).updateWhitelist(other.address, true)
      ).to.be.reverted;
    });

    it("toplu whitelist güncelleme çalışır", async function () {
      await artistToken.connect(artist).updateWhitelistBatch([user.address, other.address], true);
      expect(await artistToken.whitelist(user.address)).to.equal(true);
      expect(await artistToken.whitelist(other.address)).to.equal(true);
    });
  });

  describe("Blacklist", function () {
    it("DEFAULT_ADMIN (factory) blacklist'e ekleyebilir ve transfer engellenir", async function () {
      await artistToken.connect(factory).updateBlacklist(user.address, true);

      // artist -> user (blacklisted): revert
      await expect(
        artistToken.connect(artist).transfer(user.address, ethers.utils.parseEther("10"))
      ).to.be.revertedWith("Address is blacklisted");
    });

    it("yetkisiz adres blacklist güncelleyemez", async function () {
      await expect(
        artistToken.connect(user).updateBlacklist(other.address, true)
      ).to.be.reverted;
    });
  });

  describe("updateSwapRate", function () {
    it("sanatçı oranı güncelleyebilir", async function () {
      await artistToken.connect(artist).updateSwapRate(ethers.utils.parseEther("20"));
      expect(await artistToken.swapRate()).to.equal(ethers.utils.parseEther("20"));
    });

    it("sıfır oran reddedilir", async function () {
      await expect(
        artistToken.connect(artist).updateSwapRate(0)
      ).to.be.revertedWith("Swap rate must be greater than 0");
    });

    it("sanatçı olmayan güncelleyemez", async function () {
      await expect(
        artistToken.connect(user).updateSwapRate(ethers.utils.parseEther("20"))
      ).to.be.revertedWith("Caller is not the artist");
    });
  });

  describe("Pausable", function () {
    it("PAUSER (factory) duraklatabilir ve transferler durur", async function () {
      await artistToken.connect(factory).pause();
      await expect(
        artistToken.connect(artist).transfer(user.address, ethers.utils.parseEther("10"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("yetkisiz adres duraklatamaz", async function () {
      await expect(artistToken.connect(user).pause()).to.be.reverted;
    });
  });

  describe("Burn", function () {
    it("sahip kendi token'ını yakabilir", async function () {
      const burnAmount = ethers.utils.parseEther("1000");
      await artistToken.connect(artist).burn(burnAmount);

      expect(await artistToken.balanceOf(artist.address)).to.equal(ARTIST_SHARE.sub(burnAmount));
      expect(await artistToken.totalSupply()).to.equal(MAX_SUPPLY.sub(burnAmount));
    });
  });
});
