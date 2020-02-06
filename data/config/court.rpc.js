const { bn, bigExp } = require('../../src/helpers/numbers')

const TERM_DURATION = 60 * 10                                        // 10 minutes
const START_DATE = Math.floor(new Date() / 1000 + 2 * TERM_DURATION) // 20 minutes from now

const ANJ = {
  symbol: 'ANJ',
  decimals: 18,
  address: undefined              // if unset, it will try to fetch it from a previous deploy for devnet rpc
}

const DAI = {
  symbol: 'DAI',
  decimals: 18,
  address: undefined              // if unset, it will try to fetch it from a previous deploy for devnet rpc
}

module.exports = {
  governor: {
    funds:                        '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7', // aragon devchain initial deterministic address
    config:                       '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7', // aragon devchain initial deterministic address
    modules:                      '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7', // aragon devchain initial deterministic address
  },
  clock: {
    termDuration:                  bn(TERM_DURATION),            // terms lasts 10 minutes
    firstTermStartTime:            bn(START_DATE),               // first term start timestamp in seconds
  },
  court: {
    feeToken:                      DAI,                          // fee token for the court is DAI
    evidenceTerms:                 bn(21),                       // evidence period lasts 21 terms (7 days)
    commitTerms:                   bn(6),                        // vote commits lasts 6 terms (2 days)
    revealTerms:                   bn(6),                        // vote reveals lasts 6 terms (2 days)
    appealTerms:                   bn(6),                        // appeals lasts 6 terms (2 days)
    appealConfirmTerms:            bn(6),                        // appeal confirmations lasts 6 terms (2 days)
    maxJurorsPerDraftBatch:        bn(81),                       // max number of jurors drafted per batch
    jurorFee:                      bigExp(10, DAI.decimals),     // 10 fee tokens for juror fees
    draftFee:                      bigExp(18, DAI.decimals - 2), // 0.18 fee tokens for draft fees
    settleFee:                     bigExp(1, DAI.decimals - 1),  // 0.1 fee tokens for settle fees
    penaltyPct:                    bn(1000),                     // 10% of the min active balance will be locked to each drafted juror
    finalRoundReduction:           bn(5000),                     // 50% of discount for final rounds
    firstRoundJurorsNumber:        bn(3),                        // disputes will start with 3 jurors
    appealStepFactor:              bn(3),                        // the number of jurors to be drafted will be incremented 3 times on each appeal
    maxRegularAppealRounds:        bn(4),                        // there can be up to 4 appeals in total per dispute
    finalRoundLockTerms:           bn(21),                       // coherent jurors in the final round won't be able to withdraw for 21 terms (7 days)
    appealCollateralFactor:        bn(30000),                    // appeal collateral is 3x of the corresponding juror fees
    appealConfirmCollateralFactor: bn(20000),                    // appeal-confirmation collateral is 2x of the corresponding juror fees
    finalRoundWeightPrecision:     bn(1000),                     // use to improve division rounding for final round maths
  },
  jurors: {
    token:                         ANJ,
    minActiveBalance:              bigExp(100, ANJ.decimals),    // 100 ANJ is the minimum balance jurors must activate to participate in the Court
  },
  subscriptions: {
    feeToken:                      DAI,                          // fee token for subscriptions is DAI
    feeAmount:                     bigExp(10, DAI.decimals),     // 10 fee tokens per subscription period
    periodDuration:                bn(90),                       // each subscription period lasts 90 terms (30 days)
    prePaymentPeriods:             bn(12),                       // cannot pre-pay more than 12 periods in advance (1 year)
    resumePrePaidPeriods:          bn(12),                       // 12 pre-paid periods when resuming activity (1 year)
    latePaymentPenaltyPct:         bn(1000),                     // late payment subscriptions are charged 20%
    governorSharePct:              bn(0),                        // 0% of the subscription fees
  },
  controller: {
    disputes:                     '0x14a6c70f0f6d449c014c7bbc9e68e31e79e8474fb03b7194df83109a2d888ae6',   // DISPUTE_MANAGER module ID
    treasury:                     '0x06aa03964db1f7257357ef09714a5f0ca3633723df419e97015e0c7a3e83edb7',   // TREASURY module ID
    voting:                       '0x7cbb12e82a6d63ff16fe43977f43e3e2b247ecd4e62c0e340da8800a48c67346',   // VOTING module ID
    registry:                     '0x3b21d36b36308c830e6c4053fb40a3b6d79dde78947fbf6b0accd30720ab5370',   // JURORS_REGISTRY module ID
    subscriptions:                '0x2bfa3327fe52344390da94c32a346eeb1b65a8b583e4335a419b9471e88c1365'    // SUBSCRIPTIONS module ID
  }
}
