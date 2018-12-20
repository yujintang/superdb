const Easydb = require('../index');

const db = new Easydb('mysql://root:password@localhost/tb_example', {
  cache: false,
  logging: true,
  redis: 'redis://:password@localhost:6379',
  beforeHooks: {
  },
  afterHooks: {
  },
});

module.exports = db;
