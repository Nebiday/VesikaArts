const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VesikaSale", function () {
  let vesikaCoin, vesikaSale;
  let owner, buyer, other;

  const INVENTORY = ethers.utils.parseEther("1000000"); // 1M VSK satışa hazır

  beforeEach(async function () {
    [owner, buyer, other] = await ethers.getSigners();

    const VesikaCoin = await ethers.getContractFactory("VesikaCoin");
    vesikaCoin = await VesikaCoin.deploy();
    await vesikaCoin.deployed();

    const VesikaSale = await ethers.getContractFactory("VesikaSale");
    vesikaSale = await VesikaSale.deploy(vesikaCoin.address);
    await vesikaSale.deployed();

    // Satış kontratına mint yetkisi ver ve envanteri ayarla
    const MINTER_ROLE = await vesikaCoin.MINTER_ROLE();
    await vesikaCoin.grantRole(MINTER_ROLE, vesikaSale.address);
    await vesikaSale.setInventory(INVENTORY);
  });

  describe("Deployment", function () {
    it("varsayılan oran ve limitleri ayarlar", async function () {
      expect(await vesikaSale.vskPerEth()).to.equal(ethers.utils.parseEther("1000"));
      expect(await vesikaSale.minPurchase()).to.equal(ethers.utils.parseEther("0.01"));
      expect(await vesikaSale.maxPurchase()).to.equal(ethers.utils.parseEther("10"));
    });

    it("admin rolünü deployer'a verir", async function () {
      const ADMIN_ROLE = await vesikaSale.ADMIN_ROLE();
      expect(await vesikaSale.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    });
  });

  describe("calculateVsk", function () {
    it("ETH miktarına göre doğru VSK hesaplar", async function () {
      const vsk = await vesikaSale.calculateVsk(ethers.utils.parseEther("2"));
      expect(vsk).to.equal(ethers.utils.parseEther("2000")); // 2 ETH * 1000
    });
  });

  describe("buyVesika", function () {
    it("ETH karşılığı doğru miktarda VSK mint eder", async function () {
      const ethAmount = ethers.utils.parseEther("1");
      const expectedVsk = ethers.utils.parseEther("1000");

      await expect(
        vesikaSale.connect(buyer).buyVesika({ value: ethAmount })
      ).to.emit(vesikaSale, "VesikaPurchased").withArgs(buyer.address, ethAmount, expectedVsk);

      expect(await vesikaCoin.balanceOf(buyer.address)).to.equal(expectedVsk);
    });

    it("istatistikleri ve envanteri günceller", async function () {
      const ethAmount = ethers.utils.parseEther("1");
      const expectedVsk = ethers.utils.parseEther("1000");

      await vesikaSale.connect(buyer).buyVesika({ value: ethAmount });

      expect(await vesikaSale.totalSold()).to.equal(expectedVsk);
      expect(await vesikaSale.totalEthRaised()).to.equal(ethAmount);
      expect(await vesikaSale.userPurchases(buyer.address)).to.equal(expectedVsk);
      expect(await vesikaSale.availableForSale()).to.equal(INVENTORY.sub(expectedVsk));
    });

    it("min altındaki alımı reddeder", async function () {
      await expect(
        vesikaSale.connect(buyer).buyVesika({ value: ethers.utils.parseEther("0.001") })
      ).to.be.revertedWith("Amount too small");
    });

    it("max üzerindeki alımı reddeder", async function () {
      await expect(
        vesikaSale.connect(buyer).buyVesika({ value: ethers.utils.parseEther("11") })
      ).to.be.revertedWith("Amount too large");
    });

    it("envanter yetersizse reddeder", async function () {
      await vesikaSale.setInventory(ethers.utils.parseEther("100")); // 1 ETH = 1000 VSK > 100
      await expect(
        vesikaSale.connect(buyer).buyVesika({ value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("Not enough VSK available for sale");
    });

    it("duraklatılmışken alım yapılamaz", async function () {
      await vesikaSale.pause();
      await expect(
        vesikaSale.connect(buyer).buyVesika({ value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Envanter yönetimi", function () {
    it("admin envanter ekleyebilir", async function () {
      await vesikaSale.addInventory(ethers.utils.parseEther("500"));
      expect(await vesikaSale.availableForSale()).to.equal(INVENTORY.add(ethers.utils.parseEther("500")));
    });

    it("admin olmayan envanter ekleyemez", async function () {
      await expect(
        vesikaSale.connect(other).addInventory(ethers.utils.parseEther("500"))
      ).to.be.reverted;
    });
  });

  describe("updateRate", function () {
    it("admin oranı güncelleyebilir ve hesaplama değişir", async function () {
      await vesikaSale.updateRate(ethers.utils.parseEther("2000"));
      const vsk = await vesikaSale.calculateVsk(ethers.utils.parseEther("1"));
      expect(vsk).to.equal(ethers.utils.parseEther("2000"));
    });

    it("sıfır oran reddedilir", async function () {
      await expect(vesikaSale.updateRate(0)).to.be.revertedWith("Rate must be positive");
    });
  });

  describe("updateLimits", function () {
    it("geçerli limitleri günceller", async function () {
      await vesikaSale.updateLimits(ethers.utils.parseEther("0.05"), ethers.utils.parseEther("20"));
      expect(await vesikaSale.minPurchase()).to.equal(ethers.utils.parseEther("0.05"));
      expect(await vesikaSale.maxPurchase()).to.equal(ethers.utils.parseEther("20"));
    });

    it("max <= min ise reddeder", async function () {
      await expect(
        vesikaSale.updateLimits(ethers.utils.parseEther("5"), ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Max must be greater than min");
    });
  });

  describe("withdrawEth", function () {
    it("admin biriken ETH'i çekebilir", async function () {
      await vesikaSale.connect(buyer).buyVesika({ value: ethers.utils.parseEther("1") });

      const contractBalBefore = await ethers.provider.getBalance(vesikaSale.address);
      expect(contractBalBefore).to.equal(ethers.utils.parseEther("1"));

      await vesikaSale.withdrawEth();

      const contractBalAfter = await ethers.provider.getBalance(vesikaSale.address);
      expect(contractBalAfter).to.equal(0);
    });

    it("çekilecek ETH yoksa reddeder", async function () {
      await expect(vesikaSale.withdrawEth()).to.be.revertedWith("No ETH to withdraw");
    });
  });
});
