const fs = require('fs')
const path = require('path')
const logger = require('./logger')('require-output')

module.exports = (fileName, callback = undefined, ifUndefined = undefined) => {
  const file = `./data/output/${fileName}.json`
  const filePath = path.resolve(process.cwd(), file)

  if (!fs.existsSync(filePath)) {
    logger.warn(`Could not find '${fileName}' output in ${filePath}`)
    return ifUndefined
  }

  const output = require(filePath)
  return callback ? callback(output) : output
}
