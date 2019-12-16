const fs = require('fs')
const path = require('path')
const axios = require('axios')
const query = require('querystring')
const sleep = require('../helpers/sleep')
const logger = require('../helpers/logger')('Verifier')
const flattener = require('truffle-flattener')

const SUBDOMAINS = {
  mainnet: 'api',
  rinkeby: 'api-rinkeby',
  staging: 'api-rinkeby',
  ropsten: 'api-ropsten',
}

const DEFAULT_VERIFICATION_PARAMS = {
  module: 'contract',
  action: 'verifysourcecode',
  codeformat: 'solidity-single-file',
}

const DEFAULT_OPTIMIZER_SETTINGS = {
  settings: {
    optimizer: {
      enabled: true,
      runs: 10000
    }
  }
}

module.exports = class {
  constructor(environment, apiKey, retryCount = 4, retrySleepTime = 10) {
    this.apiKey = apiKey
    this.environment = environment
    this.retryCount = retryCount
    this.retrySleepTime = retrySleepTime
  }

  async call(instance, dependency = undefined, headers = []) {
    const schema = instance.constructor._json
    const compilerversion = `v${schema.compiler.version.replace('.Emscripten.clang', '')}`
    const metadata = schema.metadata ? JSON.parse(schema.metadata) : DEFAULT_OPTIMIZER_SETTINGS
    const optimizer = metadata.settings.optimizer
    const optimizationUsed = optimizer.enabled ? 1 : 0
    const runs = optimizer.runs

    const network = this.environment.network
    const apiUrl = this.getApiUrl(network)
    const etherscanUrl = this.getEtherscanUrl(network)

    const sourcePath = this._findSourcePath(schema, dependency)
    const flattenedCode = await flattener([sourcePath], process.cwd())
    const sourceCode = `/**\n* ${headers.join('\n* ')}\n**/\n${flattenedCode}`
    const contractname = schema.contractName
    const contractaddress = instance.address
    const constructorArguments = await this.fetchConstructorArguments(apiUrl, instance)
    const contractUrl = `${etherscanUrl}/${contractaddress}#code`

    const body = { contractaddress, sourceCode, contractname, constructorArguments, compilerversion, optimizationUsed, runs }
    logger.info(`Verifying contract ${contractname} at ${contractaddress} to ${apiUrl} ...`)
    if (Object.keys(SUBDOMAINS).includes(network)) await sleep(this.retrySleepTime)

    try {
      const response = await this._verify(apiUrl, body)
      if (response.status === 200 && response.data.status === '1') {
        await this.checkVerification(response.data.result, apiUrl)
        logger.success(`${contractname} verified successfully, see ${contractUrl}`)
      } else {
        throw Error(`Error while trying to verify contract: ${response.data.result}`)
      }
    } catch (error) {
      throw Error(error.message || 'Error while trying to verify contract')
    }
    return contractUrl
  }

  async checkVerification(guid, url, intent = 1) {
    try {
      logger.info(`Checking contract verification with GUID ${guid}, intent #${intent} ...`)
      const response = await this._fetchVerification(url, guid)
      if (response.data.status !== '1') throw Error(`Error while trying to verify contract: ${response.data.result}`)
    } catch (error) {
      if (intent === this.retryCount) throw Error(error.message || 'Error while trying to check verification status')
      await sleep(this.retrySleepTime)
      await this.checkVerification(guid, url, intent + 1)
    }
  }

  async fetchConstructorArguments(url, instance, intent = 1) {
    try {
      logger.info(`Fetching constructor arguments, intent #${intent} ...`)
      const response = await this._fetchConstructor(url, instance.address)
      if (response.data.status !== '1') throw Error(`Error while trying to fetch constructor arguments: ${response.data.result}`)
      const constructorArguments = response.data.result[0].input.substring(instance.constructor.bytecode.length)
      if (constructorArguments === undefined) throw Error('Fetched constructor arguments is undefined')
      return constructorArguments
    } catch (error) {
      if (intent === this.retryCount) throw Error(error.message || 'Error while trying to fetch constructor arguments')
      await sleep(this.retrySleepTime)
      await this.fetchConstructorArguments(url, instance, intent + 1)
    }
  }

  getEtherscanUrl(network) {
    const subdomain = network === 'mainnet' ? '' : (network === 'staging') ? 'rinkeby.' : `${network}.`
    return `https://${subdomain}etherscan.io/address`
  }

  getApiUrl(network) {
    const subdomain = SUBDOMAINS[network]
    if (!subdomain) throw Error(`Invalid network, please use any of ${Object.keys(SUBDOMAINS).join(', ')}.`)
    return `https://${subdomain}.etherscan.io/api`
  }

  async _verify(apiUrl, body) {
    const queryParams = query.stringify({ apikey: this.apiKey, ...DEFAULT_VERIFICATION_PARAMS, ...body })
    return axios.post(apiUrl, queryParams)
  }

  async _fetchVerification(apiUrl, guid) {
    const queryParams = query.stringify({ guid, action: 'checkverifystatus', module: 'contract' })
    return axios.get(`${apiUrl}?${queryParams}`)
  }

  async _fetchConstructor(apiUrl, address) {
    const queryParams = query.stringify({ address, action: 'txlist', module: 'account', page: 1, sort: 'asc', offset: 1 })
    return axios.get(`${apiUrl}?${queryParams}`)
  }

  _findSourcePath(schema, dependency = undefined) {
    const absolutePath = schema.sourcePath
    const fileName = absolutePath.replace(/^.*[\\\/]/, '')
    const dir = dependency
      ? `${process.cwd()}/node_modules/${dependency}`
      : `${process.cwd()}/contracts`

    return this._findFile(dir, fileName)
  }

  _findFile(dir, findingFileName) {
    const stat = fs.statSync(dir)
    if (!stat || !stat.isDirectory()) {
      const currentFileName = dir.replace(/^.*[\\\/]/, '')
      return currentFileName === findingFileName ? dir : undefined
    }

    const list = fs.readdirSync(dir)
    for (const fileName of list) {
      const filePath = path.resolve(dir, fileName)
      const foundFile = this._findFile(filePath, findingFileName)
      if (foundFile) return foundFile
    }
  }
}
