const { sha3 } = require('web3-utils')

const { ANY_ENTITY } = require('@aragon/contract-helpers-test/src/aragon-os')
const { APP_IDS } = require('@aragon/templates-shared/helpers/apps')

const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')
const logger = require('../../helpers/logger')('ANCouncilVotingAppInstaller')

const { getInstalledAppsById } = require('../../helpers/events')
const { VERIFICATION_HEADERS_OS } = require('../../helpers/verifier')

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier)
    this.config = config
    this.encoder = new CallsEncoder()
  }

  async call() {
    this._print()
    await this._getKernelAndAcl()
    await this._deployOrLoadVotingInstance()
    await this._createVote()
  }

  async _getKernelAndAcl() {
    const { agent } = this.config.governor
    const Agent = await this.environment.getArtifact('Agent', '@aragon/apps-agent')
    const agentContract = await Agent.at(agent)
    this._kernel = await agentContract.kernel()
    const Kernel = await this.environment.getArtifact('Kernel', '@aragon/os')
    const kernelContract = await Kernel.at(this._kernel)
    this._acl = await kernelContract.acl()
  }

  async _deployOrLoadVotingInstance() {
    const { voting: previousVoting } = this.previousDeploy

    if (previousVoting && previousVoting.address) {
      this.votingInstance = previousVoting.address
      return
    }

    const { ant, neededSupport, minimumAcceptanceQuorum, votingDuration } = this.config

    const AppProxyFactory = await this.environment.getArtifact('AppProxyFactory', '@aragon/os')
    const appProxyFactory = await AppProxyFactory.new()
    const { receipt, tx } = await appProxyFactory.newAppProxy(this._kernel, APP_IDS.voting)
    const Kernel = await this.environment.getArtifact('Kernel', '@aragon/os')
    this.votingInstance = getInstalledAppsById(receipt.rawLogs, APP_IDS, Kernel).voting[0]

    // save and verify
    await this._saveDeploy({ voting: { address: this.votingInstance, transactionHash: tx }})
    await this._verifyVoting(this.votingInstance)

    // init Voting app
    const Voting = await this.environment.getArtifact('Voting', '@aragon/apps-voting')
    const voting = await Voting.at(this.votingInstance)
    await voting.initialize(ant, neededSupport, minimumAcceptanceQuorum, votingDuration)

    // AN Council DAO already has a Voting app, so there’s no need for `setApp`
  }

  async _verifyVoting(votingAddress) {
    const AppProxyUpgradeable = await this.environment.getArtifact('AppProxyUpgradeable', '@aragon/os')
    const proxyContract = await AppProxyUpgradeable.at(votingAddress)
    const previousContract = this.previousDeploy.voting
    if (this.verifier && previousContract && !previousContract.verification) {
      const url = await this.verifier.call(proxyContract, '@aragon/os', VERIFICATION_HEADERS_OS)
      const { address, transactionHash } = previousContract
      this._saveDeploy({ voting: { address, transactionHash, verification: url } })
    }
  }

  async _createVote() {
    const { governor } = this.config
    logger.info('Building EVM script to install voting app...')

    // New voting instance roles: createPermission for ANY ENTITY / new voting for CREATE_VOTES_ROLE
    const setPermissionData = this.encoder.encodeCreatePermission(
      ANY_ENTITY,
      this.votingInstance,
      sha3('CREATE_VOTES_ROLE'),
      this.votingInstance
    )
    const callsScript = [{ to: this._acl, data: setPermissionData }]
    // Agent roles assigned to new voting: grantPermission + setPermissionManager
    const agentRoles = [
      'EXECUTE_ROLE',
      'RUN_SCRIPT_ROLE',
      'TRANSFER_ROLE',
    ]
    agentRoles.map(role => {
      // grant
      const grantPermissionData = this.encoder.encodeGrantPermission(
        this.votingInstance,
        governor.agent,
        sha3(role)
      )
      callsScript.push({ to: this._acl, data: grantPermissionData })
      // change manager
      const setPermissionManagerData = this.encoder.encodeSetPermissionManager(
        this.votingInstance,
        governor.agent,
        sha3(role)
      )
      callsScript.push({ to: this._acl, data: setPermissionManagerData })
    })
    const voteDescription = 'Install Voting app and assign permissions'
    await this._encodeAndSubmitEvmScript(governor, callsScript, voteDescription)
  }

  /** logging methods **/

  _print() {
    logger.info('Creating vote on AN Council DAO with config:')
    logger.info(` - ANT:                                     ${this.config.ant}`)
    // TODO: format
    logger.info(` - Support:                                 ${this.config.neededSupport}`)
    logger.info(` - Quorum:                                  ${this.config.minimumAcceptanceQuorum}`)
    logger.info(` - Vote duration:                           ${this.config.votingDuration}`)
  }
}
