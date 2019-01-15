const crypto = require('crypto');
const gbox = require('gbox');

// js type
const jsType = type => source => gbox.jsType(type, source, false);

const paramsType = (param) => {
  if (jsType('String')(param)) {
    return `'${param}'`;
  } if (jsType('Number')(param)) {
    return +param;
  } if (jsType('Array')(param)) {
    const arr = [];
    for (const attr of param) {
      arr.push(`${paramsType(attr)}`);
    }
    return arr.join(', ');
  } if (jsType('Undefined')(param)) {
    return 'NULL';
  }
  return param;
};

const md5 = (source) => {
  const hash = crypto.createHash('md5');
  return hash.update(source).digest('hex');
};

module.exports = { paramsType, md5, jsType };
