const fs = require('fs')
const path = require('path')
const Config = require('../../data/config/court').rpc
const Verifier = require('../../src/models/Verifier')
const Environment = require('../../src/models/Environment')
const CourtDeployer = require('../../src/models/deployers/CourtDeployer')

const SNAPSHOT_BLOCK = 0
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

contract('Verifier', ([_, sender]) => {
  let environment, court, verifier

  const outputFilepath = path.resolve(process.cwd(), `./data/output/court.test.json`)

  before('build environment and mock tokens', async () => {
    environment = new Environment('rpc', sender)

    const ERC20 = await environment.getArtifact('ERC20Mock', '@aragon/court')
    const DAI = await ERC20.new('DAI Token', 'DAI', 18)
    Config.court.feeToken.address = DAI.address
    Config.subscriptions.feeToken.address = DAI.address

    const MiniMeToken = await environment.getArtifact('MiniMeToken', '@aragon/minime')
    const ANJ = await MiniMeToken.new(ZERO_ADDRESS, ZERO_ADDRESS, SNAPSHOT_BLOCK, 'Aragon Network Juror Token', 18, 'ANJ', true)
    Config.jurors.token.address = ANJ.address
  })

  before('deploy court', async () => {
    const deployer = new CourtDeployer(Config, environment, outputFilepath)
    await deployer.call()
    const deployedContracts = require(outputFilepath)
    const AragonCourt = await environment.getArtifact('AragonCourt', '@aragon/court')
    court = await AragonCourt.at(deployedContracts.court.address)
  })

  beforeEach('create verifier and mock test network domain', async () => {
    verifier = new Verifier(environment, 'API_KEY')
    verifier.getApiSubdomain = () => 'etherscan-rpc'
    verifier._fetchConstructor = () => ({ status: 200, data: { status: '1', result: [{ input: 'constructor' }] } })
  })

  after('delete deployment output', () => {
    if (fs.existsSync(outputFilepath)) fs.unlinkSync(outputFilepath)
  })

  context('when the contract can be verified', () => {
    beforeEach('mock successful verification', async () => {
      verifier._verify = () => ({ status: 200, data: { status: '1', result: 'GUID' } })
      verifier._fetchVerification = () => ({ status: 200, data: { status: '1' } })
    })

    it('verifies contract', async () => {
      const url = await verifier.call(court)
      assert.equal(url, `https://rpc.etherscan.io/address/${court.address}#code`, 'contract URL does not match')
    })
  })

  context('when the contract cannot be verified', () => {
    beforeEach('mock failing verification', async () => {
      verifier._verify = () => ({ status: 200, data: { status: '0', result: 'Something went wrong' } })
    })

    it('throws', async () => {
      try {
        await verifier.call(court)
      } catch (error) {
        assert.equal(error.message, 'Error while trying to verify contract: Something went wrong')
      }
    })
  })
})
