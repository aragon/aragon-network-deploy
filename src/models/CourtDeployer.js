const fs = require('fs')
const Deployer = require('./Deployer')
const logger = require('../helpers/logger')('CourtDeployer')
const { MAX_UINT64, tokenToString } = require('../helpers/numbers')

module.exports = class extends Deployer {
  constructor(config, environment, output) {
    super(environment, output, logger)
    this.config = config
  }

  async call() {
    // TODO: remove mocked tokens and force re-deploy
    await this.mockTokens()

    await this.loadOrDeployController()
    await this.loadOrDeployCourt()
    await this.loadOrDeployRegistry()
    await this.loadOrDeployVoting()
    await this.loadOrDeployTreasury()
    await this.loadOrDeploySubscriptions()
    await this.setModules()
    await this.transferGovernor()
  }

  async mockTokens() {
    // force drop previous deploy otherwise mocked tokens won't exist
    this.previousDeploy = {}
    const ERC20 = await this.environment.getArtifact('ERC20Mock')

    const ANJ = await ERC20.new('ANJ Token', 'ANJ', 18)
    this.config.jurors.token.address = ANJ.address

    const DAI = await ERC20.new('DAI Token', 'ANJ', 18)
    this.config.court.feeToken.address = DAI.address
    this.config.subscriptions.feeToken.address = DAI.address
  }

  async loadOrDeployController() {
    const { controller } = this.previousDeploy
    const Controller = await this.environment.getArtifact('Controller')

    if (controller && controller.address) await this._loadController(Controller, controller.address)
    else await this._deployController(Controller)
  }

  async loadOrDeployCourt() {
    const { court } = this.previousDeploy
    const Court = await this.environment.getArtifact('Court')

    if (court && court.address) await this._loadCourt(Court, court.address)
    else await this._deployCourt(Court)
  }

  async loadOrDeployRegistry() {
    const { registry } = this.previousDeploy
    const JurorsRegistry = await this.environment.getArtifact('JurorsRegistry')

    if (registry && registry.address) await this._loadRegistry(JurorsRegistry, registry.address)
    else await this._deployRegistry(JurorsRegistry)
  }

  async loadOrDeployVoting() {
    const { voting } = this.previousDeploy
    const Voting = await this.environment.getArtifact('CRVoting')

    if (voting && voting.address) await this._loadVoting(Voting, voting.address)
    else await this._deployVoting(Voting)
  }

  async loadOrDeployTreasury() {
    const { treasury } = this.previousDeploy
    const Treasury = await this.environment.getArtifact('CourtTreasury')

    if (treasury && treasury.address) await this._loadTreasury(Treasury, treasury.address)
    else await this._deployTreasury(Treasury)
  }

  async loadOrDeploySubscriptions() {
    const { subscriptions } = this.previousDeploy
    const Subscriptions = await this.environment.getArtifact('CourtSubscriptions')

    if (subscriptions && subscriptions.address) await this._loadSubscriptions(Subscriptions, subscriptions.address)
    else await this._deploySubscriptions(Subscriptions)
  }

  async setModules() {
    const sender = await this.environment.getSender()
    const modulesGovernor = await this.controller.getModulesGovernor()

    if (modulesGovernor === sender) {
      logger.info('Setting modules...')
      const { controller } = this.config
      const ids = [controller.court, controller.treasury, controller.voting, controller.registry, controller.subscriptions]
      const implementations = [this.court, this.treasury, this.voting, this.registry, this.subscriptions].map(i => i.address)
      await this.controller.setModules(ids, implementations)
      logger.success('Modules set successfully')
    } else {
      logger.warn('Cannot set modules since sender is no longer the modules governor')
    }
  }

  async transferGovernor() {
    const sender = await this.environment.getSender()
    const modulesGovernor = await this.controller.getModulesGovernor()
    const { governor: { modules } } = this.config

    if (modulesGovernor === sender) {
      logger.info(`Transferring modules governor to ${modules} ...`)
      await this.controller.changeModulesGovernor(modules)
      logger.success('Modules governor transferred successfully')
    } else if (modulesGovernor === modules) {
      logger.success(`Modules governor is already set to ${modules}`)
    } else {
      logger.warn('Modules governor is already set to another address')
    }
  }

  /** loading methods **/

  async _loadController(Controller, address) {
    logger.warn(`Using previous deployed Controller instance at ${address}`)
    this.controller = await Controller.at(address)
  }

  async _loadCourt(Court, address) {
    logger.warn(`Using previous deployed Court instance at ${address}`)
    this.court = await Court.at(address)
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

  async _deployController(Controller) {
    this._printControllerDeploy()
    const sender = await this.environment.getSender()
    const { clock, governor, court, jurors } = this.config

    this.controller = await Controller.new(
      [clock.termDuration, clock.firstTermStartTime],
      [governor.funds, governor.config, sender],
      court.feeToken.address,
      [court.jurorFee, court.draftFee, court.settleFee],
      [court.commitTerms, court.revealTerms, court.appealTerms, court.appealConfirmTerms],
      [court.penaltyPct, court.finalRoundReduction],
      [court.firstRoundJurorsNumber, court.appealStepFactor, court.maxRegularAppealRounds, court.finalRoundLockTerms],
      [court.appealCollateralFactor, court.appealConfirmCollateralFactor],
      jurors.minActiveBalance
    )

    const { address, transactionHash } = this.controller
    logger.success(`Created Controller instance at ${address}`)
    this._saveDeploy({ controller: { address, transactionHash }})
  }

  async _deployCourt(Court) {
    if (!this.controller.address) throw Error('Controller has not been deployed yet')
    this._printCourtDeploy()
    this.court = await Court.new(this.controller.address, this.config.court.maxJurorsPerDraftBatch)
    const { address, transactionHash } = this.court
    logger.success(`Created Court instance at ${address}`)
    this._saveDeploy({ court: { address, transactionHash }})
  }

  async _deployRegistry(JurorsRegistry) {
    if (!this.controller.address) throw Error('Controller has not been deployed yet')
    const { court, jurors } = this.config
    const totalActiveBalanceLimit = jurors.minActiveBalance.mul(MAX_UINT64.div(court.finalRoundWeightPrecision))
    this._printRegistryDeploy(totalActiveBalanceLimit)
    this.registry = await JurorsRegistry.new(this.controller.address, jurors.token.address, totalActiveBalanceLimit)
    const { address, transactionHash } = this.registry
    logger.success(`Created JurorsRegistry instance at ${address}`)
    this._saveDeploy({ registry: { address, transactionHash }})
  }

  async _deployVoting(Voting) {
    if (!this.controller.address) throw Error('Controller has not been deployed yet')
    this._printVotingDeploy()
    this.voting = await Voting.new(this.controller.address)
    const { address, transactionHash } = this.voting
    logger.success(`Created Voting instance at ${address}`)
    this._saveDeploy({ voting: { address, transactionHash }})
  }

  async _deployTreasury(Treasury) {
    if (!this.controller.address) throw Error('Controller has not been deployed yet')
    this._printTreasuryDeploy()
    this.treasury = await Treasury.new(this.controller.address)
    const { address, transactionHash } = this.treasury
    logger.success(`Created Treasury instance at ${address}`)
    this._saveDeploy({ treasury: { address, transactionHash }})
  }

  async _deploySubscriptions(Subscriptions) {
    if (!this.controller.address) throw Error('Controller has not been deployed yet')
    this._printSubscriptionsDeploy()
    const { subscriptions } = this.config

    this.subscriptions = await Subscriptions.new(
      this.controller.address,
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

  /** logging methods **/

  _printControllerDeploy() {
    const { clock, governor, court, jurors } = this.config
    logger.info('Deploying Controller contract with config:')
    logger.info(` - Funds governor:                          ${governor.funds}`)
    logger.info(` - Config governor:                         ${governor.config}`)
    logger.info(` - Modules governor:                        ${governor.modules} (initially sender)`)
    logger.info(` - Term duration:                           ${clock.termDuration.toString()} seconds`)
    logger.info(` - First term start time:                   ${new Date(clock.firstTermStartTime.toNumber() * 1000)}`)
    logger.info(` - Fee token:                               ${court.feeToken.symbol} at ${court.feeToken.address}`)
    logger.info(` - Juror fee:                               ${tokenToString(court.jurorFee, court.feeToken)}`)
    logger.info(` - Draft fee:                               ${tokenToString(court.draftFee, court.feeToken)}`)
    logger.info(` - Settle fee:                              ${tokenToString(court.settleFee, court.feeToken)}`)
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

  _printCourtDeploy() {
    logger.info('Deploying Court contract with config:')
    logger.info(` - Controller:                              ${this.controller.address}`)
    logger.info(` - Max number of jurors per draft batch:    ${this.config.court.maxJurorsPerDraftBatch}`)
  }

  _printRegistryDeploy(totalActiveBalanceLimit) {
    const { jurors } = this.config
    logger.info('Deploying JurorsRegistry contract with config:')
    logger.info(` - Controller:                              ${this.controller.address}`)
    logger.info(` - Jurors token:                            ${jurors.token.symbol} at ${jurors.token.address}`)
    logger.info(` - Minimum ANJ active balance:              ${tokenToString(jurors.minActiveBalance, jurors.token)}`)
    logger.info(` - Total ANJ active balance limit:          ${tokenToString(totalActiveBalanceLimit, jurors.token)}`)
  }

  _printVotingDeploy() {
    logger.info('Deploying Voting contract with config:')
    logger.info(` - Controller:                              ${this.controller.address}`)
  }

  _printTreasuryDeploy() {
    logger.info('Deploying Treasury contract with config:')
    logger.info(` - Controller:                              ${this.controller.address}`)
  }

  _printSubscriptionsDeploy() {
    const { subscriptions } = this.config
    logger.info('Deploying Subscriptions contract with config:')
    logger.info(` - Controller:                              ${this.controller.address}`)
    logger.info(` - Period duration:                         ${subscriptions.periodDuration} terms`)
    logger.info(` - Fee token:                               ${subscriptions.feeToken.symbol} at ${subscriptions.feeToken.address}`)
    logger.info(` - Fee amount:                              ${tokenToString(subscriptions.feeAmount, subscriptions.feeToken)}`)
    logger.info(` - Pre payment periods:                     ${subscriptions.prePaymentPeriods.toString()} periods`)
    logger.info(` - Resume pre-paid periods:                 ${subscriptions.resumePrePaidPeriods.toString()} periods`)
    logger.info(` - Late payment penalty:                    ${subscriptions.latePaymentPenaltyPct.toString()} ‱`)
    logger.info(` - Governor share:                          ${subscriptions.governorSharePct.toString()} ‱`)
  }
}
