const Redis = require('ioredis');

const { md5 } = require('../utils/helper');

class Cache {
  constructor(config) {
    this.config = config;
    this.redis = new Redis(this.config);
    this.md5 = md5;
  }

  setCache(key, value, ttl) {
    if (+ttl > 0) {
      this.redis.set(this.md5(key), JSON.stringify(value), 'ex', ttl);
    }
    return true;
  }

  async getCache(key) {
    const result = await this.redis.get(this.md5(key));
    return JSON.parse(result);
  }
}

module.exports = Cache;
