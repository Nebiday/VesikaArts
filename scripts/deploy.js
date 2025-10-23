const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // 1. VesikaCoin (Ana Token) Deploy
  console.log("\n1. Deploying VesikaCoin...");
  const VesikaCoin = await ethers.getContractFactory("VesikaCoin");
  const vesikaCoin = await VesikaCoin.deploy();
  await vesikaCoin.deployed();
  console.log("VesikaCoin deployed to:", vesikaCoin.address);

  // 2. ArtistTokenFactory Deploy
  console.log("\n2. Deploying ArtistTokenFactory...");
  const ArtistTokenFactory = await ethers.getContractFactory("ArtistTokenFactory");
  const factory = await ArtistTokenFactory.deploy(vesikaCoin.address);
  await factory.deployed();
  console.log("ArtistTokenFactory deployed to:", factory.address);

  // 3. TokenSwap Deploy
  console.log("\n3. Deploying TokenSwap...");
  const TokenSwap = await ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(vesikaCoin.address, factory.address);
  await tokenSwap.deployed();
  console.log("TokenSwap deployed to:", tokenSwap.address);

  // 4. VesikaSale Deploy
  console.log("\n4. Deploying VesikaSale...");
  const VesikaSale = await ethers.getContractFactory("VesikaSale");
  const vesikaSale = await VesikaSale.deploy(vesikaCoin.address);
  await vesikaSale.deployed();
  console.log("VesikaSale deployed to:", vesikaSale.address);

  // 5. İlk yapılandırma
  console.log("\n5. Initial configuration...");

  // Factory'ye MINTER_ROLE ver
  const MINTER_ROLE = await vesikaCoin.MINTER_ROLE();
  await vesikaCoin.grantRole(MINTER_ROLE, factory.address);
  console.log("Granted MINTER_ROLE to factory");

  // VesikaSale'e MINTER_ROLE ver (VSK satışı için)
  await vesikaCoin.grantRole(MINTER_ROLE, vesikaSale.address);
  console.log("Granted MINTER_ROLE to VesikaSale");

  // TokenSwap'e LIQUIDITY_MANAGER_ROLE ver
  const LIQUIDITY_MANAGER_ROLE = await tokenSwap.LIQUIDITY_MANAGER_ROLE();
  await tokenSwap.grantRole(LIQUIDITY_MANAGER_ROLE, deployer.address);
  console.log("Granted LIQUIDITY_MANAGER_ROLE to deployer");

  // Factory'ye TokenSwap adresini set et
  await factory.setTokenSwap(tokenSwap.address);
  console.log("Set TokenSwap address in Factory");
  console.log("Factory will mint 1000 VSK to each approved artist automatically");

  // Deployment bilgilerini kaydet
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      VesikaCoin: vesikaCoin.address,
      ArtistTokenFactory: factory.address,
      TokenSwap: tokenSwap.address,
      VesikaSale: vesikaSale.address
    },
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Network:", deploymentInfo.network);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("VesikaCoin:", deploymentInfo.contracts.VesikaCoin);
  console.log("ArtistTokenFactory:", deploymentInfo.contracts.ArtistTokenFactory);
  console.log("TokenSwap:", deploymentInfo.contracts.TokenSwap);
  console.log("VesikaSale:", deploymentInfo.contracts.VesikaSale);
  console.log("Block Number:", deploymentInfo.blockNumber);

  // Deployment bilgilerini dosyaya kaydet
  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentFile}`);

  // Frontend için ABI'ları kaydet
  const abisDir = path.join(__dirname, '../frontend/src/abis');
  if (!fs.existsSync(abisDir)) {
    fs.mkdirSync(abisDir, { recursive: true });
  }

  // Contract ABI'larını al ve kaydet
  const vesikaCoinABI = vesikaCoin.interface.format(ethers.utils.FormatTypes.json);
  const factoryABI = factory.interface.format(ethers.utils.FormatTypes.json);
  const tokenSwapABI = tokenSwap.interface.format(ethers.utils.FormatTypes.json);
  const vesikaSaleABI = vesikaSale.interface.format(ethers.utils.FormatTypes.json);

  fs.writeFileSync(path.join(abisDir, 'VesikaCoin.json'), vesikaCoinABI);
  fs.writeFileSync(path.join(abisDir, 'ArtistTokenFactory.json'), factoryABI);
  fs.writeFileSync(path.join(abisDir, 'TokenSwap.json'), tokenSwapABI);
  fs.writeFileSync(path.join(abisDir, 'VesikaSale.json'), vesikaSaleABI);

  console.log("ABIs saved to frontend/src/abis/");

  // Verification için bilgileri göster
  console.log("\n=== VERIFICATION COMMANDS ===");
  console.log(`npx hardhat verify --network ${hre.network.name} ${vesikaCoin.address}`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${factory.address} "${vesikaCoin.address}"`);
  console.log(`npx hardhat verify --network ${hre.network.name} ${tokenSwap.address} "${vesikaCoin.address}" "${factory.address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
