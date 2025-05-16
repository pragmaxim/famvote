import React from 'react';
import { useConnect } from 'wagmi';

const ConnectWallet = () => {
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();

  return (
    <div className="connect-wallet">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {connector.name}
          {isLoading && connector.id === pendingConnector?.id && ' (connecting...)'}
        </button>
      ))}

      {error && <div className="text-red-500 mt-2">{error.message}</div>}
    </div>
  );
};

export default ConnectWallet;