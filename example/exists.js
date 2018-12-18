const db = require('./index');

const run = async () => {
  const conn = await db.createConn();
  const result = await conn.exists('tb_example', {
    name: 'superdb1d',
  }, {
    group: ['name desc'],
  });
  console.log(result);
};

run();
