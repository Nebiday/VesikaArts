const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtistTokenFactory", function () {
  let vesikaCoin, factory, artistToken;
  let owner, artist, approver, user;

  beforeEach(async function () {
    [owner, artist, approver, user] = await ethers.getSigners();

    // Deploy VesikaCoin
    const VesikaCoin = await ethers.getContractFactory("VesikaCoin");
    vesikaCoin = await VesikaCoin.deploy();
    await vesikaCoin.deployed();

    // Deploy Factory
    const ArtistTokenFactory = await ethers.getContractFactory("ArtistTokenFactory");
    factory = await ArtistTokenFactory.deploy(vesikaCoin.address);
    await factory.deployed();

    // Grant APPROVER_ROLE to approver
    const APPROVER_ROLE = await factory.APPROVER_ROLE();
    await factory.grantRole(APPROVER_ROLE, approver.address);
  });

  describe("Artist Registration", function () {
    it("Should allow artist registration", async function () {
      const metadata = "ipfs://QmArtistProfile123";
      
      await factory.connect(artist).registerArtist(metadata);
      
      const artistInfo = await factory.getArtistInfo(artist.address);
      expect(artistInfo.isRegistered).to.equal(true);
      expect(artistInfo.isApproved).to.equal(false);
      expect(artistInfo.profileMetadata).to.equal(metadata);
    });

    it("Should not allow duplicate registration", async function () {
      const metadata = "ipfs://QmArtistProfile123";
      
      await factory.connect(artist).registerArtist(metadata);
      
      await expect(
        factory.connect(artist).registerArtist(metadata)
      ).to.be.revertedWith("Artist already registered");
    });

    it("Should allow artist approval", async function () {
      const metadata = "ipfs://QmArtistProfile123";
      
      await factory.connect(artist).registerArtist(metadata);
      await factory.connect(approver).approveArtist(artist.address);
      
      const artistInfo = await factory.getArtistInfo(artist.address);
      expect(artistInfo.isApproved).to.equal(true);
    });

    it("Should not allow approval of unregistered artist", async function () {
      await expect(
        factory.connect(approver).approveArtist(artist.address)
      ).to.be.revertedWith("Artist not registered");
    });
  });

  describe("Token Request", function () {
    beforeEach(async function () {
      // Register and approve artist
      await factory.connect(artist).registerArtist("ipfs://QmArtistProfile123");
      await factory.connect(approver).approveArtist(artist.address);
    });

    it("Should allow token request by approved artist", async function () {
      const tokenParams = {
        name: "ArtistToken1",
        symbol: "ART1",
        maxSupply: ethers.utils.parseEther("1000000"),
        initialSwapRate: ethers.utils.parseEther("10"),
        description: "Artist's first token",
        metadata: "ipfs://QmTokenMetadata123"
      };

      const tx = await factory.connect(artist).requestToken(
        tokenParams.name,
        tokenParams.symbol,
        tokenParams.maxSupply,
        tokenParams.initialSwapRate,
        tokenParams.description,
        tokenParams.metadata
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "TokenRequested");
      const requestId = event.args.requestId;

      const requestDetails = await factory.getRequestDetails(requestId);
      expect(requestDetails.artist).to.equal(artist.address);
      expect(requestDetails.name).to.equal(tokenParams.name);
      expect(requestDetails.symbol).to.equal(tokenParams.symbol);
      expect(requestDetails.approved).to.equal(false);
      expect(requestDetails.deployed).to.equal(false);
    });

    it("Should not allow token request by unapproved artist", async function () {
      await factory.connect(user).registerArtist("ipfs://QmUserProfile123");

      await expect(
        factory.connect(user).requestToken(
          "UserToken",
          "USR",
          ethers.utils.parseEther("1000000"),
          ethers.utils.parseEther("10"),
          "User's token",
          "ipfs://QmTokenMetadata123"
        )
      ).to.be.revertedWith("Artist not approved");
    });

    it("Should not allow empty token name", async function () {
      await expect(
        factory.connect(artist).requestToken(
          "",
          "ART1",
          ethers.utils.parseEther("1000000"),
          ethers.utils.parseEther("10"),
          "Description",
          "ipfs://QmTokenMetadata123"
        )
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should not allow zero max supply", async function () {
      await expect(
        factory.connect(artist).requestToken(
          "ArtistToken1",
          "ART1",
          0,
          ethers.utils.parseEther("10"),
          "Description",
          "ipfs://QmTokenMetadata123"
        )
      ).to.be.revertedWith("Max supply must be greater than 0");
    });
  });

  describe("Token Approval and Deployment", function () {
    let requestId;

    beforeEach(async function () {
      // Register and approve artist
      await factory.connect(artist).registerArtist("ipfs://QmArtistProfile123");
      await factory.connect(approver).approveArtist(artist.address);

      // Create token request
      const tx = await factory.connect(artist).requestToken(
        "ArtistToken1",
        "ART1",
        ethers.utils.parseEther("1000000"),
        ethers.utils.parseEther("10"),
        "Artist's first token",
        "ipfs://QmTokenMetadata123"
      );

      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "TokenRequested");
      requestId = event.args.requestId;
    });

    it("Should allow token request approval", async function () {
      await factory.connect(approver).approveTokenRequest(requestId);

      const requestDetails = await factory.getRequestDetails(requestId);
      expect(requestDetails.approved).to.equal(true);
    });

    it("Should not allow approval of non-existent request", async function () {
      await expect(
        factory.connect(approver).approveTokenRequest(999)
      ).to.be.revertedWith("Request does not exist");
    });

    it("Should allow token deployment after approval", async function () {
      await factory.connect(approver).approveTokenRequest(requestId);
      
      const tx = await factory.deployToken(requestId);
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === "TokenDeployed");
      
      expect(event.args.requestId).to.equal(requestId);
      expect(event.args.artist).to.equal(artist.address);

      const requestDetails = await factory.getRequestDetails(requestId);
      expect(requestDetails.deployed).to.equal(true);
      expect(requestDetails.tokenAddress).to.not.equal(ethers.constants.AddressZero);

      // Check if token is in deployed tokens list
      expect(await factory.isDeployedToken(requestDetails.tokenAddress)).to.equal(true);
    });

    it("Should not allow deployment without approval", async function () {
      await expect(
        factory.deployToken(requestId)
      ).to.be.revertedWith("Request not approved");
    });

    it("Should not allow double deployment", async function () {
      await factory.connect(approver).approveTokenRequest(requestId);
      await factory.deployToken(requestId);

      await expect(
        factory.deployToken(requestId)
      ).to.be.revertedWith("Token already deployed");
    });
  });

  describe("Query Functions", function () {
    let requestId1, requestId2;

    beforeEach(async function () {
      // Register and approve artist
      await factory.connect(artist).registerArtist("ipfs://QmArtistProfile123");
      await factory.connect(approver).approveArtist(artist.address);

      // Create multiple token requests
      const tx1 = await factory.connect(artist).requestToken(
        "ArtistToken1",
        "ART1",
        ethers.utils.parseEther("1000000"),
        ethers.utils.parseEther("10"),
        "Artist's first token",
        "ipfs://QmTokenMetadata123"
      );
      const receipt1 = await tx1.wait();
      requestId1 = receipt1.events.find(e => e.event === "TokenRequested").args.requestId;

      const tx2 = await factory.connect(artist).requestToken(
        "ArtistToken2",
        "ART2",
        ethers.utils.parseEther("2000000"),
        ethers.utils.parseEther("20"),
        "Artist's second token",
        "ipfs://QmTokenMetadata456"
      );
      const receipt2 = await tx2.wait();
      requestId2 = receipt2.events.find(e => e.event === "TokenRequested").args.requestId;
    });

    it("Should return pending requests", async function () {
      const pendingRequests = await factory.getPendingRequests();
      expect(pendingRequests.length).to.equal(2);
      expect(pendingRequests).to.include(requestId1);
      expect(pendingRequests).to.include(requestId2);
    });

    it("Should return approved requests", async function () {
      await factory.connect(approver).approveTokenRequest(requestId1);

      const approvedRequests = await factory.getApprovedRequests();
      expect(approvedRequests.length).to.equal(1);
      expect(approvedRequests[0]).to.equal(requestId1);
    });

    it("Should return artist tokens after deployment", async function () {
      await factory.connect(approver).approveTokenRequest(requestId1);
      await factory.deployToken(requestId1);

      const artistTokens = await factory.getArtistTokens(artist.address);
      expect(artistTokens.length).to.equal(1);

      const artistInfo = await factory.getArtistInfo(artist.address);
      expect(artistInfo.tokenCount).to.equal(1);
    });

    it("Should return all deployed tokens", async function () {
      await factory.connect(approver).approveTokenRequest(requestId1);
      await factory.connect(approver).approveTokenRequest(requestId2);
      await factory.deployToken(requestId1);
      await factory.deployToken(requestId2);

      const allTokens = await factory.getAllDeployedTokens();
      expect(allTokens.length).to.equal(2);
    });
  });

  describe("Pausable", function () {
    beforeEach(async function () {
      await factory.connect(artist).registerArtist("ipfs://QmArtistProfile123");
      await factory.connect(approver).approveArtist(artist.address);
    });

    it("Should not allow token requests when paused", async function () {
      await factory.pause();

      await expect(
        factory.connect(artist).requestToken(
          "ArtistToken1",
          "ART1",
          ethers.utils.parseEther("1000000"),
          ethers.utils.parseEther("10"),
          "Description",
          "ipfs://QmTokenMetadata123"
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow token requests after unpause", async function () {
      await factory.pause();
      await factory.unpause();

      await expect(
        factory.connect(artist).requestToken(
          "ArtistToken1",
          "ART1",
          ethers.utils.parseEther("1000000"),
          ethers.utils.parseEther("10"),
          "Description",
          "ipfs://QmTokenMetadata123"
        )
      ).to.not.be.reverted;
    });
  });
});
