const fs = require('fs')

module.exports = class BaseDeployer {
  constructor(environment, output, verifier, logger) {
    this.output = output
    this.environment = environment
    this.verifier = verifier
    this.previousDeploy = {}

    if (this._existsPreviousDeploy()) {
      this.previousDeploy = require(this.output)
      logger.warn(`Using previous deploy at ${this.output}`)
    }
  }

  _existsPreviousDeploy() {
    return fs.existsSync(this.output)
  }

  _saveDeploy(data) {
    this.previousDeploy = { ...this.previousDeploy, ...data }
    const previousDeployJSON = JSON.stringify(this.previousDeploy, null, 2)
    fs.writeFileSync(this.output, previousDeployJSON)
  }

  async _runEvmScript(callsScript, tokenManagerAddress) {
    const TokenManager = await this.environment.getArtifact('TokenManager', '@aragon/apps-token-manager')
    const tokenManager = await TokenManager.at(tokenManagerAddress)
    const receipt = await tokenManager.forward(callsScript)

    return receipt
  }
}
