const { sha3 } = require('web3-utils')
const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('BondingCurveFreezer')

const ANY_ENTITY = '0xffffffffffffffffffffffffffffffffffffffff'
const VOTE_DESCRIPTION = 'Freeze ANJ bonding curve (revoke buy/sell permissions)'

module.exports = class extends BaseDeployer {
  constructor(config, environment, output) {
    super(environment, output, undefined)
    this.config = config
    this.encoder = new CallsEncoder()
  }

  async call() {
    const { governor, kernel: kernelAddress, fundraising } = this.config
    logger.info('Building EVM script to revoke ANJ bonding curve permissions...')

    const Kernel = await this.environment.getArtifact('Kernel', '@aragon/os')
    const kernel = await Kernel.at(kernelAddress)
    const acl =  await kernel.acl()

    const permissions = ['OPEN_BUY_ORDER_ROLE', 'OPEN_SELL_ORDER_ROLE']
    const callsScript = permissions.map(role => {
      const script = this.encoder.encodeRevokePermission(ANY_ENTITY, fundraising, sha3(role))
      const data = this.encoder.encodeExecute(acl, 0, script)
      return { to: governor.agent, data }
    })

    await this._encodeAndSubmitEvmScript(governor, callsScript, VOTE_DESCRIPTION)
  }
}
