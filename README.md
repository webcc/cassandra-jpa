# [Imergo](https://imergo.com/solutions/imergo.html) Javascript (Node.js) Persistence API (JPA) for Apache Cassandra

A persistence layer for using Cassandra with Node.js based on the latest [DataStax Cassandra Driver](https://blog.risingstack.com/node-js-best-practices/ ). 
This module brings features from the Java World (JPA) and try to make life with Cassandra easier, mostly for people coming from the JAVA World.
The idea is to make the API as similar as possible to the [latest JPA](http://download.oracle.com/otndocs/jcp/persistence-2_1-fr-eval-spec/index.html) so that Java - and not only - developers to start easily with cassandra. Last but not least, this modules provides a good base for any Node.js developer for any kind of project that uses cassandra as its reposistory.

![ES6](https://img.shields.io/badge/es-6-brightgreen.svg)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Installation

```bash
$ npm install cassandra-jpa
```
## Prerequistics
-  ES6 (Node.js > 4.0.0)

## Design

- Flexible configuration
 - Datastax Cassandra Driver Configuration
 - Configurable entity class, (TODO: allow for not having to extend - interface-like style) 
 - Configurable logger
- OOP using classes
- Self explainable Java (JPA) API based/inspired
- [NODE.js best practices](https://blog.risingstack.com/node-js-best-practices/ "RisingStack Engineering Blog")

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

You can  [contact WebCC directly!](http://www.imergo.com) or create an GitHub issue.


## Basic usage

### Import the cassandra-persistence module

```javascript
let jpa = require('cassandra-jpa');
```

### Create your Entity Class Extending (optionally, see baseEntityClass in the configuration) the base Entity

Requirements

- toJSON function should return entity property names same with table fields

[See more in the foo example](./examples/Foo.js)

### Configure your persistence

```javascript
configuration = new jpa.JPAConfiguration();
configuration.cassandra.contactPoints = ["localhost"];
configuration.cassandra.keyspace = "tests";
```

### Implement your MetaModel class by extending the MetaModel or passing config as parameter

If you need to override the default toRow, fromRow function of the MetaModel, you need to extend the MetaModel class.

```javascript
class FooMetaModel extends MetaModel {
  constructor(keySpace)
  {
    super({});
    this.keySpace = keySpace;
    this.name = "foo";
    this.fields = new Map([["id", "timeuuid"], ["name", "text"], ["created", "timeuuid"],
        ["entity", "text"], ["entities", "list<text>"], ["simpleObjects", "list<text>"],
        ["enabled", "boolean"]]);
    this.partitionKeys = ["id"];
    this.clusteringColumns = new Map([["name", "ASC"]]);
    this.secondaryIndexes = ["name"];
    this.entityClass = Foo;
  }
}
```

Otherwise you can simply make an instance and pass config param.

```javascript
 let config = {
     name: "foo";
     etc..
 }
 let myModel = new MetaModel(config);
```

[See more in the foo example](./examples/FooMetaModel.js)

## Extending and Contributing

### DefaultRowInterceptor

The Default Row Interceptor is the defaul - abstract way that jpa maps the entity field to cassandra rows depending on the field type defined in MetaModel. For the moment the following types are supported:

- uuid mapped to require('cassandra-driver').types.TimeUuid
- timeuuid mapped to require('cassandra-driver').types.TimeUuid
- text mapped to JSON.stringnify string
- varchar mapped to JSON.stringnify string
- list<text>" mapped to array of JSON.stringnify
- list<timeuuid> mapped to array of require('cassandra-driver').types.TimeUuid
 
The ones not listed are kept as they are, i.e. native support like string, Map etc...

The DefaultRowInterceptor can be easily extended and overrided. 

### Building criteriaQuery example

```javascript
let emFactory = m.Persistence.createEntityManagerFactory("Foo", config);
let entityManager = emFactory.createEntityManager(fooMetaModel);
let cb = entityManager.getCriteriaBuilder();
let cq = cb.createQuery();
let op1 = cb.equal("id", TimeUuid.fromString(foo.id));
let op2 = cb.equal("name", foo.name);
let criteriaQuery = cq.where(cb.and([op1, op2]));

entityManager.findOne(function (error, res)
{
  assert(newFoo instanceof Foo);
  return callback(error, res);
}, criteriaQuery);
```

### PersistenceUtils

- TODO: introduce more jpa utils

## API

- TODO

## Licence

[See](./LICENSE.md)
