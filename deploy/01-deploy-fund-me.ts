import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { networkConfigs } from '../helper-hardhat-config'

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts()
    const chainId = hre.network.config.chainId
    const ethUsdPriceFeedAddress = networkConfigs[chainId!].ethUsdPriceFeed

    const fundMe = await hre.deployments.deploy('FundMe', {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address
        log: true,
    })

    console.log(`Deployed to network ${hre.network.name}`)
    console.log('----------------------------------------------')
}

export default func
func.id = 'testnet'
func.tags = ['testnet']
