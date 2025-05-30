import {Chain} from "viem/chains";

export const localhostChain: Chain = {
    id: 31337,
    name: 'Anvil Localhost',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['http://127.0.0.1:8545'],
        },
        public: {
            http: ['http://127.0.0.1:8545'],
        },
    }
};
