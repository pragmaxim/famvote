import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAccount } from 'wagmi';
import Header from './components/Header';
import Home from './pages/Home';
import CreatePoll from './pages/CreatePoll';
import PollDetails from './pages/PollDetails';
import ConnectWallet from './components/ConnectWallet';

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="app">
      <Header />
      <main className="container mx-auto p-4">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-3xl font-bold mb-8">Welcome to FamilyVote DApp</h1>
            <p className="text-xl mb-8">Connect your wallet to get started</p>
            <ConnectWallet />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollDetails />} />
          </Routes>
        )}
      </main>
      <footer className="text-center p-4 mt-8 text-gray-500">
        <p>FamilyVote DApp - A decentralized voting app for family decisions</p>
      </footer>
    </div>
  );
}

export default App;