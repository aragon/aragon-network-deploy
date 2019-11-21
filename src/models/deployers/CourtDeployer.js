const BaseDeployer = require('./BaseDeployer')
const logger = require('../../helpers/logger')('CourtDeployer')
const { MAX_UINT64, tokenToString } = require('../../helpers/numbers')

const VERIFICATION_HEADERS = [
  'Commit sha: development', // TODO: update with tagged version
  'GitHub repository: https://github.com/aragon/aragon-court',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier, logger)
    this.config = config
  }

  async call() {
    await this.loadOrDeployCourt()
    await this.loadOrDeployDisputes()
    await this.loadOrDeployRegistry()
    await this.loadOrDeployVoting()
    await this.loadOrDeployTreasury()
    await this.loadOrDeploySubscriptions()
    await this.setModules()
    await this.transferGovernor()
    await this.transferANJController()
    await this.verifyContracts()
  }

  async loadOrDeployCourt() {
    const { court } = this.previousDeploy
    const AragonCourt = await this.environment.getArtifact('AragonCourt', '@aragon/court')

    if (court && court.address) await this._loadAragonCourt(AragonCourt, court.address)
    else await this._deployAragonCourt(AragonCourt)
  }

  async loadOrDeployDisputes() {
    const { disputes } = this.previousDeploy
    const DisputeManager = await this.environment.getArtifact('DisputeManager', '@aragon/court')

    if (disputes && disputes.address) await this._loadDisputes(DisputeManager, disputes.address)
    else await this._deployDisputes(DisputeManager)
  }

  async loadOrDeployRegistry() {
    const { registry } = this.previousDeploy
    const JurorsRegistry = await this.environment.getArtifact('JurorsRegistry', '@aragon/court')

    if (registry && registry.address) await this._loadRegistry(JurorsRegistry, registry.address)
    else await this._deployRegistry(JurorsRegistry)
  }

  async loadOrDeployVoting() {
    const { voting } = this.previousDeploy
    const Voting = await this.environment.getArtifact('CRVoting', '@aragon/court')

    if (voting && voting.address) await this._loadVoting(Voting, voting.address)
    else await this._deployVoting(Voting)
  }

  async loadOrDeployTreasury() {
    const { treasury } = this.previousDeploy
    const Treasury = await this.environment.getArtifact('CourtTreasury', '@aragon/court')

    if (treasury && treasury.address) await this._loadTreasury(Treasury, treasury.address)
    else await this._deployTreasury(Treasury)
  }

  async loadOrDeploySubscriptions() {
    const { subscriptions } = this.previousDeploy
    const Subscriptions = await this.environment.getArtifact('CourtSubscriptions', '@aragon/court')

    if (subscriptions && subscriptions.address) await this._loadSubscriptions(Subscriptions, subscriptions.address)
    else await this._deploySubscriptions(Subscriptions)
  }

  async setModules() {
    const sender = await this.environment.getSender()
    const modulesGovernor = await this.court.getModulesGovernor()

    if (modulesGovernor === sender) {
      logger.info('Setting modules...')
      const { controller } = this.config
      const ids = [controller.disputes, controller.treasury, controller.voting, controller.registry, controller.subscriptions]
      const implementations = [this.disputes, this.treasury, this.voting, this.registry, this.subscriptions].map(i => i.address)
      await this.court.setModules(ids, implementations)
      logger.success('Modules set successfully')
    } else {
      logger.warn('Cannot set modules since sender is no longer the modules governor')
    }
  }

  async transferGovernor() {
    const sender = await this.environment.getSender()
    const modulesGovernor = await this.court.getModulesGovernor()
    const { governor: { modules } } = this.config

    if (modulesGovernor === sender) {
      logger.info(`Transferring modules governor to ${modules} ...`)
      await this.court.changeModulesGovernor(modules)
      logger.success(`Modules governor transferred successfully to ${modules}`)
    } else if (modulesGovernor === modules) {
      logger.success(`Modules governor is already set to ${modules}`)
    } else {
      logger.warn('Modules governor is already set to another address')
    }
  }

  async transferANJController() {
    const sender = await this.environment.getSender()
    const MiniMeToken = await this.environment.getArtifact('MiniMeToken', '@aragon/minime')
    const { governor: { funds }, jurors: { token: { address } } } = this.config
    this.anj = await MiniMeToken.at(address)

    const controller = await this.anj.controller()
    if (controller === sender) {
      logger.info(`Transferring ANJ controller to funds governor ${funds} ...`)
      await this.anj.changeController(funds)
      logger.success(`ANJ token controller transferred successfully to funds governor ${funds}`)
    } else if (controller === funds) {
      logger.success(`ANJ token controller is already set to funds governor ${funds}`)
    } else {
      logger.warn('ANJ token controller is already set to another address')
    }
  }

  async verifyContracts() {
    if (this.verifier) {
      await this._verifyAragonCourt()
      await this._verifyDisputes()
      await this._verifyRegistry()
      await this._verifyVoting()
      await this._verifyTreasury()
      await this._verifySubscriptions()
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

  async _loadTreasury(Treasury, address) {
    logger.warn(`Using previous deployed Treasury instance at ${address}`)
    this.treasury = await Treasury.at(address)
  }

  async _loadSubscriptions(Subscriptions, address) {
    logger.warn(`Using previous deployed Subscriptions instance at ${address}`)
    this.subscriptions = await Subscriptions.at(address)
  }

  /** deploying methods **/

  async _deployAragonCourt(AragonCourt) {
    this._printAragonCourtDeploy()
    const sender = await this.environment.getSender()
    const { clock, governor, court, jurors } = this.config

    if (!court.feeToken.address) {
      const erc20 = await this._deployERC20Mock(court.feeToken)
      court.feeToken.address = erc20.address
    }

    this.court = await AragonCourt.new(
      [clock.termDuration, clock.firstTermStartTime],
      [governor.funds, governor.config, sender],
      court.feeToken.address,
      [court.jurorFee, court.draftFee, court.settleFee],
      [court.evidenceTerms, court.commitTerms, court.revealTerms, court.appealTerms, court.appealConfirmTerms],
      [court.penaltyPct, court.finalRoundReduction],
      [court.firstRoundJurorsNumber, court.appealStepFactor, court.maxRegularAppealRounds, court.finalRoundLockTerms],
      [court.appealCollateralFactor, court.appealConfirmCollateralFactor],
      jurors.minActiveBalance
    )

    const { address, transactionHash } = this.court
    logger.success(`Created AragonCourt instance at ${address}`)
    this._saveDeploy({ court: { address, transactionHash }})
  }

  async _deployDisputes(DisputeManager) {
    if (!this.court.address) throw Error('AragonCourt has not been deployed yet')
    this._printDisputesDeploy()
    this.disputes = await DisputeManager.new(this.court.address, this.config.court.maxJurorsPerDraftBatch)
    const { address, transactionHash } = this.disputes
    logger.success(`Created DisputeManager instance at ${address}`)
    this._saveDeploy({ disputes: { address, transactionHash }})
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
    this._saveDeploy({ registry: { address, transactionHash }})
  }

  async _deployVoting(Voting) {
    if (!this.court.address) throw Error('AragonCourt has not been deployed yet')
    this._printVotingDeploy()
    this.voting = await Voting.new(this.court.address)
    const { address, transactionHash } = this.voting
    logger.success(`Created Voting instance at ${address}`)
    this._saveDeploy({ voting: { address, transactionHash }})
  }

  async _deployTreasury(Treasury) {
    if (!this.court.address) throw Error('AragonCourt has not been deployed yet')
    this._printTreasuryDeploy()
    this.treasury = await Treasury.new(this.court.address)
    const { address, transactionHash } = this.treasury
    logger.success(`Created Treasury instance at ${address}`)
    this._saveDeploy({ treasury: { address, transactionHash }})
  }

  async _deploySubscriptions(Subscriptions) {
    if (!this.court.address) throw Error('AragonCourt has not been deployed yet')
    this._printSubscriptionsDeploy()
    const { subscriptions } = this.config

    if (!subscriptions.feeToken.address) {
      const erc20 = await this._deployERC20Mock(subscriptions.feeToken)
      subscriptions.feeToken.address = erc20.address
    }

    this.subscriptions = await Subscriptions.new(
      this.court.address,
      subscriptions.periodDuration,
      subscriptions.feeToken.address,
      subscriptions.feeAmount,
      subscriptions.prePaymentPeriods,
      subscriptions.resumePrePaidPeriods,
      subscriptions.latePaymentPenaltyPct,
      subscriptions.governorSharePct
    )

    const { address, transactionHash } = this.subscriptions
    logger.success(`Created Subscriptions instance at ${address}`)
    this._saveDeploy({ subscriptions: { address, transactionHash }})
  }

  /** verifying methods **/

  async _verifyAragonCourt() {
    const court = this.previousDeploy.court
    if (!court || !court.verification) {
      const url = await this.verifier.call(this.court, VERIFICATION_HEADERS)
      const { address, transactionHash } = court
      this._saveDeploy({ court: { address, transactionHash, verification: url } })
    }
  }

  async _verifyDisputes() {
    const disputes = this.previousDeploy.disputes
    if (!disputes || !disputes.verification) {
      const url = await this.verifier.call(this.disputes, VERIFICATION_HEADERS)
      const { address, transactionHash } = disputes
      this._saveDeploy({ disputes: { address, transactionHash, verification: url } })
    }
  }

  async _verifyRegistry() {
    const registry = this.previousDeploy.registry
    if (!registry || !registry.verification) {
      const url = await this.verifier.call(this.registry, VERIFICATION_HEADERS)
      const { address, transactionHash } = registry
      this._saveDeploy({ registry: { address, transactionHash, verification: url } })
    }
  }

  async _verifyVoting() {
    const voting = this.previousDeploy.voting
    if (!voting || !voting.verification) {
      const url = await this.verifier.call(this.voting, VERIFICATION_HEADERS)
      const { address, transactionHash } = voting
      this._saveDeploy({ voting: { address, transactionHash, verification: url } })
    }
  }

  async _verifyTreasury() {
    const treasury = this.previousDeploy.treasury
    if (!treasury || !treasury.verification) {
      const url = await this.verifier.call(this.treasury, VERIFICATION_HEADERS)
      const { address, transactionHash } = treasury
      this._saveDeploy({ treasury: { address, transactionHash, verification: url } })
    }
  }

  async _verifySubscriptions() {
    const subscriptions = this.previousDeploy.subscriptions
    if (!subscriptions || !subscriptions.verification) {
      const url = await this.verifier.call(this.subscriptions, VERIFICATION_HEADERS)
      const { address, transactionHash } = subscriptions
      this._saveDeploy({ subscriptions: { address, transactionHash, verification: url } })
    }
  }

  /** logging methods **/

  _printAragonCourtDeploy() {
    const { clock, governor, court, jurors } = this.config
    logger.info('Deploying AragonCourt contract with config:')
    logger.info(` - Funds governor:                          ${governor.funds}`)
    logger.info(` - Config governor:                         ${governor.config}`)
    logger.info(` - Modules governor:                        ${governor.modules} (initially sender)`)
    logger.info(` - Term duration:                           ${clock.termDuration.toString()} seconds`)
    logger.info(` - First term start time:                   ${new Date(clock.firstTermStartTime.toNumber() * 1000)}`)
    logger.info(` - Fee token:                               ${court.feeToken.symbol} at ${court.feeToken.address}`)
    logger.info(` - Juror fee:                               ${tokenToString(court.jurorFee, court.feeToken)}`)
    logger.info(` - Draft fee:                               ${tokenToString(court.draftFee, court.feeToken)}`)
    logger.info(` - Settle fee:                              ${tokenToString(court.settleFee, court.feeToken)}`)
    logger.info(` - Evidence terms:                          ${court.evidenceTerms.toString()}`)
    logger.info(` - Commit terms:                            ${court.commitTerms.toString()}`)
    logger.info(` - Reveal terms:                            ${court.revealTerms.toString()}`)
    logger.info(` - Appeal terms:                            ${court.appealTerms.toString()}`)
    logger.info(` - Appeal confirmation terms:               ${court.appealConfirmTerms.toString()}`)
    logger.info(` - Juror penalty permyriad:                 ${court.penaltyPct.toString()} ‱`)
    logger.info(` - First round jurors number:               ${court.firstRoundJurorsNumber.toString()}`)
    logger.info(` - Appeal step factor:                      ${court.appealStepFactor.toString()}`)
    logger.info(` - Max regular appeal rounds:               ${court.maxRegularAppealRounds.toString()}`)
    logger.info(` - Final round reduction:                   ${court.finalRoundReduction.toString()} ‱`)
    logger.info(` - Final round lock terms:                  ${court.finalRoundLockTerms.toString()}`)
    logger.info(` - Appeal collateral factor:                ${court.appealCollateralFactor.toString()} ‱`)
    logger.info(` - Appeal confirmation collateral factor:   ${court.appealConfirmCollateralFactor.toString()} ‱`)
    logger.info(` - Minimum ANJ active balance :             ${tokenToString(jurors.minActiveBalance, jurors.token)}`)
  }

  _printDisputesDeploy() {
    logger.info('Deploying Court contract with config:')
    logger.info(` - Controller:                              ${this.court.address}`)
    logger.info(` - Max number of jurors per draft batch:    ${this.config.court.maxJurorsPerDraftBatch}`)
  }

  _printRegistryDeploy(anjAddress, totalActiveBalanceLimit) {
    const { jurors } = this.config
    logger.info('Deploying JurorsRegistry contract with config:')
    logger.info(` - Controller:                              ${this.court.address}`)
    logger.info(` - Jurors token:                            ${jurors.token.symbol} at ${anjAddress}`)
    logger.info(` - Minimum ANJ active balance:              ${tokenToString(jurors.minActiveBalance, jurors.token)}`)
    logger.info(` - Total ANJ active balance limit:          ${tokenToString(totalActiveBalanceLimit, jurors.token)}`)
  }

  _printVotingDeploy() {
    logger.info('Deploying Voting contract with config:')
    logger.info(` - Controller:                              ${this.court.address}`)
  }

  _printTreasuryDeploy() {
    logger.info('Deploying Treasury contract with config:')
    logger.info(` - Controller:                              ${this.court.address}`)
  }

  _printSubscriptionsDeploy() {
    const { subscriptions } = this.config
    logger.info('Deploying Subscriptions contract with config:')
    logger.info(` - Controller:                              ${this.court.address}`)
    logger.info(` - Period duration:                         ${subscriptions.periodDuration} terms`)
    logger.info(` - Fee token:                               ${subscriptions.feeToken.symbol} at ${subscriptions.feeToken.address}`)
    logger.info(` - Fee amount:                              ${tokenToString(subscriptions.feeAmount, subscriptions.feeToken)}`)
    logger.info(` - Pre payment periods:                     ${subscriptions.prePaymentPeriods.toString()} periods`)
    logger.info(` - Resume pre-paid periods:                 ${subscriptions.resumePrePaidPeriods.toString()} periods`)
    logger.info(` - Late payment penalty:                    ${subscriptions.latePaymentPenaltyPct.toString()} ‱`)
    logger.info(` - Governor share:                          ${subscriptions.governorSharePct.toString()} ‱`)
  }
}
