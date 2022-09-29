import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/dist/types'

import {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} from '../helper-hardhat-config'

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts()

    if (developmentChains.includes(hre.network.name)) {
        console.log('Local network detected! Deploying mocks...')
        await hre.deployments.deploy('MockV3Aggregator', {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        console.log('Mocks deployed!')
        console.log('----------------------------------------------------')
    }
}

export default func
func.id = 'deploy_mock'
func.tags = ['all', 'mocks']
