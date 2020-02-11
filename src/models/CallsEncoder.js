const abi = require('web3-eth-abi')
const AGENT_ABI = require('@aragon/apps-agent/abi/Agent.json').abi
const VOTING_ABI = require('@aragon/apps-voting/abi/Voting.json').abi
const CONTROLLER_ABI = require('@aragon/court/abi/Controller.json').abi
const MINIME_ABI = require('@aragon/minime/abi/MiniMeToken.json').abi
const EOPBCTEMPLATE_ABI = require('@aragon/templates-externally-owned-presale-bonding-curve/abi/EOPBCTemplate.json').abi
const CONTROLLED_RECOVERABLE_ABI = require('@aragon/court/abi/ControlledRecoverable.json').abi
const JUROS_REGISTRY_MIGRATOR_ABI = require('@aragonone/court-registry-migrator/abi/JurorsRegistryMigrator.json').abi

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

  encodeChangeController(controllerAddress) {
    const changeControllerABI = this._getFunctionABI(MINIME_ABI, 'changeController', 1)
    return abi.encodeFunctionCall(changeControllerABI, [controllerAddress])
  }

  encodeNewInstance({
    owner,
    id,
    collateralToken,
    bondedToken,
    period,
    openDate,
    exchangeRate,
    beneficiaryPct,
    reserveRatio,
    batchBlocks,
    slippage
  }) {
    const newInstanceABI = this._getFunctionABI(EOPBCTEMPLATE_ABI, 'newInstance')
    return abi.encodeFunctionCall(newInstanceABI, [
      owner,
      id,
      collateralToken,
      bondedToken,
      period,
      openDate,
      [
        exchangeRate,
        beneficiaryPct,
        reserveRatio,
        batchBlocks,
        slippage
      ]
    ])
  }

  encodeRecoverFunds(tokenAddress, destination) {
    const functionABI = this._getFunctionABI(CONTROLLED_RECOVERABLE_ABI, 'recoverFunds', 2)
    return abi.encodeFunctionCall(functionABI, [tokenAddress, destination])
  }

  encodeCloseMigrator() {
    const functionABI = this._getFunctionABI(JUROS_REGISTRY_MIGRATOR_ABI, 'close')
    return abi.encodeFunctionCall(functionABI, [])
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
