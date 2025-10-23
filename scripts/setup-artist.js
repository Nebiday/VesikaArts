const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0]; // Admin
  const artist = accounts[1];   // Artist
  
  // Deployment bilgilerini oku
  const deploymentPath = "./deployments/localhost.json";
  const deployment = require("." + deploymentPath);
  
  console.log("Setting up artist account...");
  console.log("Admin Address:", deployer.address);
  console.log("Artist Address:", artist.address);
  console.log("Factory Address:", deployment.contracts.ArtistTokenFactory);
  
  // Factory kontratını bağla
  const Factory = await hre.ethers.getContractFactory("ArtistTokenFactory");
  const factory = Factory.attach(deployment.contracts.ArtistTokenFactory);
  
  // 1. Artist kaydı yap
  console.log("\n1. Registering artist...");
  const metadata = JSON.stringify({
    name: "AI Bulut",
    bio: "Yapay zeka destekli müzik sanatçısı",
    website: "https://aibulut.com",
    socialMedia: "@aibulut",
    timestamp: Date.now()
  });
  
  const registerTx = await factory.connect(artist).registerArtist(metadata);
  await registerTx.wait();
  console.log("✅ Artist registered!");
  
  // 2. Artist'i onayla
  console.log("\n2. Approving artist...");
  const approveTx = await factory.connect(deployer).approveArtist(artist.address);
  await approveTx.wait();
  console.log("✅ Artist approved!");
  
  // 3. Artist bilgilerini kontrol et
  const artistInfo = await factory.artists(artist.address);
  console.log("\n=== ARTIST INFO ===");
  console.log("Registered:", artistInfo.isRegistered);
  console.log("Approved:", artistInfo.isApproved);
  console.log("Token Count:", artistInfo.tokenCount.toString());
  
  console.log("\n✅ Artist setup complete!");
  console.log("Artist can now create token requests from the frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
