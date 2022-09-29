import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { networkConfigs, developmentChains } from '../helper-hardhat-config'
import { verify } from '../utils/verify'

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts()
    const chainId = hre.network.config.chainId
    let ethUsdPriceFeedAddress: string

    if (developmentChains.includes(hre.network.name)) {
        const ethUsdAggregator = await hre.deployments.get('MockV3Aggregator')
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfigs[chainId!].ethUsdPriceFeed
    }

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await hre.deployments.deploy('FundMe', {
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: hre.network.config.blockConfirmations || 1,
    })

    console.log(`Deployed to network ${hre.network.name}`)

    if (
        !developmentChains.includes(hre.network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    console.log('----------------------------------------------')
}

export default func
func.id = 'testnet'
func.tags = ['all', 'fundme']
