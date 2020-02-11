const BaseDeployer = require('./BaseDeployer')
const CallsEncoder = require('../CallsEncoder')
const logger = require('../../helpers/logger')('CourtStartDelayer')

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
      firstTermStartTime,
    } = this.config

    const agentCallsScript = []
    agentCallsScript.push({
      to: owner,
      data: this._delayStartTime(court, firstTermStartTime)
    })

    const { votingApp } = this.config.aragonNetworkDAO
    const voteDescription = ''
    const tokenManagerScript = [{
      to: votingApp,
      data: this.encoder.encodeNewVote(this.encoder.encodeCallsScript(agentCallsScript), voteDescription)
    }]
    return this.encoder.encodeCallsScript(tokenManagerScript)
  }

  // delays Court first term start time
  _delayStartTime(controllerAddress, firstTermStartTime) {
    const data = this.encoder.encodeDelayStartTime(firstTermStartTime)
    return this.encoder.encodeExecute(controllerAddress, 0, data)
  }
}
