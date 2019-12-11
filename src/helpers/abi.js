const VOTING_ABI = require('@aragon/apps-voting/abi/Voting.json').abi
const AGENT_ABI = require('@aragon/apps-agent/abi/Agent.json').abi
const MINIME_ABI = require('@aragon/minime/abi/MiniMeToken.json').abi
const EOPBCTEMPLATE_ABI = require('@aragon/templates-externally-owned-presale-bonding-curve/abi/EOPBCTemplate.json').abi

const functionAbi = (contractAbi, functionName, inputsLength) => contractAbi.find(
  interface => interface.type === 'function' && interface.name === functionName &&
    (inputsLength == undefined || interface.inputs.length === inputsLength)
)

const NEW_VOTE_ABI = functionAbi(VOTING_ABI, 'newVote', 2)
const EXECUTE_ABI = functionAbi(AGENT_ABI, 'execute')
const CHANGE_CONTROLLER_ABI = functionAbi(MINIME_ABI, 'changeController', 1)
const NEW_INSTANCE_ABI = functionAbi(EOPBCTEMPLATE_ABI, 'newInstance')

module.exports = {
  NEW_VOTE_ABI,
  EXECUTE_ABI,
  CHANGE_CONTROLLER_ABI,
  NEW_INSTANCE_ABI,
}
