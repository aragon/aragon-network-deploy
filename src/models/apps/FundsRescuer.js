const { sha3 } = require('web3-utils')

const logger = require('../../helpers/logger')('FundsRescuer')
const CallsEncoder = require('../shared/CallsEncoder')
const BaseDeployer = require('../shared/BaseDeployer')

const BASE_NAMESPACE = '0xf1f3eb40f5bc1ad1344716ced8b8a0431d840b5783aea1fd01786bc26f35ac0f'
const VOTE_DESCRIPTION = 'Rescue old registry funds and DAI locked into ANJ'

module.exports = class extends BaseDeployer {
  constructor(config, environment, output) {
    super(environment, output, undefined)
    this.config = config
    this.encoder = new CallsEncoder()
  }

  async call() {
    logger.info('Building EVM script to rescue ANJ and DAI funds...')
    const { governor, oldJurorsRegistry, anj, dai, newTokenManagerBase, fundraisingTokenManager: fundraisingTokenManagerAddress } = this.config

    // Load fundraising Token Manager current implementation
    const AppProxyUpgradeable = await this.environment.getArtifact('AppProxyUpgradeable', '@aragon/os')
    const fundraisingTokenManagerProxy = await AppProxyUpgradeable.at(governor.tokenManager)
    const fundraisingTokenManagerAppId = await fundraisingTokenManagerProxy.appId()
    const currentFundraisingTokenManagerBase = await fundraisingTokenManagerProxy.implementation()

    // Load fundraising kernel
    const TokenManager = await this.environment.getArtifact('TokenManager', '@aragon/apps-token-manager')
    const fundraisingTokenManager = await TokenManager.at(fundraisingTokenManagerAddress)
    const fundraisingKernelAddress = await fundraisingTokenManager.kernel()
    const Kernel = await this.environment.getArtifact('Kernel', '@aragon/os')
    const fundraisingKernel = await Kernel.at(fundraisingKernelAddress)
    const fundraisingACL = await fundraisingKernel.acl()

    // Load governor's kernel
    const Agent = await this.environment.getArtifact('Agent', '@aragon/apps-agent')
    const governorAgent = await Agent.at(governor.agent)
    const governorKernelAddress = await governorAgent.kernel()
    const governorKernel = await Kernel.at(governorKernelAddress)
    const governorACL = await governorKernel.acl()

    // Upgrade fundraising Token Manager
    const upgradeFundraisingTokenManagerData = await this.encoder.encodeSetApp(BASE_NAMESPACE, fundraisingTokenManagerAppId, newTokenManagerBase)
    const upgradeFundraisingTokenManagerExecuteData = this.encoder.encodeExecute(fundraisingKernelAddress, 0, upgradeFundraisingTokenManagerData)
    const callsScript = [{ to: governor.agent, data: upgradeFundraisingTokenManagerExecuteData }]
    logger.info(`Upgrading fundraising Token Manager to ${newTokenManagerBase}`)

    // Grant "CLAIM_TOKENS_ROLE" permission on fundraising Token Manager to governor's Voting
    const createClaimTokensRoleData = this.encoder.encodeCreatePermission(governor.voting, fundraisingTokenManagerAddress, sha3('CLAIM_TOKENS_ROLE'), governor.voting)
    const createClaimTokensRoleExecuteData = this.encoder.encodeExecute(fundraisingACL, 0, createClaimTokensRoleData)
    callsScript.push({ to: governor.agent, data: createClaimTokensRoleExecuteData })
    logger.info(`Granting CLAIM_TOKENS_ROLE on fundraising Token Manager to governor's Voting ${governor.voting}`)

    // Claim and transfer DAI tokens
    const claimTokensData = this.encoder.encodeClaimTokens(dai.address, dai.recipient)
    callsScript.push({ to: fundraisingTokenManagerAddress, data: claimTokensData })
    logger.info(`Claiming DAI for ${dai.recipient}`)

    // Revoke "CLAIM_TOKENS_ROLE" permission on fundraising Token Manager to governor's Voting
    const revokeClaimTokensRoleData = this.encoder.encodeRevokePermission(governor.voting, fundraisingTokenManagerAddress, sha3('CLAIM_TOKENS_ROLE'))
    callsScript.push({ to: fundraisingACL, data: revokeClaimTokensRoleData })
    logger.info(`Revoking CLAIM_TOKENS_ROLE on fundraising Token Manager from governor's Voting ${governor.voting}`)

    // Remove governor's Voting as the permission manager of "CLAIM_TOKENS_ROLE" on fundraising Token Manager
    const removeClaimTokensPermissionManagerData = this.encoder.encodeRemovePermissionManager(fundraisingTokenManagerAddress, sha3('CLAIM_TOKENS_ROLE'))
    callsScript.push({ to: fundraisingACL, data: removeClaimTokensPermissionManagerData })
    logger.info(`Removing governor's Voting ${governor.voting} as the permission manager of CLAIM_TOKENS_ROLE on fundraising Token Manager`)

    // Downgrade Token Manager app of the fundraising DAO
    const downgradeTokenManagerData = await this.encoder.encodeSetApp(BASE_NAMESPACE, fundraisingTokenManagerAppId, currentFundraisingTokenManagerBase)
    const downgradeTokenManagerExecuteData = this.encoder.encodeExecute(fundraisingKernelAddress, 0, downgradeTokenManagerData)
    callsScript.push({ to: governor.agent, data: downgradeTokenManagerExecuteData })
    logger.info(`Downgrading fundraising Token Manager version to base ${currentFundraisingTokenManagerBase}`)

    // Recover ANJ tokens from old registry
    const recoverAnjFundsData = this.encoder.encodeRecoverFunds(anj.address, governor.agent)
    const recoverAnjFundsExecuteData = this.encoder.encodeExecute(oldJurorsRegistry, 0, recoverAnjFundsData)
    callsScript.push({ to: governor.agent, data: recoverAnjFundsExecuteData })
    logger.info(`Recovering ANJ locked in old registry ${oldJurorsRegistry}`)

    // Grant "TRANSFER_ROLE" permission on governor's Agent to governor's Voting
    const grantTransferRoleData = this.encoder.encodeGrantPermission(governor.voting, governor.agent, sha3('TRANSFER_ROLE'))
    callsScript.push({ to: governorACL, data: grantTransferRoleData })
    logger.info(`Granting TRANSFER_ROLE to voting ${governor.voting}`)

    // Transfer ANJ tokens
    logger.info(`Transferring ANJ tokens to ${anj.rescues.map(x => x.to)}`)
    anj.rescues.forEach(({ to, amount }) => {
      const tokenTransferData = this.encoder.encodeTokenTransfer(anj.address, to, amount)
      callsScript.push({ to: governor.agent, data: tokenTransferData })
    })

    // Revoke "TRANSFER_ROLE" permission on governor's Agent from governor's Voting
    const revokeTransferRoleData = this.encoder.encodeRevokePermission(governor.voting, governor.agent, sha3('TRANSFER_ROLE'))
    callsScript.push({ to: governorACL, data: revokeTransferRoleData })
    logger.info(`Revoking TRANSFER_ROLE on governor's Agent from governor's Voting ${governor.voting}`)

    await this._encodeAndSubmitEvmScript(governor, callsScript, VOTE_DESCRIPTION)
  }
}
