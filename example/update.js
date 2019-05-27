const db = require('./index');

const run = async () => {
  const conn = await db.createConn();

  const result = await conn.update('tb_example', { name: 'hello world' }, {
    where: {
      id: 1,
    },
  });
  console.log(result);
};

run();
