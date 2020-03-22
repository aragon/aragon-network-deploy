const fs = require('fs')
const path = require('path')
const Config = require('../../../../data/input/court').rpc
const Governor = require('../../../../src/models/shared/Governor')
const Environment = require('../../../../src/models/shared/Environment')
const CourtDeployerV10 = require('../../../../src/models/deployers/CourtDeployer.v1.0')
const CourtUpgraderV11 = require('../../../../src/models/upgrades/CourtUpgrader.v1.1')

const SNAPSHOT_BLOCK = 0
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

contract('CourtUpgrader v1.1', ([_, governor]) => {
  let environment, DAI, ANJ
  let court, disputes, treasury, voting, registry, subscriptions
  let newCourt, newDisputes, newTreasury, newVoting, newRegistry, newSubscriptions

  const outputFilepath = path.resolve(process.cwd(), `./data/output/court.test.json`)

  const deployAndUpgrade = sender => {
    before('build environment and mock tokens and governor', async () => {
      environment = new Environment('rpc', sender)

      const ERC20 = await environment.getArtifact('ERC20Mock', '@aragon/court')
      DAI = await ERC20.new('DAI Token', 'DAI', 18)
      Config.court.feeToken.address = DAI.address
      Config.subscriptions.feeToken.address = DAI.address

      const MiniMeToken = await environment.getArtifact('MiniMeToken', '@aragon/minime')
      ANJ = await MiniMeToken.new(ZERO_ADDRESS, ZERO_ADDRESS, SNAPSHOT_BLOCK, 'Aragon Network Juror Token', 18, 'ANJ', true)
      Config.jurors.token.address = ANJ.address

      Config.governor.modules = Governor(governor)
    })

    before('deploy and upgrade', async () => {
      const AragonCourt = await environment.getArtifact('AragonCourt', '@aragon/court')
      const DisputeManager = await environment.getArtifact('DisputeManager', '@aragon/court')
      const CourtTreasury = await environment.getArtifact('CourtTreasury', '@aragon/court')
      const JurorsRegistry = await environment.getArtifact('JurorsRegistry', '@aragon/court')
      const CourtSubscriptions = await environment.getArtifact('CourtSubscriptions', '@aragon/court')
      const CRVoting = await environment.getArtifact('CRVoting', '@aragon/court')

      const deployerV0 = new CourtDeployerV10(Config, environment, outputFilepath)
      await deployerV0.call()
      const deployedContractsV0 = require(outputFilepath)

      court = await AragonCourt.at(deployedContractsV0.court.address)
      disputes = await DisputeManager.at(deployedContractsV0.disputes.address)
      treasury = await CourtTreasury.at(deployedContractsV0.treasury.address)
      registry = await JurorsRegistry.at(deployedContractsV0.registry.address)
      subscriptions = await CourtSubscriptions.at(deployedContractsV0.subscriptions.address)
      voting = await CRVoting.at(deployedContractsV0.voting.address)

      const deployerV1 = new CourtUpgraderV11(Config, environment, outputFilepath)
      await deployerV1.call()
      delete require.cache[require.resolve(outputFilepath)]
      const deployedContractsV1 = require(outputFilepath)

      newCourt = await AragonCourt.at(deployedContractsV1.court.address)
      newDisputes = await DisputeManager.at(deployedContractsV1.disputes.address)
      newTreasury = await CourtTreasury.at(deployedContractsV1.treasury.address)
      newRegistry = await JurorsRegistry.at(deployedContractsV1.registry.address)
      newSubscriptions = await CourtSubscriptions.at(deployedContractsV1.subscriptions.address)
      newVoting = await CRVoting.at(deployedContractsV1.voting.address)
    })

    after('delete deployment output', () => {
      if (fs.existsSync(outputFilepath)) fs.unlinkSync(outputFilepath)
    })
  }

  context('when the sender is the modules governor', () => {
    deployAndUpgrade(governor)

    it('only changes disputes, registry, and voting', async () => {
      assert.notEqual(disputes.address, newDisputes.address, 'dispute addresses do match')
      assert.notEqual(registry.address, newRegistry.address, 'registry addresses do match')
      assert.notEqual(voting.address, newVoting.address, 'voting addresses do match')

      assert.equal(court.address, newCourt.address, 'court addresses do not match')
      assert.equal(treasury.address, newTreasury.address, 'court addresses do not match')
      assert.equal(subscriptions.address, newSubscriptions.address, 'court addresses do not match')
    })

    it('sets the new modules', async () => {
      assert.equal(await court.getDisputeManager(), newDisputes.address, 'new dispute manager is not set')
      assert.equal(await court.getJurorsRegistry(), newRegistry.address, 'new juror registry is not set')
      assert.equal(await court.getVoting(), newVoting.address, 'new voting is not set')
    })
  })
})
