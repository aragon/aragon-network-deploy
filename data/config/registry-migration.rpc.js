const { bn } = require('../../src/helpers/numbers')

const TERM_DURATION = 60 * 10                                        // 10 minutes
const START_DATE = Math.floor(new Date() / 1000 + 2 * TERM_DURATION) // 20 minutes from now

module.exports = {
  owner:              undefined,       // Set with an AN DAO deployed to Aragen
  bondedToken:        undefined,       // Set with the ANJ instance deployed to Aragen
  aragonNetworkDAO: {
    votingApp:        undefined,       // Set with the voting app of the AN DAO deployed to Aragen
    tokenManager:     undefined,       // Set with the token manager of the AN DAO deployed to Aragen
  },
  court:              undefined,       // Set with Court's controller instance on rpc
  disputeManager:     undefined,       // Original Dispute Manager
  oldRegistry:        undefined,       // Court's old Jurors Registry instance on rpc
  newRegistry:        undefined,       // Court's Jurors Registry instance on rpc
  migrator:           undefined,       // Address of migrator contract
  firstTermStartTime:  bn(START_DATE),                                    // first term start timestamp in seconds
}
