const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('ANCouncilVotingAppInstaller')

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
    const { governor: council, antVoting, anDaoAgent, court } = this.config
    logger.info('Building EVM script to transfer governor from AN Council to AN DAO...')

    const agentScripts = []
    const governorSetters = [
      'changeFundsGovernor',
      'changeConfigGovernor',
      'changeModulesGovernor',
    ]
    governorSetters.map(setter => {
      const setterData = this.encoder.encodeExecute(
        court,
        0,
        this.encoder.encodeGovernorSetter(
          setter,
          anDaoAgent,
        )
      )
      agentScripts.push({ to: council.agent, data: setterData })
    })
    const voteDescription = 'Transition governor from AN Council to AN DAO'
    const agentCallsScript = this.encoder.encodeCallsScript(agentScripts)
    logger.success(`Call script for AN Council DAO generated`)
    const Voting = await this.environment.getArtifact('Voting', '@aragon/apps-voting')
    const voting = await Voting.at(antVoting)
    const { receipt, tx } = await voting.newVote(agentCallsScript, voteDescription)
    logger.success(`Vote created on tx: ${tx}. Gas used: ${receipt.gasUsed}`)
  }

  /** logging methods **/

  _print() {
    logger.info('Creating vote on AN Council DAO with config:')
    logger.info(` - Council ANT Voting app:                    ${this.config.antVoting}`)
    logger.info(` - Council Agent app:                         ${this.config.governor.agent}`)
    logger.info(` - AN DAO Agent:                              ${this.config.anDaoAgent}`)
    logger.info(` - Court controller:                          ${this.config.court}`)
  }
}
