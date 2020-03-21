const BaseDeployer = require('./BaseDeployer')
const CallsEncoder = require('../CallsEncoder')
const logger = require('../../helpers/logger')('JurorsRegistryMigrator')
const { JURORS_REGISTRY_ID, DISPUTE_MANAGER_ID } = require('../../helpers/court-modules')

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
      bondedToken,
      court,
      oldRegistry,
      newRegistry,
      migrator,
    } = this.config

    const agentCallsScript = []
    agentCallsScript.push({
      to: owner,
      data: this._recoverFundsFromOldRegistryScript(oldRegistry, bondedToken, migrator)
    })
    agentCallsScript.push({
      to: owner,
      data: this._setModulesScript(court, JURORS_REGISTRY_ID, newRegistry, DISPUTE_MANAGER_ID, migrator)
    })

    const { voting } = this.config.aragonNetworkDAO
    const voteDescription = ''
    const tokenManagerScript = [{
      to: voting,
      data: this.encoder.encodeNewVote(this.encoder.encodeCallsScript(agentCallsScript), voteDescription)
    }]
    return this.encoder.encodeCallsScript(tokenManagerScript)
  }

  _recoverFundsFromOldRegistryScript(oldJurorsRegistryAddress, anjAddress, anDaoAgent) {
    const data = this.encoder.encodeRecoverFunds(anjAddress, anDaoAgent)
    return this.encoder.encodeExecute(oldJurorsRegistryAddress, 0, data)
  }

  // sets the new registry and the migrator as dispute manager
  _setModulesScript(
    controllerAddress,
    jurorsRegistryId,
    newJurorsRegistryAddress,
    disputeManagerId,
    migratorAddress
  ) {
    const data = this.encoder.encodeSetModules([jurorsRegistryId, disputeManagerId], [newJurorsRegistryAddress, migratorAddress])
    return this.encoder.encodeExecute(controllerAddress, 0, data)
  }
}
