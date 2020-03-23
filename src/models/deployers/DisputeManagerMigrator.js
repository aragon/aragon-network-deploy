const BaseDeployer = require('./BaseDeployer')
const CallsEncoder = require('../CallsEncoder')
const logger = require('../../helpers/logger')('DisputeManagerMigrator')

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
      newDisputeManager,
      migrator,
      controllerIds
    } = this.config

    const agentCallsScript = []
    agentCallsScript.push({
      to: owner,
      data: this._setModulesScript(court, controllerIds.disputes, newDisputeManager)
    })

    const { voting } = this.config.aragonNetworkDAO
    const voteDescription = ''
    const tokenManagerScript = [{
      to: voting,
      data: this.encoder.encodeNewVote(this.encoder.encodeCallsScript(agentCallsScript), voteDescription)
    }]
    return this.encoder.encodeCallsScript(tokenManagerScript)
  }

  // sets the new dispute manager
  _setModulesScript(controllerAddress, disputeManagerId, newDisputeManagerAddress,) {
    const data = this.encoder.encodeSetModules([disputeManagerId], [newDisputeManagerAddress])
    return this.encoder.encodeExecute(controllerAddress, 0, data)
  }
}
