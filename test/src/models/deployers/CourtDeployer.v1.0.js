const fs = require('fs')
const path = require('path')
const Config = require('../../../../data/input/court').rpc
const Environment = require('../../../../src/models/shared/Environment')
const CourtDeployer = require('../../../../src/models/deployers/CourtDeployer.v1.0')

const { assertBn } = require('../../../helpers/assertBn')
const { MAX_UINT64 } = require('../../../../src/helpers/numbers')
const { DISPUTE_MANAGER_ID, SUBSCRIPTIONS_ID, VOTING_ID, TREASURY_ID, JURORS_REGISTRY_ID } = require('../../../../src/helpers/court-modules')

const SNAPSHOT_BLOCK = 0
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

contract('CourtDeployer v1.0', ([_, sender]) => {
  let environment, DAI, ANJ
  let court, disputes, treasury, voting, registry, subscriptions

  const outputFilepath = path.resolve(process.cwd(), `./data/output/court.test.json`)

  before('build environment and mock tokens', async () => {
    environment = new Environment('rpc', sender)

    const ERC20 = await environment.getArtifact('ERC20Mock', '@aragon/court')
    DAI = await ERC20.new('DAI Token', 'DAI', 18)
    Config.court.feeToken.address = DAI.address
    Config.subscriptions.feeToken.address = DAI.address

    const MiniMeToken = await environment.getArtifact('MiniMeToken', '@aragon/minime')
    ANJ = await MiniMeToken.new(ZERO_ADDRESS, ZERO_ADDRESS, SNAPSHOT_BLOCK, 'Aragon Network Juror Token', 18, 'ANJ', true)
    Config.jurors.token.address = ANJ.address
  })

  beforeEach('deploy', async () => {
    const deployer = new CourtDeployer(Config, environment, outputFilepath)
    await deployer.call()
    const deployedContracts = require(outputFilepath)

    const AragonCourt = await environment.getArtifact('AragonCourt', '@aragon/court')
    court = await AragonCourt.at(deployedContracts.court.address)

    const DisputeManager = await environment.getArtifact('DisputeManager', '@aragon/court')
    disputes = await DisputeManager.at(deployedContracts.disputes.address)

    const CourtTreasury = await environment.getArtifact('CourtTreasury', '@aragon/court')
    treasury = await CourtTreasury.at(deployedContracts.treasury.address)

    const JurorsRegistry = await environment.getArtifact('JurorsRegistry', '@aragon/court')
    registry = await JurorsRegistry.at(deployedContracts.registry.address)

    const CourtSubscriptions = await environment.getArtifact('CourtSubscriptions', '@aragon/court')
    subscriptions = await CourtSubscriptions.at(deployedContracts.subscriptions.address)

    const CRVoting = await environment.getArtifact('CRVoting', '@aragon/court')
    voting = await CRVoting.at(deployedContracts.voting.address)
  })

  afterEach('delete deployment output', () => {
    if (fs.existsSync(outputFilepath)) fs.unlinkSync(outputFilepath)
  })

  describe('court', () => {
    it('sets the clock config correctly', async () => {
      const termDuration = await court.getTermDuration()
      assertBn(termDuration, Config.clock.termDuration, 'term duration does not match')

      const currentTermId = await court.getCurrentTermId()
      assertBn(currentTermId, 0, 'current term ID does not match')

      const { startTime, randomnessBN, randomness } = await court.getTerm(0)
      const expectedZeroTermStartTime = Config.clock.firstTermStartTime.sub(termDuration)
      assertBn(startTime, expectedZeroTermStartTime, 'zero term start time does not match')
      assertBn(randomnessBN, 0, 'randomness BN does not match')
      assert.equal(randomness, '0x0000000000000000000000000000000000000000000000000000000000000000', 'randomness does not match')
    })

    it('sets the initial config correctly', async () => {
      const { feeToken, fees, roundStateDurations, pcts, roundParams, appealCollateralParams, minActiveBalance } = await court.getConfig(1)

      assert.equal(feeToken, Config.court.feeToken.address, 'fee token address does not match')
      assertBn(fees[0], Config.court.jurorFee, 'juror fee does not match')
      assertBn(fees[1], Config.court.draftFee, 'draft fee does not match')
      assertBn(fees[2], Config.court.settleFee, 'settle fee does not match')

      assertBn(roundStateDurations[0], Config.court.evidenceTerms, 'evidence terms do not match')
      assertBn(roundStateDurations[1], Config.court.commitTerms, 'commit terms do not match')
      assertBn(roundStateDurations[2], Config.court.revealTerms, 'reveal terms do not match')
      assertBn(roundStateDurations[3], Config.court.appealTerms, 'appeal terms do not match')
      assertBn(roundStateDurations[4], Config.court.appealConfirmTerms, 'appeal confirmation terms do not match')

      assertBn(pcts[0], Config.court.penaltyPct, 'penalty pct does not match')
      assertBn(pcts[1], Config.court.finalRoundReduction, 'final round reduction does not match')

      assertBn(roundParams[0], Config.court.firstRoundJurorsNumber, 'first round jurors number does not match')
      assertBn(roundParams[1], Config.court.appealStepFactor, 'appeal step factor do not match')
      assertBn(roundParams[2], Config.court.maxRegularAppealRounds, 'max regular appeal rounds do not match')
      assertBn(roundParams[3], Config.court.finalRoundLockTerms, 'final round lock terms do not match')

      assertBn(appealCollateralParams[0], Config.court.appealCollateralFactor, 'appeal confirmation collateral factor do not match')
      assertBn(appealCollateralParams[1], Config.court.appealConfirmCollateralFactor, 'appeal confirmation collateral factor does not match')

      assertBn(minActiveBalance, Config.jurors.minActiveBalance, 'min active balance does not match')
    })

    it('sets the modules correctly', async () => {
      assert.equal(await court.getDisputeManager(), disputes.address, 'disputes module does not match')
      assert.equal(await court.getModule(DISPUTE_MANAGER_ID), disputes.address, 'disputes module does not match')

      assert.equal(await court.getTreasury(), treasury.address, 'treasury module does not match')
      assert.equal(await court.getModule(TREASURY_ID), treasury.address, 'treasury module does not match')

      assert.equal(await court.getVoting(), voting.address, 'voting module does not match')
      assert.equal(await court.getModule(VOTING_ID), voting.address, 'voting module does not match')

      assert.equal(await court.getJurorsRegistry(), registry.address, 'registry module does not match')
      assert.equal(await court.getModule(JURORS_REGISTRY_ID), registry.address, 'registry module does not match')

      assert.equal(await court.getSubscriptions(), subscriptions.address, 'subscriptions module does not match')
      assert.equal(await court.getModule(SUBSCRIPTIONS_ID), subscriptions.address, 'subscriptions module does not match')
    })

    it('sets the governor correctly', async () => {
      assert.equal(await court.getFundsGovernor(), Config.governor.funds.address, 'funds governor does not match')
      assert.equal(await court.getConfigGovernor(), Config.governor.config.address, 'config governor does not match')
      assert.equal(await court.getModulesGovernor(), Config.governor.modules.address, 'modules governor does not match')
    })
  })

  describe('disputes', () => {
    it('sets the config correctly', async () => {
      assertBn(await disputes.maxJurorsPerDraftBatch(), Config.court.maxJurorsPerDraftBatch, 'max jurors per draft batch does not match')
    })

    it('sets the controller correctly', async () => {
      assert.equal(await disputes.getController(), court.address, 'court controller does not match')
    })
  })

  describe('voting', () => {
    it('sets the controller correctly', async () => {
      assert.equal(await voting.getController(), court.address, 'voting controller does not match')
    })
  })

  describe('treasury', () => {
    it('sets the controller correctly', async () => {
      assert.equal(await treasury.getController(), court.address, 'treasury controller does not match')
    })
  })

  describe('subscriptions', () => {
    it('sets the config correctly', async () => {
      assertBn(await subscriptions.periodDuration(), Config.subscriptions.periodDuration, 'period duration does not match')
      assertBn(await subscriptions.currentFeeAmount(), Config.subscriptions.feeAmount, 'subscriptions fee amount does not match')
      assertBn(await subscriptions.prePaymentPeriods(), Config.subscriptions.prePaymentPeriods, 'pre payment periods do not match')
      assertBn(await subscriptions.resumePrePaidPeriods(), Config.subscriptions.resumePrePaidPeriods, 'resume pre-paid periods do not match')
      assertBn(await subscriptions.latePaymentPenaltyPct(), Config.subscriptions.latePaymentPenaltyPct, 'subscriptions penalty pct does not match')
      assertBn(await subscriptions.governorSharePct(), Config.subscriptions.governorSharePct, 'subscriptions governor share does not match')
      assert.equal(await subscriptions.currentFeeToken(), Config.subscriptions.feeToken.address, 'subscriptions fee token does not match')
    })

    it('sets the controller correctly', async () => {
      assert.equal(await subscriptions.getController(), court.address, 'subscriptions controller does not match')
    })
  })

  describe('registry', () => {
    it('sets the config correctly', async () => {
      const totalActiveBalanceLimit = Config.jurors.minActiveBalance.mul(MAX_UINT64.div(Config.court.finalRoundWeightPrecision))
      assertBn(await registry.totalJurorsActiveBalanceLimit(), totalActiveBalanceLimit, 'total active balance limit does not match')

      assert.equal(await registry.token(), ANJ.address, 'jurors token address does not match')
    })

    it('sets the controller correctly', async () => {
      assert.equal(await registry.getController(), court.address, 'registry controller does not match')
    })
  })
})
