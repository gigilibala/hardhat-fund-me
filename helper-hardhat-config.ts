type NetworkConfig = {
    name: string
    ethUsdPriceFeed: string
}

export const networkConfigs: Record<number, NetworkConfig> = {
    5: {
        name: 'goerli',
        ethUsdPriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    },
}

export const developmentChains = ['hardhat', 'localhost']
export const DECIMALS = 8
export const INITIAL_ANSWER = 200000000000
