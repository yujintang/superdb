const Easydb = require('../index');

const db = new Easydb('mysql://root:password@localhost/superdb', {
  cache: true,
  logging: true,
  redis: 'redis://:password@localhost:6379',
  beforeHooks: {
  },
  afterHooks: {
    find: (list) => {
      const result = list.map((v) => {
        const tempV = v;
        delete tempV.created;
        delete tempV.updated;
        return tempV;
      });
      return result;
    },
  },
});

module.exports = db;
