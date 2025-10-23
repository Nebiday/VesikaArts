const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Deployment bilgilerini oku
  const deploymentPath = "./deployments/localhost.json";
  const deployment = require("." + deploymentPath);
  
  const artistAddress = process.env.ARTIST_ADDRESS;
  const amount = process.env.AMOUNT || "1000"; // Default 1000 VSK
  
  if (!artistAddress) {
    console.log("Usage: ARTIST_ADDRESS=0x... AMOUNT=1000 npx hardhat run scripts/send-artist-bonus.js --network localhost");
    process.exit(1);
  }
  
  console.log("Sending VesikaCoin bonus to artist...");
  console.log("Artist Address:", artistAddress);
  console.log("Amount:", amount, "VSK");
  console.log("VesikaCoin Address:", deployment.contracts.VesikaCoin);
  
  // VesikaCoin kontratını bağla
  const VesikaCoin = await hre.ethers.getContractFactory("VesikaCoin");
  const vesikaCoin = VesikaCoin.attach(deployment.contracts.VesikaCoin);
  
  // Mint VSK to artist
  const amountWei = hre.ethers.utils.parseEther(amount);
  const tx = await vesikaCoin.connect(deployer).mint(artistAddress, amountWei);
  await tx.wait();
  
  console.log("✅ VesikaCoin bonus sent to artist!");
  console.log("Transaction hash:", tx.hash);
  
  // Verify balance
  const balance = await vesikaCoin.balanceOf(artistAddress);
  console.log("Artist VSK balance:", hre.ethers.utils.formatEther(balance), "VSK");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
