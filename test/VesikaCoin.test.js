const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VesikaCoin", function () {
  let vesikaCoin;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const VesikaCoin = await ethers.getContractFactory("VesikaCoin");
    vesikaCoin = await VesikaCoin.deploy();
    await vesikaCoin.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const DEFAULT_ADMIN_ROLE = await vesikaCoin.DEFAULT_ADMIN_ROLE();
      expect(await vesikaCoin.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
    });

    it("Should have correct name and symbol", async function () {
      expect(await vesikaCoin.name()).to.equal("VesikaCoin");
      expect(await vesikaCoin.symbol()).to.equal("VSK");
    });

    it("Should mint initial supply to owner", async function () {
      const expectedSupply = ethers.utils.parseEther("20000000"); // 20M tokens
      expect(await vesikaCoin.balanceOf(owner.address)).to.equal(expectedSupply);
    });

    it("Should have correct max supply", async function () {
      const maxSupply = ethers.utils.parseEther("100000000"); // 100M tokens
      expect(await vesikaCoin.MAX_SUPPLY()).to.equal(maxSupply);
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Transfer some tokens to addr1 for testing
      await vesikaCoin.transfer(addr1.address, ethers.utils.parseEther("1000"));
    });

    it("Should allow staking", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days

      await vesikaCoin.connect(addr1).stake(stakeAmount, lockPeriod);

      const stakeInfo = await vesikaCoin.stakes(addr1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.lockPeriod).to.equal(lockPeriod);
      expect(stakeInfo.isActive).to.equal(true);
    });

    it("Should not allow staking with insufficient lock period", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      const lockPeriod = 29 * 24 * 60 * 60; // 29 days

      await expect(
        vesikaCoin.connect(addr1).stake(stakeAmount, lockPeriod)
      ).to.be.revertedWith("Minimum lock period is 30 days");
    });

    it("Should not allow staking when already staking", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days

      await vesikaCoin.connect(addr1).stake(stakeAmount, lockPeriod);

      await expect(
        vesikaCoin.connect(addr1).stake(stakeAmount, lockPeriod)
      ).to.be.revertedWith("Already staking");
    });

    it("Should calculate rewards correctly", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      const lockPeriod = 365 * 24 * 60 * 60; // 365 days

      await vesikaCoin.connect(addr1).stake(stakeAmount, lockPeriod);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const reward = await vesikaCoin.calculateReward(addr1.address);
      const expectedReward = stakeAmount.mul(15).div(100); // 15% APY for 365 days
      
      expect(reward).to.be.closeTo(expectedReward, ethers.utils.parseEther("1"));
    });

    it("Should allow unstaking after lock period", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days

      await vesikaCoin.connect(addr1).stake(stakeAmount, lockPeriod);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const balanceBefore = await vesikaCoin.balanceOf(addr1.address);
      await vesikaCoin.connect(addr1).unstake();
      const balanceAfter = await vesikaCoin.balanceOf(addr1.address);

      expect(balanceAfter.sub(balanceBefore)).to.equal(stakeAmount);

      const stakeInfo = await vesikaCoin.stakes(addr1.address);
      expect(stakeInfo.isActive).to.equal(false);
    });

    it("Should not allow unstaking before lock period", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days

      await vesikaCoin.connect(addr1).stake(stakeAmount, lockPeriod);

      await expect(
        vesikaCoin.connect(addr1).unstake()
      ).to.be.revertedWith("Lock period not finished");
    });
  });

  describe("Voting Power", function () {
    beforeEach(async function () {
      await vesikaCoin.transfer(addr1.address, ethers.utils.parseEther("1000"));
    });

    it("Should calculate voting power correctly without staking", async function () {
      const balance = await vesikaCoin.balanceOf(addr1.address);
      const votingPower = await vesikaCoin.getVotingPower(addr1.address);
      
      expect(votingPower).to.equal(balance);
    });

    it("Should calculate voting power correctly with staking", async function () {
      const stakeAmount = ethers.utils.parseEther("100");
      const lockPeriod = 30 * 24 * 60 * 60; // 30 days

      await vesikaCoin.connect(addr1).stake(stakeAmount, lockPeriod);

      const balance = await vesikaCoin.balanceOf(addr1.address);
      const votingPower = await vesikaCoin.getVotingPower(addr1.address);
      
      // Staking yapanlar 1.5x oy gücü alır
      const expectedVotingPower = balance.add(stakeAmount.mul(150).div(100));
      expect(votingPower).to.equal(expectedVotingPower);
    });
  });

  describe("Access Control", function () {
    it("Should allow minting by MINTER_ROLE", async function () {
      const MINTER_ROLE = await vesikaCoin.MINTER_ROLE();
      await vesikaCoin.grantRole(MINTER_ROLE, addr1.address);

      const mintAmount = ethers.utils.parseEther("1000");
      await vesikaCoin.connect(addr1).mint(addr2.address, mintAmount);

      expect(await vesikaCoin.balanceOf(addr2.address)).to.equal(mintAmount);
    });

    it("Should not allow minting without MINTER_ROLE", async function () {
      const mintAmount = ethers.utils.parseEther("1000");

      await expect(
        vesikaCoin.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.reverted;
    });

    it("Should not allow minting beyond max supply", async function () {
      const maxSupply = await vesikaCoin.MAX_SUPPLY();
      const currentSupply = await vesikaCoin.totalSupply();
      const excessAmount = maxSupply.sub(currentSupply).add(1);

      await expect(
        vesikaCoin.mint(addr1.address, excessAmount)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Pausable", function () {
    it("Should allow pausing by PAUSER_ROLE", async function () {
      await vesikaCoin.pause();
      expect(await vesikaCoin.paused()).to.equal(true);
    });

    it("Should not allow transfers when paused", async function () {
      await vesikaCoin.pause();

      await expect(
        vesikaCoin.transfer(addr1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow unpausing by PAUSER_ROLE", async function () {
      await vesikaCoin.pause();
      await vesikaCoin.unpause();
      
      expect(await vesikaCoin.paused()).to.equal(false);
    });
  });
});
