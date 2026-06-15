# 🎨 Web3 Artist Token System (VesikaArts)

A complete Web3 ecosystem built around a central main token (VesikaCoin), where artists can create and trade their own ERC20 tokens.

![Tests](https://img.shields.io/badge/tests-86%20passing-brightgreen) ![Solidity](https://img.shields.io/badge/solidity-0.8.19-blue) ![Network](https://img.shields.io/badge/deployed-Sepolia-purple) ![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Live Deployment

The frontend is live at **[https://vesika.art](https://vesika.art)**.

## 🌐 Live on Sepolia Testnet

All contracts are deployed and configured on the Ethereum **Sepolia** testnet (Chain ID `11155111`):

| Contract | Address |
|---|---|
| **VesikaCoin** | [`0xDE58A1893b518eDEDb5c0B7d502AB9F61B094654`](https://sepolia.etherscan.io/address/0xDE58A1893b518eDEDb5c0B7d502AB9F61B094654) |
| **ArtistTokenFactory** | [`0x1c623418A6fe6be4d753dc16163a241eD03b217D`](https://sepolia.etherscan.io/address/0x1c623418A6fe6be4d753dc16163a241eD03b217D) |
| **TokenSwap** | [`0x0264aAa29A87afbE8A3915fd977A614a649fd3AC`](https://sepolia.etherscan.io/address/0x0264aAa29A87afbE8A3915fd977A614a649fd3AC) |
| **VesikaSale** | [`0xC648E83a6bb5D51F3aa94A6d262b46F9Da3FECf4`](https://sepolia.etherscan.io/address/0xC648E83a6bb5D51F3aa94A6d262b46F9Da3FECf4) |

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
- **Ethers.js**: Blockchain interaction
- **React Router**: Page routing
- **CSS3**: Modern, responsive design


### Development Tools

- **Hardhat Network**: Local blockchain
- **Chai**: Testing framework
- **Ethers.js**: Ethereum library


## 🚀 Installation

### Requirements

- Node.js **18 or 20 LTS** (Hardhat does not support Node 23+/25)
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


### Deploying to Sepolia

1. Create a `.env` file in the project root (see `.env.example`):

```bash
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_deployer_private_key
ETHERSCAN_API_KEY=optional_for_verification
```

2. Deploy:

```bash
npm run deploy:sepolia
```

The deploy script automatically saves contract addresses to `deployments/<network>.json` and writes ABIs to `frontend/src/abis/`. The frontend reads Sepolia addresses from `frontend/src/deployments/sepolia.json`, so no extra configuration is required.


## 📜 Smart Contracts

### VesikaCoin.sol

The main ecosystem token. Implements the ERC20 standard with mint, burn, and authorization functions.

**Main Functions:**

- `mint(address to, uint256 amount)`: Mint tokens (MINTER_ROLE)
- `burn(uint256 amount)`: Burn tokens
- `grantRole(bytes32 role, address account)`: Grant a role


### VesikaSale.sol

Allows users to purchase VesikaCoin with ETH.

**Main Functions:**

- `buyVesika()`: Purchase VSK in exchange for ETH (payable)
- `setInventory(uint256 amount)`: Set the sale inventory (ADMIN)
- `updateRate(uint256 vskPerEth)`: Update the VSK/ETH rate (ADMIN)


### ArtistTokenFactory.sol

Creation and management of artist tokens.

**Main Functions:**

- `registerArtist(...)`: Register an artist
- `approveArtist(address artist)`: Approve an artist (APPROVER)
- `requestToken(...)`: Request token creation (approved artist)
- `approveTokenRequest(uint256 requestId)`: Approve a token request (APPROVER)
- `deployToken(uint256 requestId)`: Deploy the token (Artist only)


### TokenSwap.sol

Handles swaps between VesikaCoin and artist tokens.

**Main Functions:**

- `createPool(...)`: Create a liquidity pool (LIQUIDITY_MANAGER)
- `swapMainToArtist(...)`: VSK → Artist Token
- `swapArtistToMain(...)`: Artist Token → VSK
- `getAmountOut(...)`: Calculate swap output amount (constant-product AMM)


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

The project ships with **86 passing tests** covering all four contracts:

| Test Suite | Tests | Focus |
|---|---|---|
| `VesikaCoin.test.js` | 18 | Staking, voting power, minting, pausing |
| `ArtistTokenFactory.test.js` | 19 | Registration, approval, deployment, queries |
| `TokenSwap.test.js` | 13 | Pools, swap fees, **k-invariant**, slippage |
| `VesikaSale.test.js` | 17 | Purchases, inventory, limits, ETH withdrawal |
| `ArtistToken.test.js` | 19 | Transfer restrictions, whitelist/blacklist, burn |

```bash
# Run all tests
npx hardhat test

# Run a specific suite
npx hardhat test test/TokenSwap.test.js

# Gas report
REPORT_GAS=true npx hardhat test

# Coverage
npx hardhat coverage
```


## 🔐 Security

- ✅ Built on OpenZeppelin contracts
- ✅ Reentrancy guard implementation
- ✅ Role-based access control
- ✅ Input validation
- ✅ Safe transfer implementations

### Notable Bug Fixes

During development, a **critical AMM accounting bug** was identified and fixed in `TokenSwap`:

> The swap functions computed the output from the *full* input amount but only added the *fee-deducted* amount to the reserves. Over time this **drained the pool** and broke the constant-product invariant (`x * y = k`).

The fix deducts the fee from the input, computes the output on the fee-adjusted amount, and keeps the **full input (including fee) in the pool** so fees accrue to liquidity providers. This behaviour is now locked in by an invariant test asserting that `k` strictly increases after every swap (`test/TokenSwap.test.js`).


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
