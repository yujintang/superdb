const _ = require('lodash');

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

module.exports = { paramsType };
