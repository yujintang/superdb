const _ = require('lodash');
const crypto = require('crypto');

const paramsType = (param) => {
  if (_.isString(param)) {
    return `'${param}'`;
  } if (_.isNumber(param)) {
    return +param;
  } if (_.isArray(param)) {
    const arr = [];
    for (const attr of param) {
      arr.push(`${paramsType(attr)}`);
    }
    return arr.join(', ');
  }
  return param;
};

const md5 = (source) => {
  const hash = crypto.createHash('md5');
  return hash.update(source).digest('hex');
};

module.exports = { paramsType, md5 };
