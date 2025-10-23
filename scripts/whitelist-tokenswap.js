const hre = require("hardhat");

async function main() {
  // Use artist account (account #1) which has WHITELIST_MANAGER_ROLE
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[1]; // Artist account
  
  // Deployment bilgilerini oku
  const deploymentPath = "./deployments/localhost.json";
  const deployment = require("." + deploymentPath);
  
  const artistTokenAddress = process.env.ARTIST_TOKEN_ADDRESS;
  
  if (!artistTokenAddress) {
    console.log("Usage: ARTIST_TOKEN_ADDRESS=0x... npx hardhat run scripts/whitelist-tokenswap.js --network localhost");
    process.exit(1);
  }
  
  const tokenSwapAddress = deployment.contracts.TokenSwap;
  
  console.log("Whitelisting TokenSwap for Artist Token:", artistTokenAddress);
  console.log("TokenSwap Address:", tokenSwapAddress);
  console.log("Signer:", signer.address);
  
  // Artist token kontratını bağla
  const ArtistToken = await hre.ethers.getContractFactory("ArtistToken");
  const artistToken = ArtistToken.attach(artistTokenAddress);
  
  // TokenSwap'i whitelist'e ekle
  console.log("\nAdding TokenSwap to whitelist...");
  const tx = await artistToken.updateWhitelist(tokenSwapAddress, true);
  await tx.wait();
  
  console.log("✅ TokenSwap successfully whitelisted!");
  console.log("Transaction hash:", tx.hash);
  
  // Verify
  const isWhitelisted = await artistToken.whitelist(deployment.TokenSwap);
  console.log("TokenSwap whitelisted status:", isWhitelisted);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
