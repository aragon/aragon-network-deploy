const RLP = require('rlp')
const { sha3, keccak256 } = require('web3-utils')

const logger = require('../../helpers/logger')('VotingAppInstaller')
const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')

const VOTING_ID = '0x9fa3927f639745e587912d4b0fea7ef9013bf93fb907d29faeab57417ba6e1d4'
const BASE_NAMESPACE = '0xf1f3eb40f5bc1ad1344716ced8b8a0431d840b5783aea1fd01786bc26f35ac0f'
const VOTE_DESCRIPTION = 'Install Voting app and assign permissions'

module.exports = class extends BaseDeployer {
  constructor(config, environment, output, verifier = undefined) {
    super(environment, output, verifier)
    this.config = config
    this.encoder = new CallsEncoder()
  }

  async call() {
    this._print()
    await this._loadKernel()
    await this._createVote()
  }

  async _createVote() {
    const { governor, token, support, acceptance, duration } = this.config
    logger.info('Building EVM script to install voting app...')

    // Create Voting app instance
    const initializeData = await this.encoder.encodeVotingInitialize(token, support, acceptance, duration)
    const votingBaseAddress = await this.kernel.getApp(BASE_NAMESPACE, VOTING_ID)
    logger.info(`Installing voting app with base ${votingBaseAddress}`)
    const newAppInstanceData = this.encoder.encodeNewAppInstance(VOTING_ID, votingBaseAddress, initializeData, false)
    const callsScript = [{ to: this.kernel.address, data: newAppInstanceData }]

    // Governor's Agent will be able to create votes on the new voting app
    const acl = await this.kernel.acl()
    const votingAddress = await this._calculateNewProxyAddress(this.kernel.address)
    const setPermissionData = this.encoder.encodeCreatePermission(governor.agent, votingAddress, sha3('CREATE_VOTES_ROLE'), governor.agent)
    callsScript.push({ to: acl, data: setPermissionData })

    // Allow new voting app to execute txs through governor's Agent app
    const permissions = ['EXECUTE_ROLE', 'RUN_SCRIPT_ROLE', 'TRANSFER_ROLE']
    permissions
      .map(role => this.encoder.encodeGrantPermission(votingAddress, governor.agent, sha3(role)))
      .forEach(data => callsScript.push({ to: acl, data }))

    const { tx } = await this._encodeAndSubmitEvmScript(governor, callsScript, VOTE_DESCRIPTION)
    await this._saveDeploy({ voting: { address: votingAddress, transactionHash: tx }})
  }

  async _calculateNewProxyAddress() {
    const nonce = await this._getNonce(this.kernel.address)
    const rlpEncoded = RLP.encode([this.kernel.address, nonce])
    const contractAddressLong = keccak256(rlpEncoded)
    return `0x${contractAddressLong.substr(-40)}`
  }

  async _getNonce(address) {
    const web3 = this.environment.getWeb3()
    const txCount = await web3.eth.getTransactionCount(address)
    return `0x${(txCount).toString(16)}`
  }

  async _loadKernel() {
    const { agent: agentAddress } = this.config.governor
    const Agent = await this.environment.getArtifact('Agent', '@aragon/apps-agent')
    const agent = await Agent.at(agentAddress)
    const kernelAddress = await agent.kernel()
    const Kernel = await this.environment.getArtifact('Kernel', '@aragon/os')
    this.kernel = await Kernel.at(kernelAddress)
  }

  _print() {
    logger.info('Installing Voting app in governor DAO:')
    logger.info(` - Token:                                   ${this.config.token}`)
    logger.info(` - Support:                                 ${this.config.support}`)
    logger.info(` - Quorum:                                  ${this.config.acceptance}`)
    logger.info(` - Vote duration:                           ${this.config.duration}\n`)
  }
}
