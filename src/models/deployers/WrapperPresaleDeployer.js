const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('WrapperPresaleDeployer')

const VERSION = '1.3.0'

const VERIFICATION_HEADERS = [
  'Commit sha: 663ff3d4f608d2c8c0179582dff09ae8d5d05db9',
  'GitHub repository: https://github.com/aragonone/court-presale-activate',
  'Tool used for the deploy: https://github.com/aragon/aragon-network-deploy',
]

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier)
    this.config = config
  }

  async call() {
    const address = this.previousDeploy.address
    const PresaleWrapper = await this.environment.getArtifact('CourtPresaleActivate', '@aragon/court-presale-activate')

    if (address) await this._loadWrapper(PresaleWrapper, address)
    else await this._deployWrapper(PresaleWrapper)
    await this._verifyWrapper()
  }

  async _loadWrapper(PresaleWrapper, address) {
    logger.warn(`Using previous deployed PresaleWrapper instance at ${address}`)
    this.wrapper = await PresaleWrapper.at(address)
  }

  async _deployWrapper(PresaleWrapper) {
    const { governor, bondedToken, registry, presale, uniswap } = this.config
    this._printWrapperDeploy()

    this.wrapper = await PresaleWrapper.new(governor.address, bondedToken, registry, presale, uniswap)
    const { address, transactionHash } = this.wrapper
    logger.success(`Created PresaleWrapper instance at ${address}`)
    this._saveDeploy({ address, transactionHash, version: VERSION })
  }

  async _verifyWrapper() {
    if (this.verifier && this.previousDeploy && !this.previousDeploy.verification) {
      const url = await this.verifier.call(this.wrapper, '@aragon/court-presale-activate', VERIFICATION_HEADERS)
      const { address, transactionHash, version } = this.wrapper
      this._saveDeploy({ address, transactionHash, version, verification: url })
    }
  }

  _printWrapperDeploy() {
    logger.info('Deploying PresaleWrapper contract:')
    logger.info(` - Governor:                                 ${this.config.governor.describe()}`)
    logger.info(` - Presale:                                  ${this.config.presale}`)
    logger.info(` - Bonded Token:                             ${this.config.bondedToken}`)
    logger.info(` - Jurors Registry:                          ${this.config.registry}`)
    logger.info(` - Uniswap:                                  ${this.config.uniswap}`)
  }
}
