# superdb
**使用场景：** 
1. 拒绝拼接SQL语句，长期维护且达到易读效果
2. 减少ORM模型定义，表更新频繁
3. 支持链式操作，让数据定义更灵活
4. 多数据库支持
5. 频繁读数据放入缓存
6. 性能提升

__Table of contents__
- [Installation](#installation)
- [QuickStart](#quickStart)
- [Connection](#connection)
- [Conn methods](#conn-methods)
- [findOptions](#findoptions)
- [Chain methods](#chain-methods)
- [Op](#op)
- [Hooks](#hooks)

### Installation
```shell
yarn add https://github.com/yujintang/superdb.git
```
or
```shell
yarn add superdb
```
or 
```shell
npm install --save superdb
```
### QuickStart
```js
const Superdb = require('superdb');
const db = new Superdb('mysql://root:password@localhost/example', { logging: true });

const main = async () => {
  const conn = await db.createConn();
  const result = await conn.find('tb_example', {
    select: ['id', 'name'],
    where: {
      id: 1,
      name: conn.Op.is(null),
    },
    limit: 5,
  });
  console.log(result);
};
main();

// SELECT id, name FROM tb_example WHERE id = 1 AND name IS null LIMIT 5
```
### Connection
```js
const db = new Superdb(config, options);
const conn = await db.createConn();
```
#### config

```js
// 1
config = {
  connectionLimit : 10,
  host              : 'localhost',
  port              : '3306',
  user              : 'root',
  password          : 'password',
  database          : 'example'
}

// 2
config = 'mysql://user:password@host:post/database'
```
#### options
```js
options = {
    dialect   : 'mysql',  // which db? default: "mysql",
    pool      : true,     // connection pool ? default true
    logging   : false,    // print sql ? default false
    logger    : console,  // log, default console
    redis     : undefined, // can use {host: "", port: "", password: "", db: ""} or "redis://:password@host:port/db",
    cache     : false      // use cache ? default false
    beforeHooks: {
    },
    afterHooks: {
    },
}
```
### Conn methods
#### query
```js
await conn.query(sql)

const result = await conn.query('select * from tb_example')
// select * from tb_example
```
#### find
```js
await conn.find(tbName, options);

const result = await conn.find('tb_example', {
    where: {
      id: 333,
      name: 'superdb',
    },
  });
// SELECT * FROM tb_example WHERE id = 333 AND name = 'superdb'
```
#### findOne
```js
await conn.findOne(tbName, options);

const result = await conn.find('tb_example', {
    where: {
      id: 333,
      name: 'superdb',
    },
  });
// SELECT * FROM tb_example WHERE id = 333 AND name = 'superdb' LIMIT 1
```
#### findAndCountAll
```js
await conn.findAndCountAll(tbName, options);

  const result = await conn.findAndCountAll('tb_example', {
    where: {
      id: 333,
      name: 'superdb',
    },
  });
// SELECT * FROM tb_example WHERE id = 333 AND name = 'superdb' 
//  SELECT COUNT(*) AS COUNT FROM tb_example WHERE id = 333 AND name = 'superdb'
```
#### count
> return [{COUNT: Number},...]
```js
await conn.count(tbName, options);

const result = await conn.count('tb_example', {
    where: {
      id: 333,
      name: 'superdb',
    },
  });
// SELECT COUNT(*) AS COUNT FROM tb_example WHERE id = 333 AND name = 'superdb'
```
#### exists
> return Boolean
```js
await conn.exists(tbName, options);

const result = await conn.count('tb_example', {
  where: {
    id: 333,
    name: 'superdb',
  }
});
// SELECT COUNT(*) AS COUNT FROM tb_example WHERE id = 333 AND name = 'superdb'
```
#### createOne
> createParams must {},
```js
await conn.createOne(tbName, createParams, options);

const result = await conn.create('tb_example', [{ id: 100, name: 'qt' }, { id: 101, name: 'ds' }]);
// INSERT INTO tb_example (id,name) values (100, 'qt'), (101, 'ds')
```
#### bulkCreate
> createParams must [],
```js
await conn.bulkCreate(tbName, createParams, options);

const result = await conn.create('tb_example', [{ id: 100, name: 'qt' }, { id: 101, name: 'ds' }]);
// INSERT INTO tb_example (id,name) values (100, 'qt'), (101, 'ds')
```
#### update
```js
await conn.update(tbName, updateOptions, options);

const result = await conn.update('tb_example', { name: 'qtds' }, {
    where: { id: 100 },
  });
// UPDATE tb_example SET name = 'qtds' WHERE id = 100
```
#### bulkUpdate
```js
await conn.bulkUpdate(tbName, updateOptions, options);

const result = await conn.bulkUpdate('tb_example', { name: 'qtds' }, {
    where: { id: 100 },
  });
// UPDATE tb_example SET name = 'qtds' WHERE id = 100
```
#### updateOne
```js
await conn.updateOne(tbName, updateOptions, options);

const result = await conn.update('tb_example', { name: 'qtds' }, {
    where: { id: 100 },
  });
// UPDATE tb_example SET name = 'qtds' WHERE id = 100 LIMIT 1
```
#### delete
```js
await conn.delete(tbName, options)

const result = await conn.delete('tb_example', {
    where: { id: 100 },
    limit: 1,
  });
// DELETE FROM tb_example WHERE id = 100 LIMIT 1
```
### options
```js
options = {
    table: undefined,   // eg: 'tb_example'
    select: [],         // eg: ['id', 'name']
    join: [],           // eg: [{table: 'tb_user', on: 'tb_user.id = tb_example.id'}]
    where: {},          // eg: {name: 'superdb'}
    group: [],          // eg: ['name desc']
    having: [],         // eg: ['count > 4']
    order: [],          // eg: ['id desc', 'name asc']
    limit: undefined,   // eg: 1
    offset: undefined,  // eg: 1
    logging: false,     // eg: true
    ttl: 0,             // eg: if open cache, then this ttl have Higher priority than global ttl;  if set <=0, then not cache this find
}
```
### Chain methods
#### table(params.table)
```js
conn.table('tb_example')

  const result = await conn
    .find('tb_example');
//  SELECT * FROM tb_example
```
#### select(params.select)
```js
conn.select('id, name') 
conn.select(['id', 'name'])

const result = await conn
    .select(['id', 'name'])
    .find(['tb_example','exp']);
// SELECT id, name FROM tb_example AS exp
```
#### updateBody(params.updateBody)
```js
conn.updateBody({name:'superdb'})

const result = await conn
    .updateBody({ name: 'superdb' })
    .where({ name: 'oldName' })
    .limit(1)
    .update('tb_example');
// UPDATE tb_example SET name = 'superdb' WHERE name = 'oldName' LIMIT 1
```
#### insertBody(params.insertBody)
> 参数为数组，则代表插入多条
```js
conn.insertBody({id: 100, name: 'alldb'})
conn.insertBody([{id: 100, name: 'alldb'}])

const result = await conn
    .insertBody([{ id: 100, name: 'alldb100' }, { id: 101, name: 'alldb101' }])
    .create('tb_example');
// INSERT INTO tb_example (id,name) values (100, 'alldb100'), (101, 'alldb101')
```
#### where(params.where)
> more detail where, please enter [op](#op)
```js
conn.where({id: 5})

const result = await conn
    .where({ id: 5 })
    .find('tb_example');
// SELECT * FROM tb_example WHERE id = 5
```
#### join(params.join)
```js
  const result = await conn
    .join([{
      table: 'tb_user as User',
      on: 'User.id = tb_example.id',
      direction: 'left',
    }])
    .find('tb_example');  
// SELECT * FROM tb_example left JOIN tb_user as User ON User.id = tb_example.id
```
#### limit(params.limit)
```js
conn.limit(10) // limit 10
conn.limit([10, 1]) // limit 10 offset 1

const result = await conn
    .limit([10, 1])
    .find('tb_example');
// SELECT * FROM tb_example LIMIT 10 OFFSET 1
```
#### offset(params.offset)
```js
conn.offset(1) // offset 1

const result = await conn
    .limit(1)
    .offset(1)
    .find('tb_example');
// SELECT * FROM tb_example LIMIT 1 OFFSET 1 
```
#### order(params.order)
```js
conn.order('id desc')
conn.order(['id desc']) // ORDER BY id desc

const result = await conn
    .order(['id desc', 'name asc'])
    .find('tb_example');
// SELECT * FROM tb_example ORDER BY id desc, name asc
```
#### group(params.group)
```js
conn.group('name desc')
conn.group(['name desc']) // GROUP BY name desc

const result = await conn
    .select('name')
    .group(['name desc'])
    .find('tb_example');
// SELECT name FROM tb_example GROUP BY name desc
```
#### having(params.having)
```js
conn.having('count > 4')
conn.having(['count > 4']) // HAVING count > 4

const result = await conn
    .select(['count(*) as count', 'name'])
    .group(['name desc'])
    .having(['count > 4'])
    .find('tb_example');
// SELECT count(*) as count, name FROM tb_example GROUP BY name desc HAVING count > 4
```
#### logging(params.logging);
```js
conn.logging(true) // print superdb sql 
conn.logging(false) // not print superdb sql
```
#### ttl(params.ttl)
```js
conn.ttl(60 * 5)  // redis cache ex = 60 * 5
```

### Op
> Op = conn.op; 用来提供一系列where查询的方法集
#### Op.or
```js
  const result = await conn.find('tb_example', {
    where: {
      [conn.Op.or]: {
        id: 6,
        name: 'superdb',
      },
    },
  });
// SELECT * FROM tb_example WHERE (id = 6 OR name = 'superdb')
```
#### OP.and 
#### Op.literal
> literal is unrelated with where.key ,just depends on where.value
```js 
  const result = await conn.find('tb_example', {
    where: {
      'random': conn.Op.literal('id IS NULL'),
    },
  });
// SELECT * FROM tb_example WHERE id IS NULL
```
#### Op.eq
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.eq('superdb'),
    },
  });
// SELECT * FROM tb_example WHERE name = 'superdb'
```
#### Op.ne
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.ne('superdb'),
    },
  });
// SELECT * FROM tb_example WHERE name != 'superdb'
```
#### Op.gte
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.gte('d'),
    },
  });
// SELECT * FROM tb_example WHERE name >= 'd'
```
#### Op.gt
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.gt('d')
    },
  });
// SELECT * FROM tb_example WHERE name > 'd' 
```
#### Op.lte
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.lte('d'),
    },
  });
// SELECT * FROM tb_example WHERE name <= 'd'
```
#### Op.lt
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.lt('d'),
    },
  });
// SELECT * FROM tb_example WHERE name < 'd'
```
#### Op.is
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.is(null),
    },
  });
//  SELECT * FROM tb_example WHERE name IS null
```
#### Op.not
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.not(null)
    },
  });
// SELECT * FROM tb_example WHERE name IS NOT null
```
#### Op.in
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.in(['qtds', 'superdb'])
    },
  });
// SELECT * FROM tb_example WHERE name IN ('qtds', 'superdb')
```
#### Op.notIn
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.notIn(['qtds', 'superdb'])
    },
  });
// SELECT * FROM tb_example WHERE name NOT IN ('qtds', 'superdb')
```
#### Op.like
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.like('%d'),
    },
  });
// SELECT * FROM tb_example WHERE name LIKE '%d'
```
#### Op.notLike
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.notLike('%d'),
    },
  });
// SELECT * FROM tb_example WHERE name NOT LIKE '%d'
```
#### Op.between
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.between(['c', 'f'])
    },
  });
// SELECT * FROM tb_example WHERE name BETWEEN 'c' AND 'f'
```
#### Op.notBetween
```js
const result = await conn.find('tb_example', {
    where: {
      name: conn.Op.notBetween(['c', 'f']),
    },
  });
// SELECT * FROM tb_example WHERE name NOT BETWEEN 'c' AND 'f'
```

### beforeHooks
> config beforeHooks
#### select: (params:String)=>{return params}
#### where: (params:Object)=>{return params}
#### updateBody: (params:Object)=>{return params}
```js
beforeHooks:{
  updateBody: (params) => {
    const result = Object.assign({}, params, {
      updated: Date.parse(new Date()) / 1000,
    });
    return result;
    },
}
```
#### insertBody: (params:Array<Object>)=>{return params}
```js
beforeHooks:{
  insertBody: (params) => {
      const result = params.map(v => Object.assign({}, v, {
        created: Date.parse(new Date()),
      }));
      return result;
    },
}
```
#### limit: (params:Integer)=>{return params}
> find 不指定limit, 一次最多查询10*1000条数据,内置该hook
```js
beforeHooks: {
    limit: () => (limit) => {
          if (limit === undefined)) {
            return 10 * 1000;
          }
          return limit;
        },,
}
```
#### ttl: (params:Integer)=>{return params}
> cache ttl = 60 * 60, 内置该hook
```js
beforeHooks: {
    ttl: (ttl) => {
          if (ttl === undefined)) {
            return 60 * 60;
          }
          return ttl;
        },
}
```
### afterHooks
#### find: (result: Array<object>)=>{return result}
> 删除find结果中的created 与 updated字段 
```js
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
```
