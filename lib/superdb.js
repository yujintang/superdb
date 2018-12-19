const { isInteger, merge } = require('lodash');

const Pivot = require('./pivot');

class Superdb {
  constructor(config, options = {}) {
    this.config = config;
    this.options = {
      dialect: options.dialect || 'mysql',
      pool: options.pool !== false,
      logging: options.logging === true,
      maxLimit: isInteger(options.maxLimit) ? options.maxLimit : -1,
      redis: merge({
        config: undefined,
        cache: false,
        ttl: 60 * 10,
      }, options.redis),
    };
  }

  async createConn() {
    const conn = await new Pivot(this).createConn();
    return conn;
  }
}

module.exports = Superdb;
