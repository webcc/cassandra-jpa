# [Imergo](https://imergo.com/solutions/imergo.html) Javascript (Node.js) Persistence API (JPA) for Apache Cassandra

A persistence layer for using Cassandra with Node.js based on the latest [DataStax Cassandra Driver](https://blog.risingstack.com/node-js-best-practices/ ). This module brings features from the Java World (JPA) and try to make life with Cassandra easier, mostly for people coming from the JAVA World. 

## Installation

```bash
$ npm install cassandra-jpa
```

## Features

- Create, Drop Cassandra Tables programmatically
- Create Indexes
- Persist Javascript entities
- Remove Javascript entities
- Flexible configuration
 - Datastax Cassandra Driver Configuration
 - Configurable base entity class, (or use of Symbol as Interface still TODO) 
 - Configurable logging both in PersistenceConfiguration and EAO
- ES6 (Node.js > 4.0.0)
- OOP using classes
- Self explainable API
- Following [NODE.js best practices](https://blog.risingstack.com/node-js-best-practices/ "RisingStack Engineering Blog")

## Getting Help

You can  [contact us directly!](http://www.imergo.com) or create an GitHub issue.


## Basic usage

### Import the cassandra-persistence module

```javascript
let cp = require('cassandra-persistence');
```

### Create your Entity Class Extending (optionally, see baseEntityClass in the configuration) the base CassandraEntity

[See more in the foo example](./examples/Foo.js)

### Configure your persistence

```javascript
let config = new cp.PersistenceConfiguration({
    cassandra = {
        contactPoints: ["localhost"],
        keyspace: "cassandra-persistence-test"
    }   
});
```

### Implement your EAO class extending the BaseEAO one

```javascript
class FooEAO extends BaseEAO {
    constructor(config)
    {
        super(config);
        this.table = {
            name: "foo",
            fields: new Map([["id", "timeuuid"], ["name", "text"], ["created", "timeuuid"],
                ["entity", "text"], ["entities", "list<text>"], ["simpleObjects", "list<text>"],
                ["enabled", "boolean"]]),
            partitionKeys: ["id"],
            clusteringColumns: new Map(),
            secondaryIndexes: []
        };
        this.table.clusteringColumns.set("name", "ASC");
        this.table.secondaryIndexes.push("name");
        this.entityClass = Foo;
    }
}

```

[See more in the foo example](./examples/FooEAO.js)

### Optionally (if many entities), implement an EAOFactory by extending the BaseEAOFactory

```javascript
class FooEAOFactory extends BaseEAOFactory
{
    constructor(config)
    {
        super(config);
        this.eao.fooEAO = this.getFooEAO();
    }
 
    getAllEAO()
    {
        return this.eao;
    }

    getFooEAO()
    {
        if (!this.eao.fooEAO)
        {
            this.eao.fooEAO = new FooEAO(this.config);
        }
        return this.eao.fooEAO;
    }
};

```
[See more in the foo example](./examples/FooEAOFactory.js)
