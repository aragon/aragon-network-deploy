const abi = require('web3-eth-abi')
const ACL_ABI = require('@aragon/os/abi/ACL.json').abi
const KERNEL_ABI = require('@aragon/os/abi/Kernel.json').abi
const AGENT_ABI = require('@aragon/apps-agent/abi/Agent.json').abi
const VOTING_ABI = require('@aragon/apps-voting/abi/Voting.json').abi
const CONTROLLER_ABI = require('@aragon/court/abi/Controller.json').abi
const MINIME_ABI = require('@aragon/minime/abi/MiniMeToken.json').abi
const EOPBCTEMPLATE_ABI = require('@aragon/templates-externally-owned-presale-bonding-curve/abi/EOPBCTemplate.json').abi
const CONTROLLED_RECOVERABLE_ABI = require('@aragon/court/abi/ControlledRecoverable.json').abi
const JUROS_REGISTRY_MIGRATOR_ABI = require('@aragonone/court-registry-migrator/abi/JurorsRegistryMigrator.json').abi
const SUBSCRIPTIONS_ABI = require('@aragon/court/abi/CourtSubscriptions.json').abi

const CALLSCRIPT_ID = '0x00000001'
const EMPTY_CALLSCRIPT = '0x00000001'

module.exports = class CallsEncoder {
  /**
   * Encode a call script
   *
   * ```
   * CallsScriptAction {
   *   to: string;
   *   data: string;
   * }
   * ```
   *
   * Example:
   *
   * input:
   * [
   *  { to: 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa, data: 0x11111111 },
   *  { to: 0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb, data: 0x2222222222 }
   * ]
   *
   * output:
   * 0x00000001
   *   aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000411111111
   *   bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb000000052222222222
   *
   *
   * @param {Array<CallsScriptAction>} actions
   * @returns {string}
   */
  encodeCallsScript(actions) {
    return actions.reduce((script, { to, data }) => {
      const address = abi.encodeParameter('address', to)
      const dataLength = abi.encodeParameter('uint256', (data.length - 2) / 2).toString('hex')
      return script + address.slice(26) + dataLength.slice(58) + data.slice(2)
    }, CALLSCRIPT_ID)
  }

  encodeNewVote(executionScript, metadata) {
    const script = this._parseScript(executionScript)
    const newVoteABI = this._getFunctionABI(VOTING_ABI, 'newVote', 2)
    return abi.encodeFunctionCall(newVoteABI, [script, metadata])
  }

  encodeVotingInitialize(token, support, acceptance, duration) {
    const initializeVotingABI = this._getFunctionABI(VOTING_ABI, 'initialize', 4)
    return abi.encodeFunctionCall(initializeVotingABI, [token, support, acceptance, duration])
  }

  encodeExecute(target, ethValue, executionScript) {
    const script = this._parseScript(executionScript)
    const executeABI = this._getFunctionABI(AGENT_ABI, 'execute')
    return abi.encodeFunctionCall(executeABI, [target, ethValue, script])
  }

  encodeSetModules(ids, addresses) {
    const setModulesABI = this._getFunctionABI(CONTROLLER_ABI, 'setModules', 2)
    return abi.encodeFunctionCall(setModulesABI, [ids, addresses])
  }

  encodeDelayStartTime(firstTermStartTime) {
    const functionABI = this._getFunctionABI(CONTROLLER_ABI, 'delayStartTime', 1)
    return abi.encodeFunctionCall(functionABI, [firstTermStartTime.toString()])
  }

  encodeSetConfig(fromTermId, config) {
    const functionABI = this._getFunctionABI(CONTROLLER_ABI, 'setConfig')
    return abi.encodeFunctionCall(functionABI, [
      fromTermId.toString(),                                    // fromTermId Identification number of the term in which the config will be effective at
      config.court.feeToken.address,                            // feeToken Address of the token contract that is used to pay for fees
      [
        config.court.jurorFee.toString(),                       // jurorFee Amount of fee tokens that is paid per juror per dispute
        config.court.draftFee.toString(),                       // draftFee Amount of fee tokens per juror to cover the drafting cost
        config.court.settleFee.toString()                       // settleFee Amount of fee tokens per juror to cover round settlement cost
      ],
      [
        config.court.evidenceTerms.toString(),                  // evidenceTerms Max submitting evidence period duration in terms
        config.court.commitTerms.toString(),                    // commitTerms Commit period duration in terms
        config.court.revealTerms.toString(),                    // revealTerms Reveal period duration in terms
        config.court.appealTerms.toString(),                    // appealTerms Appeal period duration in terms
        config.court.appealConfirmTerms.toString()              // appealConfirmationTerms Appeal confirmation period duration in terms
      ],
      [
        config.court.penaltyPct.toString(),                     // penaltyPct Permyriad of min active tokens balance to be locked for each drafted juror (‱ - 1/10,000)
        config.court.finalRoundReduction.toString()             // finalRoundReduction Permyriad of fee reduction for the last appeal round (‱ - 1/10,000)
      ],
      [
        config.court.firstRoundJurorsNumber.toString(),         // firstRoundJurorsNumber Number of jurors to be drafted for the first round of disputes
        config.court.appealStepFactor.toString(),               // appealStepFactor Increasing factor for the number of jurors of each round of a dispute
        config.court.maxRegularAppealRounds.toString(),         // maxRegularAppealRounds Number of regular appeal rounds before the final round is triggered
        config.court.finalRoundLockTerms.toString()             // finalRoundLockTerms Number of terms that a coherent juror in a final round is disallowed to withdraw (to prevent 51% attacks)
      ],
      [
        config.court.appealCollateralFactor.toString(),         // appealCollateralFactor Multiple of dispute fees required to appeal a preliminary ruling
        config.court.appealConfirmCollateralFactor.toString()   // appealConfirmCollateralFactor Multiple of dispute fees required to confirm appeal
      ],
      config.jurors.minActiveBalance.toString()
    ])
  }

  encodeGovernorSetter(setter, newGovernor) {
    const setModulesABI = this._getFunctionABI(CONTROLLER_ABI, setter)
    return abi.encodeFunctionCall(setModulesABI, [newGovernor])
  }

  encodeChangeController(controllerAddress) {
    const changeControllerABI = this._getFunctionABI(MINIME_ABI, 'changeController', 1)
    return abi.encodeFunctionCall(changeControllerABI, [controllerAddress])
  }

  encodeRecoverFunds(tokenAddress, destination) {
    const functionABI = this._getFunctionABI(CONTROLLED_RECOVERABLE_ABI, 'recoverFunds', 2)
    return abi.encodeFunctionCall(functionABI, [tokenAddress, destination])
  }

  encodeCloseMigrator() {
    const functionABI = this._getFunctionABI(JUROS_REGISTRY_MIGRATOR_ABI, 'close')
    return abi.encodeFunctionCall(functionABI, [])
  }

  encodeSubscriptionsSetFeeToken(feeToken, feeAmount) {
    const functionABI = this._getFunctionABI(SUBSCRIPTIONS_ABI, 'setFeeToken', 2)
    return abi.encodeFunctionCall(functionABI, [feeToken, feeAmount.toString()])
  }

  encodeSubscriptionsOneParamSetter(functionName, param) {
    const functionABI = this._getFunctionABI(SUBSCRIPTIONS_ABI, functionName, 1)
    return abi.encodeFunctionCall(functionABI, [param.toString()])
  }

  encodeCreatePermission(entity, app, role, manager) {
    const functionABI = this._getFunctionABI(ACL_ABI, 'createPermission')
    return abi.encodeFunctionCall(functionABI, [entity, app, role, manager])
  }

  encodeGrantPermission(entity, app, role) {
    const functionABI = this._getFunctionABI(ACL_ABI, 'grantPermission')
    return abi.encodeFunctionCall(functionABI, [entity, app, role])
  }

  encodeNewAppInstance(appId, base, initializePayload, setDefault) {
    const functionABI = this._getFunctionABI(KERNEL_ABI, 'newAppInstance')
    return abi.encodeFunctionCall(functionABI, [appId, base, initializePayload, setDefault])
  }

  encodeNewInstance({ owner, id, collateralToken, bondedToken, period, openDate, exchangeRate, beneficiaryPct, reserveRatio, batchBlocks, slippage }) {
    const newInstanceABI = this._getFunctionABI(EOPBCTEMPLATE_ABI, 'newInstance')
    return abi.encodeFunctionCall(newInstanceABI, [
      owner,
      id,
      collateralToken,
      bondedToken,
      period,
      openDate,
      [exchangeRate, beneficiaryPct, reserveRatio, batchBlocks, slippage]
    ])
  }

  _getFunctionABI(ABI, functionName, inputsLength) {
    const functionABI = ABI.find(item =>
      item.type === 'function' &&
      item.name === functionName &&
      (inputsLength === undefined || item.inputs.length === inputsLength)
    )

    if (!functionABI) throw Error(`Could not find function ABI called ${functionName} with ${inputsLength} inputs`)
    return functionABI
  }

  _parseScript(executionScript) {
    if (!executionScript || executionScript === '0x') {
      executionScript = EMPTY_CALLSCRIPT
    }
    return executionScript
  }
}
