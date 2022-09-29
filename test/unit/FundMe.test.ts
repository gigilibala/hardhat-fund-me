import { assert, expect } from 'chai'
import { deployments, ethers, getNamedAccounts } from 'hardhat'
import { FundMe, MockV3Aggregator } from '../../typechain-types'

describe('FundMe', async function() {
    let fundMe: FundMe
    let deployer: string
    let mockV3Aggregator: MockV3Aggregator
    const sendValue = ethers.utils.parseEther('1')
    beforeEach(async function() {
        // const accounts = await ethers.getSigners()
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(['all'])
        fundMe = await ethers.getContract('FundMe', deployer)
        mockV3Aggregator = await ethers.getContract(
            'MockV3Aggregator',
            deployer
        )
    })

    describe('constructor', async function() {
        it('Sets the aggregator addresses correctly', async function() {
            const response = await fundMe.s_priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe('fund', async function() {
        it('Fails if you do not send enough eth', async function() {
            await expect(fundMe.fund()).to.be.reverted
        })

        it('update the mounte of funds', async function() {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.s_addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it('add funder to array of funders', async function() {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.s_funders(0)
            assert.equal(funder, deployer)
        })
    })

    describe('withdraw', async function() {
        beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        it('withdraw ETH from a single funder', async function() {
            // arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // assert
            assert.equal(endingFundMeBalance.toString(), '0')
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it('Allow withdraw multiple funders', async function() {
            // arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // assert
            assert.equal(endingFundMeBalance.toString(), '0')
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            await expect(fundMe.s_funders(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    (
                        await fundMe.s_addressToAmountFunded(
                            accounts[i].address
                        )
                    ).toString(),
                    '0'
                )
            }
        })

        it('only allow owner to withdraw', async function() {
            const accounts = await ethers.getSigners()
            const attackerConnectedContract = fundMe.connect(accounts[1])

            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
        })

        it('cheaper withdraw with multiple funders', async function() {
            // arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // assert
            assert.equal(endingFundMeBalance.toString(), '0')
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            await expect(fundMe.s_funders(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    (
                        await fundMe.s_addressToAmountFunded(
                            accounts[i].address
                        )
                    ).toString(),
                    '0'
                )
            }
        })
    })
})
