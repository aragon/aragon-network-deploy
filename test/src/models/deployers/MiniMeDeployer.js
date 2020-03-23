const fs = require('fs')
const path = require('path')
const Config = require('../../../../data/config/anj').rpc
const Environment = require('../../../../src/models/shared/Environment')
const MiniMeDeployer = require('../../../../src/models/deployers/MiniMeDeployer')

contract('MiniMeDeployer', ([_, sender]) => {
  let environment, token

  const outputFilepath = path.resolve(process.cwd(), `./data/output/minime.test.json`)

  before('build environment', async () => {
    environment = new Environment('rpc', sender)
  })

  beforeEach('deploy', async () => {
    const deployer = new MiniMeDeployer(Config, environment, outputFilepath)
    await deployer.call()
    const deployedContracts = require(outputFilepath)

    const MiniMeToken = await environment.getArtifact('MiniMeToken', '@aragon/minime')
    token = await MiniMeToken.at(deployedContracts[Config.symbol].address)
  })

  afterEach('delete deployment output', () => {
    if (fs.existsSync(outputFilepath)) fs.unlinkSync(outputFilepath)
  })

  it('sets the specified token symbol', async () => {
    const symbol = await token.symbol()
    assert.equal(symbol, Config.symbol, 'token symbol does not match')
  })

  it('sets the specified token name', async () => {
    const name = await token.name()
    assert.equal(name, Config.name, 'token name does not match')
  })

  it('sets the specified token decimals', async () => {
    const decimals = await token.decimals()
    assert.equal(decimals, Config.decimals, 'token decimals do not match')
  })

  it('sets the controller to the sender', async () => {
    const controller = await token.controller()
    assert.equal(controller, sender, 'token controller does not match')
  })

  it('sets the token transferable', async () => {
    const transfersEnabled = await token.transfersEnabled()
    assert.equal(transfersEnabled, Config.transfersEnabled, 'token transfers enable config does not match')
  })
})
