import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { http, createConfig, WagmiConfig } from 'wagmi';
import { base } from 'wagmi/chains'
import { injected, metaMask, safe } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { localhostChain } from './chain';

const queryClient = new QueryClient();

export const config = createConfig({
    chains: [localhostChain, base],
    connectors: [
        injected(),
        metaMask(),
        safe(),
    ],
    transports: {
        [localhostChain.id]: http('http://127.0.0.1:8545'),
        [base.id]: http(),
    },
})

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
