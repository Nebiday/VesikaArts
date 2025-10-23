const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  const artist = accounts[1]; // Artist account
  
  // Deployment bilgilerini oku
  const deploymentPath = "./deployments/localhost.json";
  const deployment = require("." + deploymentPath);
  
  console.log("Granting LIQUIDITY_MANAGER_ROLE to artist...");
  console.log("Artist Address:", artist.address);
  console.log("TokenSwap Address:", deployment.contracts.TokenSwap);
  
  // TokenSwap kontratını bağla
  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const tokenSwap = TokenSwap.attach(deployment.contracts.TokenSwap);
  
  // Role grant et
  const LIQUIDITY_MANAGER_ROLE = await tokenSwap.LIQUIDITY_MANAGER_ROLE();
  const tx = await tokenSwap.connect(deployer).grantRole(LIQUIDITY_MANAGER_ROLE, artist.address);
  await tx.wait();
  
  console.log("✅ LIQUIDITY_MANAGER_ROLE granted to artist!");
  console.log("Transaction hash:", tx.hash);
  
  // Verify
  const hasRole = await tokenSwap.hasRole(LIQUIDITY_MANAGER_ROLE, artist.address);
  console.log("Artist has LIQUIDITY_MANAGER_ROLE:", hasRole);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
