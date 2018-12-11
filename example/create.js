const db = require('./index');

const run = async () => {
  const conn = await db.createConn();
  const result = await conn.create('tb_example', { id: 100, name: 'qtds' });
  console.log(result);
};

run();
