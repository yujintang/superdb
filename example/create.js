const db = require('./index');

const run = async () => {
  const conn = await db.createConn();
  const result = await conn.create('tb_example', { name: 'qtds' }, { logging: true });
  console.log(result);
};

run();
