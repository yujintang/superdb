declare namespace superdb {
  interface Pivot extends Chain {
    Op: Op,
    query(sql?: String): Array<Object>
    find(tbName?: String | Array<String>, options?: pivotOptions): Array<Object>
    findAndCountAll(tbName?: String | Array<String>, options?: pivotOptions): Object
    findOne(tbName?: String | Array<String>, options?: pivotOptions): Object
    count(tbName?: String | Array<String>, options?: pivotOptions): Number
    exists(tbName?: String | Array<String>, options?: pivotOptions): Boolean
    createOne(tbName?: String | Array<String>, insertParams?: Object, options?: pivotOptions): Number
    bulkCreate(tbName?: String | Array<String>, insertParams?: Array<Object>, options?: pivotOptions): Number
    update(tbName?: String | Array<String>, updateObj?: Object, options?: pivotOptions): Number
    delete(tbName?: String | Array<String>, options?: pivotOptions): Number
  }

  interface Superdb {
    new(config: object, options: object): Superdb
    createConn(): Pivot
  }

  interface pivotOptions {
    table?: String,
    select?: Array<String>,
    join?: Array<String>,
    where?: Object,
    group?: Array<String>,
    having?: Array<String>,
    order?: Array<String>,
    updateBody?: Object,
    insertBody?: Array<Object>,
    limit?: Number,
    offset?: Number,
    logging?: Boolean,
    ttl?: Number,
  }

  interface Chain {
    table(attr?: String ): Chain
    select(attr?: Array<String>): Chain
    join(attr?: Array<String>): Chain
    where(attr?: Object): Chain
    group(attr?: Array<String>): Chain
    having(attr?: Array<String>): Chain
    order(attr?: Number): Chain
    updateBody(attr?: Object): Chain
    insertBody(attr?: Array<Object>): Chain
    limit(attr?: Number): Chain
    offset(attr?: Number): Chain
    logging(attr?: Boolean): Chain
    ttl(attr?: Number): Chain
  }

  interface Op {
    literal(params:String):Array<String>
    eq(params:String):Array<String>
    ne(params:String):Array<String>
    gte(params:String):Array<String>
    gt(params:String):Array<String>
    lte(params:String):Array<String>
    lt(params:String):Array<String>
    not(params:String):Array<String>
    is(params:String):Array<String>
    in(params:String):Array<String>
    notIn(params:String):Array<String>
    like(params:String):Array<String>
    notLike(params:String):Array<String>
    between(params:String):Array<String>
    notBetween(params:String):Array<String>
  }
}
declare var Superdb: superdb.Superdb

export = Superdb;