import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useDisconnect } from 'wagmi';
import ConnectWallet from './ConnectWallet';

const Header = () => {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">🗳️ FamilyVote</Link>
        
        <nav className="flex items-center space-x-4">
          {isConnected && (
            <>
              <Link to="/" className="hover:text-blue-300">Polls</Link>
              <Link to="/create" className="hover:text-blue-300">Create Poll</Link>
              <div className="flex items-center ml-4">
                <span className="text-sm text-gray-300 mr-2">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button 
                  onClick={() => disconnect()}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Disconnect
                </button>
              </div>
            </>
          )}
          
          {!isConnected && <ConnectWallet />}
        </nav>
      </div>
    </header>
  );
};

export default Header;