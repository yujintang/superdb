const Easydb = require('../index');

const db = new Easydb('mysql://root:password@localhost/example', {
  logging: true,
  maxLimit: -1,
  redis: {
    config: 'redis://@localhost:6379',
    cache: true,
    ttl: 60 * 60,
  },
});

module.exports = db;
