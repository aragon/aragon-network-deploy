const fs = require('fs')
const path = require('path')
const Config = require('../../../../data/input/wrapper-presale').rpc
const Governor = require('../../../../src/models/shared/Governor')
const Environment = require('../../../../src/models/shared/Environment')
const WrapperPresaleDeployer = require('../../../../src/models/deployers/WrapperPresaleDeployer')

const { bigExp } = require('../../../../src/helpers/numbers')

contract('WrapperPresaleDeployer', ([_, sender, agent, voting, tokenManager]) => {
  let environment, wrapper, courtPresale, uniswapFactory, ANJ, jurorsRegistry

  const outputFilepath = path.resolve(process.cwd(), `./data/output/wrapper-presale.test.json`)

  before('build environment and mock dependencies', async () => {
    environment = new Environment('rpc', sender)

    const UniswapFactory = await environment.getArtifact('UniswapFactory', '@aragon/court-presale-activate')
    uniswapFactory = await UniswapFactory.new()

    const ERC20 = await environment.getArtifact('ERC20Mock', '@aragon/court')
    ANJ = await ERC20.new('ANJ', 'ANJ', 18)

    const JurorsRegistry = await environment.getArtifact('JurorsRegistry', '@aragon/court')
    jurorsRegistry = await JurorsRegistry.new(ANJ.address, ANJ.address, bigExp(1000, 18))

    const BalanceRedirectPresale = await environment.getArtifact('BalanceRedirectPresale', '@aragon/court-presale')
    courtPresale = await BalanceRedirectPresale.new()

    Config.presale = courtPresale.address
    Config.uniswap = uniswapFactory.address
    Config.registry = jurorsRegistry.address
    Config.bondedToken = ANJ.address
  })

  afterEach('delete deployment output', () => {
    if (fs.existsSync(outputFilepath)) fs.unlinkSync(outputFilepath)
  })

  const deployPresaleWrapper = owner => {
    beforeEach('deploy', async () => {
      Config.governor = Governor(owner)
      const deployer = new WrapperPresaleDeployer(Config, environment, outputFilepath)
      await deployer.call()
      const deployedWrapper = JSON.parse(fs.readFileSync(outputFilepath))

      const PresaleWrapper = await environment.getArtifact('CourtPresaleActivate', '@aragon/court-presale-activate')
      wrapper = await PresaleWrapper.at(deployedWrapper.address)
    })
  }

  const itDeploysPresaleWrapperSuccessfully = expectedGovernor => {
    it('deploys the presale wrapper', async () => {
      const governor = await wrapper.governor()
      assert.equal(governor, expectedGovernor, 'governor does not match')

      const bondedToken = await wrapper.bondedToken()
      assert.equal(bondedToken, ANJ.address, 'bonded token does not match')

      const registry = await wrapper.registry()
      assert.equal(registry, jurorsRegistry.address, 'jurors registry does not match')

      const presale = await wrapper.presale()
      assert.equal(presale, courtPresale.address, 'presale does not match')

      const uniswap = await wrapper.uniswapFactory()
      assert.equal(uniswap, uniswapFactory.address, 'uniswap factory does not match')
    })
  }

  context('when the governor is an EOA', () => {
    const governor = sender

    deployPresaleWrapper(governor)
    itDeploysPresaleWrapperSuccessfully(governor)
  })

  context('when the governor is a DAO', () => {
    const dao = { agent, voting, tokenManager }

    deployPresaleWrapper(dao)
    itDeploysPresaleWrapperSuccessfully(dao.agent)
  })
})
