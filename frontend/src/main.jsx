import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { http, createConfig, WagmiConfig, WagmiProvider } from 'wagmi';
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected, metaMask, safe } from 'wagmi/connectors'
import App from './App';
import './index.css';
import { localhostChain } from './chain';

const queryClient = new QueryClient()
export const config = createConfig({
    chains: [localhostChain, base],
    connectors: [
        injected(),
        metaMask(),
        safe(),
    ],
    transports: {
        [localhostChain.id]: http(localhostChain.rpcUrls.default.http[0]),
        [base.id]: http(),
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <WagmiConfig config={config}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </QueryClientProvider>
            </WagmiProvider>
        </WagmiConfig>
    </React.StrictMode>
);
