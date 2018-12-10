const { isInteger } = require('lodash');

const Pivot = require('./pivot');

class Superdb {
  constructor(config, options = {}) {
    this.config = config;
    this.options = {
      dialect: options.dialect || 'mysql',
      pool: options.pool !== false,
      promise: options.promise !== false,
      logging: options.logging === true,
      maxLimit: isInteger(options.maxLimit) ? options.maxLimit : -1,
    };
  }

  async createConn() {
    const conn = await new Pivot(this).createConn();
    return conn;
  }
}

module.exports = Superdb;
