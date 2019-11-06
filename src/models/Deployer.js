const fs = require('fs')

module.exports = class Deployer {
  constructor(environment, output, logger) {
    this.output = output
    this.environment = environment
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
}
