const BaseDeployer = require('./BaseDeployer')
const CallsEncoder = require('../CallsEncoder')
const logger = require('../../helpers/logger')('CourtDeployer')
const { MAX_UINT64, tokenToString } = require('../../helpers/numbers')

const VERSION = 'v1.1'

const VERIFICATION_HEADERS = [
  'Commit sha: ffc48f55ad10b0b307a5553090bcb4c291cedbc4',
  'GitHub repository: https://github.com/aragon/aragon-court',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier, logger)
    this.config = config
  }

  async call() {
    await this.loadCourt()
    await this.loadOrDeployDisputes()
    await this.loadOrDeployRegistry()
    await this.loadOrDeployVoting()
    await this.setModules()
    await this.verifyContracts()
  }

  async loadCourt() {
    const { court } = this.previousDeploy
    const AragonCourt = await this.environment.getArtifact('AragonCourt', '@aragon/court')

    if (court && court.address) await this._loadAragonCourt(AragonCourt, court.address)
    else throw Error('Missing previous Aragon Court deploy')
  }

  async loadOrDeployDisputes() {
    const { disputes } = this.previousDeploy
    const DisputeManager = await this.environment.getArtifact('DisputeManager', '@aragon/court')

    if (disputes && disputes.address && disputes.version === VERSION) await this._loadDisputes(DisputeManager, disputes.address)
    else await this._deployDisputes(DisputeManager)
  }

  async loadOrDeployRegistry() {
    const { registry } = this.previousDeploy
    const JurorsRegistry = await this.environment.getArtifact('JurorsRegistry', '@aragon/court')

    if (registry && registry.address && registry.version === VERSION) await this._loadRegistry(JurorsRegistry, registry.address)
    else await this._deployRegistry(JurorsRegistry)
  }

  async loadOrDeployVoting() {
    const { voting } = this.previousDeploy
    const Voting = await this.environment.getArtifact('CRVoting', '@aragon/court')

    if (voting && voting.address && voting.version === VERSION) await this._loadVoting(Voting, voting.address)
    else await this._deployVoting(Voting)
  }

  async setModules() {
    const { controller } = this.config
    const sender = await this.environment.getSender()
    const modulesGovernor = await this.court.getModulesGovernor()

    if (modulesGovernor === sender) {
      logger.info('Setting modules...')
      const ids = [controller.disputes, controller.voting, controller.registry]
      const implementations = [this.disputes, this.voting, this.registry].map(i => i.address)
      await this.court.setModules(ids, implementations)
      logger.success('Modules set successfully')
    } else {
      logger.info('Submitting a vote to governor to set modules...')
      await this._setModulesThroughVoting(modulesGovernor, [
        { id: controller.disputes, address: this.disputes.address, name: 'DisputeManager' },
        { id: controller.registry, address: this.registry.address, name: 'JurorsRegistry' },
        { id: controller.voting, address: this.voting.address, name: 'Voting' },
      ])
      logger.success(`Vote submitted successfully`)
    }
  }

  async verifyContracts() {
    if (this.verifier) {
      await this._verifyDisputes()
      await this._verifyRegistry()
      await this._verifyVoting()
    }
  }

  /** loading methods **/

  async _loadAragonCourt(AragonCourt, address) {
    logger.warn(`Using previous deployed AragonCourt instance at ${address}`)
    this.court = await AragonCourt.at(address)
  }

  async _loadDisputes(DisputeManager, address) {
    logger.warn(`Using previous deployed DisputeManager instance at ${address}`)
    this.disputes = await DisputeManager.at(address)
  }

  async _loadRegistry(JurorsRegistry, address) {
    logger.warn(`Using previous deployed JurorsRegistry instance at ${address}`)
    this.registry = await JurorsRegistry.at(address)
  }

  async _loadVoting(Voting, address) {
    logger.warn(`Using previous deployed Voting instance at ${address}`)
    this.voting = await Voting.at(address)
  }

  /** deploying methods **/

  async _deployDisputes(DisputeManager) {
    if (!this.court.address) throw Error('AragonCourt has not been deployed yet')
    this._printDisputesDeploy()
    this.disputes = await DisputeManager.new(this.court.address, this.config.court.maxJurorsPerDraftBatch)
    const { address, transactionHash } = this.disputes
    logger.success(`Created DisputeManager instance at ${address}`)
    this._saveDeploy({ disputes: { address, transactionHash, version: VERSION }})
  }

  async _deployRegistry(JurorsRegistry) {
    if (!this.court.address) throw Error('AragonCourt has not been deployed yet')
    const { court, jurors } = this.config

    const anj = jurors.token.address || this.anj.address
    const totalActiveBalanceLimit = jurors.minActiveBalance.mul(MAX_UINT64.div(court.finalRoundWeightPrecision))
    this._printRegistryDeploy(anj, totalActiveBalanceLimit)

    this.registry = await JurorsRegistry.new(this.court.address, anj, totalActiveBalanceLimit)
    const { address, transactionHash } = this.registry
    logger.success(`Created JurorsRegistry instance at ${address}`)
    this._saveDeploy({ registry: { address, transactionHash, version: VERSION }})
  }

  async _deployVoting(Voting) {
    if (!this.court.address) throw Error('AragonCourt has not been deployed yet')
    this._printVotingDeploy()
    this.voting = await Voting.new(this.court.address)
    const { address, transactionHash } = this.voting
    logger.success(`Created Voting instance at ${address}`)
    this._saveDeploy({ voting: { address, transactionHash, version: VERSION }})
  }

  /** voting methods **/

  async _setModulesThroughVoting(governor, modules) {
    const { voting, tokenManager } = this.config.aragonNetworkDAO
    if (!voting) throw Error('Missing governor DAO voting app address, please provide one')
    if (!tokenManager) throw Error('Missing governor DAO voting app address, please provide one')

    const encoder = new CallsEncoder()
    const ids = modules.map(module => module.id)
    const addresses = modules.map(module => module.address)
    const description = modules.reduce((text, { id, address, name }) => `${text}\n${name} (ID ${id}) to ${address}`, 'Set modules:')

    const setModulesData = encoder.encodeSetModules(ids, addresses)
    const executeData = encoder.encodeExecute(this.court.address, 0, setModulesData)
    const agentCallsScript = encoder.encodeCallsScript([{ to: governor, data: executeData }])
    const votingCallScript = encoder.encodeNewVote(agentCallsScript, description)
    const tokenManagerCallScript = encoder.encodeCallsScript([{ to: voting, data: votingCallScript }])

    const TokenManager = await this.environment.getArtifact('TokenManager', '@aragon/apps-token-manager')
    const manager = await TokenManager.at(tokenManager)
    await manager.forward(tokenManagerCallScript)
  }

  /** verifying methods **/

  async _verifyDisputes() {
    const disputes = this.previousDeploy.disputes
    if (!disputes || !disputes.verification) {
      const url = await this.verifier.call(this.disputes, '@aragon/court', VERIFICATION_HEADERS)
      const { address, transactionHash, version } = disputes
      this._saveDeploy({ disputes: { address, transactionHash, version, verification: url } })
    }
  }

  async _verifyRegistry() {
    const registry = this.previousDeploy.registry
    if (!registry || !registry.verification) {
      const url = await this.verifier.call(this.registry, '@aragon/court', VERIFICATION_HEADERS)
      const { address, transactionHash, version } = registry
      this._saveDeploy({ registry: { address, transactionHash, version, verification: url } })
    }
  }

  async _verifyVoting() {
    const voting = this.previousDeploy.voting
    if (!voting || !voting.verification) {
      const url = await this.verifier.call(this.voting, '@aragon/court', VERIFICATION_HEADERS)
      const { address, transactionHash, version } = voting
      this._saveDeploy({ voting: { address, transactionHash, version, verification: url } })
    }
  }

  /** logging methods **/

  _printDisputesDeploy() {
    logger.info(`Deploying DisputeManager contract ${VERSION} with config:`)
    logger.info(` - Controller:                              ${this.court.address}`)
    logger.info(` - Max number of jurors per draft batch:    ${this.config.court.maxJurorsPerDraftBatch}`)
  }

  _printRegistryDeploy(anjAddress, totalActiveBalanceLimit) {
    const { jurors } = this.config
    logger.info(`Deploying JurorsRegistry contract ${VERSION} with config:`)
    logger.info(` - Controller:                              ${this.court.address}`)
    logger.info(` - Jurors token:                            ${jurors.token.symbol} at ${anjAddress}`)
    logger.info(` - Minimum ANJ active balance:              ${tokenToString(jurors.minActiveBalance, jurors.token)}`)
    logger.info(` - Total ANJ active balance limit:          ${tokenToString(totalActiveBalanceLimit, jurors.token)}`)
  }

  _printVotingDeploy() {
    logger.info(`Deploying Voting contract ${VERSION} with config:`)
    logger.info(` - Controller:                              ${this.court.address}`)
  }
}
