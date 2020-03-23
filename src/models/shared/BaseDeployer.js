const fs = require('fs')
const logger = require('../../helpers/logger')('BaseDeployer')

module.exports = class BaseDeployer {
  constructor(environment, output = undefined, verifier = undefined) {
    this.environment = environment
    this.output = output
    this.verifier = verifier
    this.previousDeploy = {}

    if (this._existsPreviousDeploy()) {
      this.previousDeploy = require(this.output)
      logger.warn(`Using previous deploy at ${this.output}`)
    }
  }

  _existsPreviousDeploy() {
    return !!this.output && fs.existsSync(this.output)
  }

  _saveDeploy(data) {
    if (!this.output) logger.warn(`Couldn't save deploy, no output path given: ${data}`)
    this.previousDeploy = { ...this.previousDeploy, ...data }
    const previousDeployJSON = JSON.stringify(this.previousDeploy, null, 2)
    fs.writeFileSync(this.output, previousDeployJSON)
  }

  async _encodeAndSubmitEvmScript({ voting, tokenManager }, agentCallsScript, voteDescription = '') {
    const agentScript = this.encoder.encodeCallsScript(agentCallsScript)
    const votingScript = this.encoder.encodeNewVote(agentScript, voteDescription)
    const tokenManagerScript = this.encoder.encodeCallsScript([{ to: voting, data: votingScript }])
    logger.success(`Call script for AN DAO generated`)
    logger.info(`${tokenManagerScript}`)
    await this._runEvmScript(tokenManager, tokenManagerScript)
  }

  async _runEvmScript(tokenManager, tokenManagerScript) {
    const TokenManager = await this.environment.getArtifact('TokenManager', '@aragon/apps-token-manager')
    const forwarder = await TokenManager.at(tokenManager)
    const { receipt, tx } = forwarder.forward(tokenManagerScript)
    logger.success(`EVM Script run on tx: ${tx}. Gas used: ${receipt.gasUsed}`)
    return receipt
  }
}
