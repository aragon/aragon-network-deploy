const abi = require('web3-eth-abi')
const { NEW_VOTE_ABI, EXECUTE_ABI, CHANGE_CONTROLLER_ABI, NEW_INSTANCE_ABI } = require('./abi')

const CALLSCRIPT_ID = '0x00000001'
const EMPTY_CALLSCRIPT = '0x00000001'

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
function encodeCallsScript (actions) {
  return actions.reduce((script, { to, data }) => {
    const address = abi.encodeParameter('address', to)
    const dataLength = abi.encodeParameter('uint256', (data.length - 2) / 2).toString('hex')

    return script + address.slice(26) + dataLength.slice(58) + data.slice(2)
  }, CALLSCRIPT_ID)
}

function encodeNewVote (executionScript, metadata) {
  if (!executionScript || executionScript === '0x') {
    executionScript = EMPTY_CALLSCRIPT
  }
  return abi.encodeFunctionCall(NEW_VOTE_ABI, [executionScript, metadata])
}

function encodeExecute (target, ethValue, executionScript) {
  if (!executionScript || executionScript === '0x') {
    executionScript = EMPTY_CALLSCRIPT
  }
  return abi.encodeFunctionCall(EXECUTE_ABI, [target, ethValue, executionScript])
}

function encodeChangeController (controllerAddress) {
  return abi.encodeFunctionCall(CHANGE_CONTROLLER_ABI, [controllerAddress])
}

function encodeNewInstance ({
  owner,
  id,
  collateralToken,
  bondedToken,
  period,
  exchangeRate,
  openDate,
  reserveRatio,
  batchBlocks,
  slippage
}) {
  return abi.encodeFunctionCall(NEW_INSTANCE_ABI, [
    owner,
    id,
    collateralToken,
    bondedToken,
    period,
    exchangeRate,
    openDate,
    reserveRatio,
    batchBlocks,
    slippage
  ])
}

module.exports = {
  encodeCallsScript,
  encodeNewVote,
  encodeExecute,
  encodeChangeController,
  encodeNewInstance,
}
