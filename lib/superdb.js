const Pivot = require('./pivot');
const { jsType } = require('./utils/helper');

class Superdb {
  constructor(config, options = {}) {
    this.config = config;
    this.options = {
      dialect: options.dialect || 'mysql',
      pool: !!options.pool !== false,
      redis: options.redis,
      cache: !!options.cache !== false,
      logging: !!options.logging === true,
      logger: options.logger || console,
      beforeHooks: Object.assign({
        limit: (limit) => {
          if (jsType('Undefined')(limit)) {
            return 10 * 1000;
          }
          return limit;
        },
        ttl: (ttl) => {
          if (jsType('Undefined')(ttl)) {
            return 60 * 60;
          }
          return ttl;
        },
      }, options.beforeHooks),
      afterHooks: Object.assign({}, options.afterHooks),
    };
  }

  async createConn() {
    const conn = await new Pivot(this).createConn();
    return conn;
  }
}

module.exports = Superdb;
