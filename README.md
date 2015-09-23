# Imergo Node.js Persistence Layer for Apache Cassandra

A persistence layer for using Cassandra with Node.js based on the latest DataStax Driver (2.2.1).
 This tries to bring features from the Java World (JPA) and make life with Cassandra easier. 

## Installation

```bash
$ npm install cassandra-persistence
```

## Features

- Create, Drop Cassandra Tables programmatically
- Create Indexes
- Persist Javascript entities
- Remove Javascript entities
- Flexible configuration
-- Datastax Cassandra Driver Configuration
-- Configurable base entity class, (or use of Symbol as Interface still TODO) 
-- Configurable logging both in PersistenceConfiguration and EAO
- ES6 (Node.js > 4.0.0)
- OOP using classes
- Self explainable API
- Following [NODE.js best practices](https://blog.risingstack.com/node-js-best-practices/ "RisingStack Engineering Blog")

## Getting Help

You can  [contact us directly!](http://www.imergo.com) or create an GiHub issue.


## Basic usage

### Import the cassandra-persistence module

```javascript
let cp = require('cassandra-persistence');
```

### Create your Entity Class Extending (optionally, see baseEntityClass in the configuration) the 
base CassandraEntity

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

[See more in the foo example](./examples/FooEAO.js)

### Optionally (if many entities) implement an EAOFactory by extending the BaseEAOFactory

[See more in the foo example](./examples/FooEAOFactory.js)
