const { bn } = require('../../src/helpers/numbers')

const TERM_DURATION = 60 * 10                                        // 10 minutes
const START_DATE = Math.floor(new Date() / 1000 + 2 * TERM_DURATION) // 20 minutes from now

module.exports = {
  owner:              '0xde8bf81d4a8b67f51dc909035cca5b4e14e92d88',       // Agent of AN DAO
  bondedToken:        '0xae83b8A9983b934Ebed4167BfDC4170d2A1E3D76',       // ANJ
  aragonNetworkDAO: {
    votingApp:        '0xaad2ccf51b42ea7f27948c38b4f7afd8174ef217',       // Voting of AN DAO
    tokenManager:     '0x08d25ce71579c2b97b688bc8a7d0b35b92504ec3',       // Token Manager of AN DAO
  },
  court:              '0xD0DcFC6B5b36f7E77f3Daa2D9031B241651A6916',       // Court's controller
  disputeManager:     '0x8a8b31a2a20bb6153625c1D37c5E9bfBb52a30b7',       // Original Dispute Manager
  oldRegistry:        '0x3497b2F7eEB7f1BeEFb044c6DA90110C4D6d5C4E',       // Court's old Jurors Registry instance
  newRegistry:        '',       // Court's new Jurors Registry instance
  migrator:           '',       // Address of migrator contract
  firstTermStartTime:  bn(START_DATE),                                    // first term start timestamp in seconds
}
