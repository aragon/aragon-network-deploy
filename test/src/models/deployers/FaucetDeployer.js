const fs = require('fs')
const path = require('path')
const Config = require('../../../../data/input/faucet').rpc
const Environment = require('../../../../src/models/shared/Environment')
const FaucetDeployer = require('../../../../src/models/deployers/FaucetDeployer')

const { bigExp } = require('../../../../src/helpers/numbers')
const { assertBn } = require('../../../helpers/assertBn')

const ONE_DAY = 60 * 60 * 24
const SNAPSHOT_BLOCK = 0
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

contract('FaucetDeployer', ([_, sender]) => {
  let environment, faucet, DAI, ANJ

  const outputFilepath = path.resolve(process.cwd(), `./data/output/faucet.test.json`)

  before('build environment and mock tokens', async () => {
    environment = new Environment('rpc', sender)

    const MiniMeToken = await environment.getArtifact('MiniMeToken', '@aragon/minime')
    DAI = await MiniMeToken.new(ZERO_ADDRESS, ZERO_ADDRESS, SNAPSHOT_BLOCK, 'DAI Token', 18, 'DAI', true)
    ANJ = await MiniMeToken.new(ZERO_ADDRESS, ZERO_ADDRESS, SNAPSHOT_BLOCK, 'Aragon Network Juror Token', 18, 'ANJ', true)

    Config.tokens = [
      {
        symbol:   'ANJ',
        address:  ANJ.address,
        period:   ONE_DAY,
        amount:   bigExp(1000, 18)
      },
      {
        symbol:   'DAI',
        address:  DAI.address,
        period:   ONE_DAY,
        amount:   bigExp(10000, 18)
      }
    ]
  })

  beforeEach('deploy', async () => {
    const deployer = new FaucetDeployer(Config, environment, outputFilepath)
    await deployer.call()
    const deployedFaucet = require(outputFilepath)

    const ERC20Faucet = await environment.getArtifact('ERC20Faucet', '@aragon/erc20-faucet')
    faucet = await ERC20Faucet.at(deployedFaucet.address)
  })

  afterEach('delete deployment output', () => {
    if (fs.existsSync(outputFilepath)) fs.unlinkSync(outputFilepath)
  })

  it('sets the specified token quotas', async () => {
    const { period: DAIperiod, amount: DAIquota } = await faucet.getQuota(DAI.address)
    assertBn(DAIperiod, ONE_DAY, 'DAI period does not match')
    assertBn(DAIquota, bigExp(10000, 18), 'DAI quota does not match')

    const { period: ANJperiod, amount: ANJquota } = await faucet.getQuota(ANJ.address)
    assertBn(ANJperiod, ONE_DAY, 'ANJ period does not match')
    assertBn(ANJquota, bigExp(1000, 18), 'ANJ quota does not match')
  })

  it('sets the owner to the sender', async () => {
    const owner = await faucet.getOwner()
    assert.equal(owner, sender, 'faucet owner does not match')
  })
})
