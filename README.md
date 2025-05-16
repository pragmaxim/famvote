# 🗳️ FamilyVote DApp

A lightweight decentralized voting app for family decisions, built with [Foundry](https://book.getfoundry.sh/), Solidity, and a minimal [React](https://reactjs.org/) frontend.

You can create polls like **"What’s for dinner?"** and allow only specific family members to vote. Results are stored and displayed on-chain.

---

## ✨ Features

### 🔐 Smart Contract (Solidity)
- Create a poll with:
    - Question
    - Choices (e.g., Pizza, Pasta)
    - Whitelisted voter addresses
    - Voting deadline (in seconds)
- Only allowed voters can vote
- Each voter can vote once per poll
- Anyone can read:
    - Current results
    - Past polls

### 🧪 Tests (Foundry)
- Deploys the `FamilyVote` contract
- Creates a test poll with 2 voters and 2 choices
- Casts a vote and checks the results

### 🖥️ Frontend (React + Viem + Wagmi)
> First version runs against **Avil local node only** for demo/dev

- Connect your wallet (Metamask etc.)
- Create a new poll
- See active and past polls
- Vote on active polls (if you're whitelisted)
- View results and expiration time

---

## 🛠️ Installation

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/) or `npm`
- [Anvil](https://book.getfoundry.sh/anvil/) (comes with Foundry)

---

### 🔧 Clone & Install

```bash
git clone https://github.com/your-username/familyvote-dapp.git
cd familyvote-dapp

# Install dependencies for frontend
cd frontend
yarn install
