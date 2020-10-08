const { bn, bigExp } = require('../../src/helpers/numbers')
const { rinkeby: governor } = require('./governor')
const { requireOutput, getAddressIfDefined } = require('../../src/helpers/require-output')

const TERM_DURATION = 60 * 10                                          // 10 minutes
const START_DATE = Math.floor(new Date() / 1000 + TERM_DURATION + 120) // 2 minutes from now

const ANJ = {
  symbol: 'ANJ',
  decimals: 18,
  address: requireOutput('minime.rinkeby', getAddressIfDefined('ANJ'))
}

const ANT = {
  symbol: 'ANT',
  decimals: 18,
  address: requireOutput('minime.rinkeby', getAddressIfDefined('ANT'))
}

module.exports = {
  governor: {                      // Agent of AN DAO
    funds:                         governor,
    config:                        governor,
    modules:                       governor,
  },
  clock: {
    termDuration:                  bn(TERM_DURATION),            // terms lasts 10 minutes
    firstTermStartTime:            bn(START_DATE),               // first term start timestamp in seconds
  },
  court: {
    feeToken:                      ANT,                          // fee token for the court is ANT
    evidenceTerms:                 bn(2),                        // evidence period lasts 2 terms (20 minutes)
    commitTerms:                   bn(2),                        // vote commits last 2 terms (20 minutes)
    revealTerms:                   bn(2),                        // vote reveals last 2 terms (20 minutes)
    appealTerms:                   bn(2),                        // appeals last 2 terms (20 minutes)
    appealConfirmTerms:            bn(2),                        // appeal confirmations last 2 terms (20 minutes)
    maxJurorsPerDraftBatch:        bn(81),                       // max number of jurors drafted per batch
    jurorFee:                      bigExp(10, ANT.decimals),     // 10 fee tokens for juror fees
    draftFee:                      bigExp(3, ANT.decimals),      // 3 fee tokens for draft fees
    settleFee:                     bigExp(2, ANT.decimals),      // 2 fee tokens for settle fees
    penaltyPct:                    bn(1000),                     // 10% of the min active balance will be locked to each drafted juror
    finalRoundReduction:           bn(5000),                     // 50% of discount for final rounds
    firstRoundJurorsNumber:        bn(3),                        // disputes will start with 3 jurors
    appealStepFactor:              bn(3),                        // the number of jurors to be drafted will be incremented 3 times on each appeal
    maxRegularAppealRounds:        bn(4),                        // there can be up to 4 appeals in total per dispute
    finalRoundLockTerms:           bn(21),                       // coherent jurors in the final round won't be able to withdraw for 21 terms (7 days)
    appealCollateralFactor:        bn(30000),                    // appeal collateral is 3x of the corresponding juror fees
    appealConfirmCollateralFactor: bn(20000),                    // appeal-confirmation collateral is 2x of the corresponding juror fees
    finalRoundWeightPrecision:     bn(1000),                     // use to improve division rounding for final round maths
    skippedDisputes:               0,                            // number of dispute to skip
  },
  jurors: {
    token:                         ANJ,
    minActiveBalance:              bigExp(100, ANJ.decimals),    // 100 ANJ is the minimum balance jurors must activate to participate in the Court
  },
  subscriptions: {
    feeToken:                      ANT,                          // fee token for subscriptions is ANT
    periodDuration:                bn(3),                        // each subscription period lasts 3 terms (30 minutes)
    governorSharePct:              bn(0),                        // 0% of the subscription fees
  }
}
