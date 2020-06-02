const fs = require('fs')
const path = require('path')
const logger = require('./logger')('require-output')

const requireOutput = (fileName, callback = undefined, ifUndefined = undefined) => {
  const file = `./data/output/${fileName}.json`
  const filePath = path.resolve(process.cwd(), file)

  if (!fs.existsSync(filePath)) {
    logger.warn(`Could not find '${fileName}' output in ${filePath}`)
    return ifUndefined
  }

  const output = require(filePath)
  return callback ? callback(output) : output
}

const getAddressIfDefined = (contract) => (object) => object[contract] ? object[contract].address : undefined

module.exports = {
  requireOutput,
  getAddressIfDefined
}
