import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiConfig, createConfig } from 'wagmi';
import { http } from 'viem';
import { localhost } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MetaMaskConnector } from '@wagmi/connectors/metaMask';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

const config = createConfig({
    connectors: [
        new MetaMaskConnector({
            chains: [localhost],
        }),
    ],
    chains: [localhost],
    transports: {
        [localhost.id]: http(), // 👈 comes from viem
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <WagmiConfig config={config}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </QueryClientProvider>
        </WagmiConfig>
    </React.StrictMode>
);
