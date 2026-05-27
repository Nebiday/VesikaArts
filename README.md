# 🎨 Web3 Artist Token System (VesikaArts)

A complete Web3 ecosystem built around a central main token (VesikaCoin), where artists can create and trade their own ERC20 tokens.

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Smart Contracts](#-smart-contracts)
- [Frontend](#-frontend)
- [License](#-license)


## ✨ Features

### 🪙 VesikaCoin (VSK)

- Main ecosystem token
- Purchasable with ETH
- Provides liquidity for artist tokens
- Role-based permission system


### 🎭 Artist Token System

- Artist registration and approval mechanism
- Artists can deploy their own tokens after admin approval
- Customizable token parameters (name, symbol, supply)
- Secure deployment via factory pattern


### 💱 Token Swap & Liquidity

- VesikaCoin ↔ Artist Token swaps
- Automated Market Maker (AMM) model
- Liquidity pool management
- 0.3% swap fee
- Slippage protection


### 🛡️ Security

- Role-based access control (RBAC)
- Admin, Artist, and Liquidity Manager roles
- Whitelist system
- Reentrancy protection


## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│  - Artist Registration  - Token Management  - Swap UI   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Smart Contracts                        │
├─────────────────┬──────────────────┬────────────────────┤
│  VesikaCoin     │ ArtistToken      │   TokenSwap        │
│  (Main Token)   │ Factory          │   (AMM)            │
├─────────────────┼──────────────────┼────────────────────┤
│  VesikaSale     │ Artist Tokens    │   Liquidity        │
│  (ETH→VSK)      │ (ERC20)          │   Pools            │
└─────────────────┴──────────────────┴────────────────────┘
```

### Workflow

1. **Artist Registration**: The artist signs up with their profile information.
2. **Admin Approval**: The admin reviews and approves the artist.
3. **Token Request**: The approved artist defines their token parameters.
4. **Token Deployment**: The artist deploys their own token.
5. **Liquidity Pool**: A VSK-paired liquidity pool is created for the token.
6. **Trading**: Users can swap tokens freely.


## 🛠️ Tech Stack

### Smart Contracts

- **Solidity**: ^0.8.19
- **OpenZeppelin**: Secure contract libraries
- **Hardhat**: Development framework


### Frontend

- **React**: 18.x
- **Web3.js**: Blockchain interaction
- **React Router**: Page routing
- **CSS3**: Modern, responsive design


### Development Tools

- **Hardhat Network**: Local blockchain
- **Chai**: Testing framework
- **Ethers.js**: Ethereum library


## 🚀 Installation

### Requirements

- Node.js v16+
- npm v8+
- MetaMask browser extension


### Steps

1. **Clone the repository**

```bash
git clone https://github.com/Nebiday/VesikaArts.git
cd VesikaArts
```

2. **Install backend dependencies**

```bash
npm install
```

3. **Install frontend dependencies**

```bash
cd frontend
npm install
cd ..
```

4. **Compile smart contracts**

```bash
npx hardhat compile
```

5. **Run tests**

```bash
npx hardhat test
```


## 💻 Usage

### Local Development

1. **Start the Hardhat node** (Terminal 1)

```bash
npx hardhat node
```

2. **Deploy the contracts** (Terminal 2)

```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **Start the frontend** (Terminal 3)

```bash
cd frontend
npm start
```

4. **Configure MetaMask**
   - Network: Localhost 8545
   - Chain ID: 31337
   - Import one of the test accounts


### Deployment Addresses

The deploy script automatically saves contract addresses to `deployments/localhost/deployment.json`.


## 📜 Smart Contracts

### VesikaCoin.sol

The main ecosystem token. Implements the ERC20 standard with mint, burn, and authorization functions.

**Main Functions:**

- `mint(address to, uint256 amount)`: Mint tokens (ADMIN_ROLE)
- `burn(uint256 amount)`: Burn tokens
- `grantRole(bytes32 role, address account)`: Grant a role


### VesikaSale.sol

Allows users to purchase VesikaCoin with ETH.

**Main Functions:**

- `buyVSK()`: Purchase VSK in exchange for ETH
- `setInventory(uint256 amount)`: Set the sale inventory (ADMIN)
- `updateRate(uint256 rate)`: Update the VSK/ETH rate (ADMIN)


### ArtistTokenFactory.sol

Creation and management of artist tokens.

**Main Functions:**

- `registerArtist(...)`: Register an artist
- `approveArtist(address artist)`: Approve an artist (ADMIN)
- `requestTokenCreation(...)`: Request token creation
- `approveTokenRequest(uint256 requestId)`: Approve a token request (ADMIN)
- `deployToken(uint256 requestId)`: Deploy the token (Artist)


### TokenSwap.sol

Handles swaps between VesikaCoin and artist tokens.

**Main Functions:**

- `createLiquidityPool(...)`: Create a liquidity pool
- `swapVSKForArtistToken(...)`: VSK → Artist Token
- `swapArtistTokenForVSK(...)`: Artist Token → VSK
- `getAmountOut(...)`: Calculate swap output amount


## 🎨 Frontend

### Pages

- **`/`**: Home page — System overview
- **`/register`**: Artist registration form
- **`/artist`**: Artist dashboard (token management)
- **`/admin`**: Admin panel (approval operations)
- **`/buy`**: VSK purchase page
- **`/swap`**: Token swap interface


### Context API

**ContractContext**: Centrally manages all contract interactions.

- Contract instances
- Wallet connection
- Transaction functions


## 🧪 Testing

```bash
# Run all tests
npx hardhat test

# Run a specific test
npx hardhat test test/VesikaCoin.test.js

# Test coverage
npx hardhat coverage
```


## 🔐 Security

- ✅ Built on OpenZeppelin contracts
- ✅ Reentrancy guard implementation
- ✅ Role-based access control
- ✅ Input validation
- ✅ Safe transfer implementations


## 📝 License

MIT License — see the [LICENSE](https://github.com/Nebiday/VesikaArts/blob/main/LICENSE) file for details.


## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 📧 Contact

For questions, please use GitHub Issues.

---

⭐ If you like this project, don't forget to give it a star!
