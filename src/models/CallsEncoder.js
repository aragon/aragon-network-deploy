const abi = require('web3-eth-abi')
const AGENT_ABI = require('@aragon/apps-agent/abi/Agent.json').abi
const VOTING_ABI = require('@aragon/apps-voting/abi/Voting.json').abi
const CONTROLLER_ABI = require('@aragon/court/abi/Controller.json').abi

const CALLSCRIPT_ID = '0x00000001'
const EMPTY_CALLSCRIPT = '0x00000001'

module.exports = class CallsEncoder {
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
