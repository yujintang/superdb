const Pivot = require('./pivot');

class Superdb {
  constructor(config, options = {}) {
    this.config = config;
    this.options = {
      dialect: options.dialect || 'mysql',
      pool: !!options.pool !== false,
      redis: options.redis,
      cache: !!options.cache !== false,
      logging: !!options.logging === true,
      beforeHooks: Object.assign({
        limit: () => 10 * 1000,
        ttl: () => 60 * 60,
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
