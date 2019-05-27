const db = require('./index');

const run = async () => {
  const conn = await db.createConn();

  const result = await conn.delete('tb_example', {
    where: {
      id: 1,
    },
  });
  console.log(result);
};

run();
