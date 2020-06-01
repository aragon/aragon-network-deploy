const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('CourtConfigManager')
const { bn, tokenToString } = require('../../helpers/numbers')

module.exports = class extends BaseDeployer {
  constructor(config, environment) {
    super(environment)
    this.config = config
    this.encoder = new CallsEncoder()
  }

  async call() {
    this._printConfig()
    this.config.governor.modules.isDAO()
      ? (await this.setConfigThroughDAO())
      : (await this.setConfigDirectly())
  }

  async setConfigDirectly() {
    const { court, jurors } = this.config
    logger.info('Setting Court config...')
    const fromTermId = (await this._getCurrentTerm()).add(1)
    const AragonCourt = await this.environment.getArtifact('AragonCourt', '@aragon/court')
    const controller = await AragonCourt.at(court)
    await controller.setConfig(
      fromTermId.toString(),
      court.feeToken.address,
      [court.jurorFee.toString(), court.draftFee.toString(), court.settleFee.toString()],
      [court.evidenceTerms.toString(), court.commitTerms.toString(), court.revealTerms.toString(), court.appealTerms.toString(), court.appealConfirmTerms.toString()],
      [court.penaltyPct.toString(), court.finalRoundReduction.toString()],
      [court.firstRoundJurorsNumber.toString(), court.appealStepFactor.toString(), court.maxRegularAppealRounds.toString(), court.finalRoundLockTerms.toString()],
      [court.appealCollateralFactor.toString(), court.appealConfirmCollateralFactor.toString()],
      jurors.minActiveBalance.toString()
    )
    logger.success('Court config set successfully')
  }

  async setConfigThroughDAO() {
    logger.info('Building EVM script to set Court config...')
    const { governor: { config: dao }, modules: { court } } = this.config
    const fromTermId = (await this._getCurrentTerm()).add(bn(1))
    const setConfigData = this.encoder.encodeSetConfig(fromTermId, this.config)
    const executeData = this.encoder.encodeExecute(court, 0, setConfigData)
    const agentCallsScript = [{ to: dao.agent, data: executeData }]
    await this._encodeAndSubmitEvmScript(dao, agentCallsScript, 'Set Court config')
  }

  async _getCurrentTerm() {
    const { modules: { court } } = this.config
    const AragonCourt = await this.environment.getArtifact('AragonCourt', '@aragon/court')
    const controller = await AragonCourt.at(court)
    return controller.getCurrentTermId()
  }

  _printConfig() {
    const { court, jurors } = this.config
    logger.info(`Court config to be set:`)
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
}
