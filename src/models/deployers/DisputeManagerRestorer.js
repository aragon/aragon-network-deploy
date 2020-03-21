const BaseDeployer = require('./BaseDeployer')
const CallsEncoder = require('../CallsEncoder')
const { DISPUTE_MANAGER_ID } = require('../../helpers/court-modules')
const logger = require('../../helpers/logger')('DisputeManagerRestorer')

module.exports = class extends BaseDeployer {
  constructor(
    config,
    environment,
    output,
    verifier = undefined,
  ) {
    super(environment, output, verifier, logger)
    this.config = config
    this.encoder = new CallsEncoder()
  }

  async call() {
    const callsScript = this._generateEvmScript()
    logger.success(`Call script for AN DAO token manager generated`)
    logger.info(`${callsScript}`)
    const { tokenManager } = this.config.aragonNetworkDAO
    const receipt = await this._runEvmScript(callsScript, tokenManager)
    logger.success(`EVM Script run on tx: ${receipt.tx}. Gas used: ${receipt.receipt.gasUsed}`)
  }

  _generateEvmScript() {
    const {
      owner,
      court,
      disputeManager,
      migrator
    } = this.config

    const agentCallsScript = []
    agentCallsScript.push({
      to: owner,
      data: this._setModulesScript(court, DISPUTE_MANAGER_ID, disputeManager)
    })
    agentCallsScript.push({
      to: owner,
      data: this._closeMigratorScript(migrator)
    })

    const { voting } = this.config.aragonNetworkDAO
    const voteDescription = ''
    const tokenManagerScript = [{
      to: voting,
      data: this.encoder.encodeNewVote(this.encoder.encodeCallsScript(agentCallsScript), voteDescription)
    }]
    return this.encoder.encodeCallsScript(tokenManagerScript)
  }

  // sets the original dispute manager back
  _setModulesScript(controllerAddress, disputeManagerId, disputeManagerAddress) {
    const data = this.encoder.encodeSetModules([disputeManagerId], [disputeManagerAddress])
    return this.encoder.encodeExecute(controllerAddress, 0, data)
  }

  // closes the migrator
  _closeMigratorScript(migratorAddress) {
    const data = this.encoder.encodeCloseMigrator()
    return this.encoder.encodeExecute(migratorAddress, 0, data)
  }
}
