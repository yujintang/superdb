const Pivot = require('./pivot');

class Easydb {
  constructor(config, options = {}) {
    this.config = config;
    this.options = {
      dialect: options.dialect || 'mysql',
      pool: options.pool !== false,
      promise: options.promise !== false,
      logging: options.logging === true,
    };
  }

  async createConn() {
    const conn = await new Pivot(this).createConn();
    return conn;
  }
}

module.exports = Easydb;
