const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Deployment bilgilerini oku
  const deploymentPath = "./deployments/localhost.json";
  const deployment = require("." + deploymentPath);
  
  const amount = process.env.AMOUNT || "10000"; // Default 10,000 VSK
  
  console.log("Setting VesikaSale inventory...");
  console.log("Admin Address:", deployer.address);
  console.log("VesikaSale Address:", deployment.contracts.VesikaSale);
  console.log("Amount:", amount, "VSK");
  
  // VesikaSale kontratını bağla
  const VesikaSale = await hre.ethers.getContractFactory("VesikaSale");
  const vesikaSale = VesikaSale.attach(deployment.contracts.VesikaSale);
  
  // Envanter ayarla
  const amountWei = hre.ethers.utils.parseEther(amount);
  const tx = await vesikaSale.connect(deployer).setInventory(amountWei);
  await tx.wait();
  
  console.log("✅ Inventory set successfully!");
  console.log("Transaction hash:", tx.hash);
  
  // Verify
  const available = await vesikaSale.availableForSale();
  console.log("Available for sale:", hre.ethers.utils.formatEther(available), "VSK");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
