const path = require('path')
const Config = require('../../../config/court')
const Environment = require('../../../src/models/Environment')
const CourtDeployer = require('../../../src/models/CourtDeployer')

const { assertBn } = require('../../helpers/assertBn')
const { MAX_UINT64 } = require('../../../src/helpers/numbers')

contract('CourtDeployer command', ([sender]) => {
  let controller, court, treasury, voting, registry, subscriptions

  beforeEach('run command', async () => {
    const environment = new Environment('rpc', sender)
    const outputFilepath = path.resolve(process.cwd(), `./court.json`)
    const deployer = new CourtDeployer(Config, environment, outputFilepath)

    await deployer.call()
    const deployedContracts = require(outputFilepath)

    const Controller = await environment.getArtifact('Controller')
    controller = await Controller.at(deployedContracts.controller.address)

    const Court = await environment.getArtifact('Court')
    court = await Court.at(deployedContracts.court.address)

    const CourtTreasury = await environment.getArtifact('CourtTreasury')
    treasury = await CourtTreasury.at(deployedContracts.treasury.address)

    const JurorsRegistry = await environment.getArtifact('JurorsRegistry')
    registry = await JurorsRegistry.at(deployedContracts.registry.address)

    const CourtSubscriptions = await environment.getArtifact('CourtSubscriptions')
    subscriptions = await CourtSubscriptions.at(deployedContracts.subscriptions.address)

    const CRVoting = await environment.getArtifact('CRVoting')
    voting = await CRVoting.at(deployedContracts.voting.address)
  })

  describe('controller', () => {
    it('sets the clock config correctly', async () => {
      const termDuration = await controller.getTermDuration()
      assertBn(termDuration, Config.clock.termDuration, 'term duration does not match')

      const currentTermId = await controller.getCurrentTermId()
      assertBn(currentTermId, 0, 'current term ID does not match')

      const { startTime, randomnessBN, randomness } = await controller.getTerm(0)
      const expectedZeroTermStartTime = Config.clock.firstTermStartTime.sub(termDuration)
      assertBn(startTime, expectedZeroTermStartTime, 'zero term start time does not match')
      assertBn(randomnessBN, 0, 'randomness BN does not match')
      assert.equal(randomness, '0x0000000000000000000000000000000000000000000000000000000000000000', 'randomness does not match')
    })

    it('sets the initial config correctly', async () => {
      const { feeToken, fees, roundStateDurations, pcts, roundParams, appealCollateralParams, minActiveBalance } = await controller.getConfig(1)

      // TODO: mock tokens at a test level when commands are fixed
      // assert.equal(feeToken, Config.court.feeToken.address, 'fee token address does not match')

      assertBn(fees[0], Config.court.jurorFee, 'juror fee does not match')
      assertBn(fees[1], Config.court.draftFee, 'draft fee does not match')
      assertBn(fees[2], Config.court.settleFee, 'settle fee does not match')

      assertBn(roundStateDurations[0], Config.court.commitTerms, 'commit terms do not match')
      assertBn(roundStateDurations[1], Config.court.revealTerms, 'reveal terms do not match')
      assertBn(roundStateDurations[2], Config.court.appealTerms, 'appeal terms do not match')
      assertBn(roundStateDurations[3], Config.court.appealConfirmTerms, 'appeal confirmation terms do not match')

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
      assert.equal(await controller.getCourt(), court.address, 'court module does not match')
      assert.equal(await controller.getModule(Config.controller.court), court.address, 'court module does not match')

      assert.equal(await controller.getTreasury(), treasury.address, 'treasury module does not match')
      assert.equal(await controller.getModule(Config.controller.treasury), treasury.address, 'treasury module does not match')

      assert.equal(await controller.getVoting(), voting.address, 'voting module does not match')
      assert.equal(await controller.getModule(Config.controller.voting), voting.address, 'voting module does not match')

      assert.equal(await controller.getJurorsRegistry(), registry.address, 'registry module does not match')
      assert.equal(await controller.getModule(Config.controller.registry), registry.address, 'registry module does not match')

      assert.equal(await controller.getSubscriptions(), subscriptions.address, 'subscriptions module does not match')
      assert.equal(await controller.getModule(Config.controller.subscriptions), subscriptions.address, 'subscriptions module does not match')
    })

    it('sets the governor correctly', async () => {
      assert.equal(await controller.getFundsGovernor(), Config.governor.funds, 'funds governor does not match')
      assert.equal(await controller.getConfigGovernor(), Config.governor.config, 'config governor does not match')
      assert.equal(await controller.getModulesGovernor(), Config.governor.modules, 'modules governor does not match')
    })
  })

  describe('court', () => {
    it('sets the config correctly', async () => {
      assertBn(await court.maxJurorsPerDraftBatch(), Config.court.maxJurorsPerDraftBatch, 'max jurors per draft batch does not match')
    })

    it('sets the controller correctly', async () => {
      assert.equal(await court.getController(), controller.address, 'court controller does not match')
    })
  })

  describe('voting', () => {
    it('sets the controller correctly', async () => {
      assert.equal(await voting.getController(), controller.address, 'voting controller does not match')
    })
  })

  describe('treasury', () => {
    it('sets the controller correctly', async () => {
      assert.equal(await treasury.getController(), controller.address, 'treasury controller does not match')
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

      // TODO: mock tokens at a test level when commands are fixed
      // assert.equal(await subscriptions.currentFeeToken(), Config.subscriptions.feeToken.address, 'subscriptions fee token does not match')
    })

    it('sets the controller correctly', async () => {
      assert.equal(await subscriptions.getController(), controller.address, 'subscriptions controller does not match')
    })
  })

  describe('registry', () => {
    it('sets the config correctly', async () => {
      const totalActiveBalanceLimit = Config.jurors.minActiveBalance.mul(MAX_UINT64.div(Config.court.finalRoundWeightPrecision))
      assertBn(await registry.totalJurorsActiveBalanceLimit(), totalActiveBalanceLimit, 'total active balance limit does not match')

      // TODO: mock tokens at a test level when commands are fixed
      // assert.equal(await registry.token(), Config.jurors.token.address, 'jurors token does not match')
    })

    it('sets the controller correctly', async () => {
      assert.equal(await registry.getController(), controller.address, 'registry controller does not match')
    })
  })
})
