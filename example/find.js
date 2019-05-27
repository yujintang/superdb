const db = require('./index');

const run = async () => {
  const conn = await db.createConn();
  const result = await conn.findAndCountAll('tb_example', {
    select: ['id', 'name'],
    where: {
      name: 'super1',
    },
    limit: 1,
    logging: true,
  });
  console.log(result);
};

run();
