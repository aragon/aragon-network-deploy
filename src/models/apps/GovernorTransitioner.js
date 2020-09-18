const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('GovernorTransitioner')

const VOTE_DESCRIPTION = 'Transition governor from AN Council to AN DAO'

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier)
    this.config = config
    this.encoder = new CallsEncoder()
  }

  async call() {
    this._print()
    await this._createVote()
  }

  async _createVote() {
    const { governor, antVoting, funds, config, modules, court } = this.config
    logger.info('Building EVM script to transfer governor from AN Council to AN DAO...')

    const governorAddresses = [funds, modules, config]
    const governorSetters = ['changeFundsGovernor', 'changeModulesGovernor', 'changeConfigGovernor']
    const governorScripts = governorSetters.map((setter, index) => {
      const script = this.encoder.encodeGovernorSetter(setter, governorAddresses[index])
      const data = this.encoder.encodeExecute(court, 0, script)
      return { to: governor.agent, data }
    })

    const governorCallsScript = this.encoder.encodeCallsScript(governorScripts)
    const newVoteData = this.encoder.encodeNewVote(governorCallsScript, VOTE_DESCRIPTION)
    const executeData = this.encoder.encodeExecute(antVoting, 0, newVoteData)
    const agentCallsScript = [{ to: governor.agent, data: executeData }]
    await this._encodeAndSubmitEvmScript(governor, agentCallsScript, `Create ANT vote for "${VOTE_DESCRIPTION}"`)
  }

  _print() {
    logger.info('Creating vote on AN Council DAO with config:')
    logger.info(` - Council ANT Voting app:                    ${this.config.antVoting}`)
    logger.info(` - Council Agent app:                         ${this.config.governor.agent}`)
    logger.info(` - AN DAO Agent for config governor:          ${this.config.config}`)
    logger.info(` - AN DAO Agent for funds governor:           ${this.config.funds}`)
    logger.info(` - AN DAO Agent for modules governor:         ${this.config.modules}`)
    logger.info(` - Court controller:                          ${this.config.court}`)
  }
}
