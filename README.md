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
- [CQL 3](https://cassandra.apache.org/doc/cql3/CQL.html)

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
configuration.logQueryObject = false; // make true for debug queries
// configuration.logger = mylogger

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
    this.ttl = undefined; //no ttl, or X secs, e.g. 86400 for one day
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
[See more in the test](./test/EntityManager.test.js)

### Override - extend object model adaptation methods in you MetaModel

This need to be done if the DefaultRowInterceptor does not cover your needs. Alternatively you could extend or replace the DefaultRowInterceptor and maybe also contribute the ideas here.

```javascript
toRow(entity)
{
 // my specifics
 let row super.toRow(entity);
  // my specifics
 return row;
}
fromRow(row)
{
 let entity = super.fromRow(row);
 // my specifics
 return entity;
}
```
[See more in the test](./test/EntityManager.test.js)

## API

### EntityManger

| Function  | Arguments |Returns |Description |
| ------------- | ------------- |------------- |------------- |
| persist  | entity, callback, [metaModel]  | callback(error, result) | Persist an entity  |
| persistAll | entities, callback, [metaModel] | callback(error, result)   | Persist an arry of entities  |
| updateByCriteria | entity, callback, criteriaQuery, [metaModel]  | callback(error, result) | Update Row based on criteriaQuery  |
| removeByCriteria | callback, criteriaQuery, [metaModel]  | callback(error, result)  | Update Row(s) based on criteriaQuery  |
| findOne | callback, criteriaQuery, [metaModel]  | callback(error, result)  | Find one entity based on criteriaQuery  |
| findAll | callback, criteriaQuery, [metaModel] | callback(error, result)  | Find all entities based on criteriaQuery  |
| query | queryObject, callback  | callback(error, result)  | general cassandra driver query  |
| truncate | queryObjects, callback  | callback(error, result)  | Truncate a table based on MetaModel  |
| createTable | callback, [metaModel]  | callback(error, result)  | Create a table based on MetaModel  |
| insertIndexes | callback, [metaModel]  | callback(error, result)  | Create indexes based on MetaModel |
| dropIndexes | callback, [metaModel]  | callback(error, result)  | Drop indexes based on MetaModel |
| dropTable | callback, [metaModel]  | callback(error, result)  | Drop Table based on MetaModel  |
| getCriteriaBuilder | [metaModel]  | CriteriaBuilder  | get the CriteriaBuilder  |
| getCriteriaQuery | [metaModel]  | CriteriaQuery  | get the CriteriaQuery |

Note: When an EntityManger is initiated using metaModel argument, the [metaModel] can be ommited. 

### CriteriaBuilder 

| Function  | Arguments |Returns |Description |
| ------------- | ------------- |------------- |------------- |
| and | expressions:array | q:string | combine expressions with and AND  |
| equal | x:string, y:ALL | q:string | Tests whether two expressions are equal
| gt | x:string, y:ALL | q:string |  Tests whether the first numeric expression is greater than the second numeric expression |
| ge | x:string, y:ALL  | q:string |  Tests whether the first numeric expression is greater than or equal to the second numeric expression |
| lt | x:string, y:ALL  | q:string | Tests whether the first numeric expression is less than the second numeric expression  |
| le | x:string, y:ALL  | q:string | Tests whether the first numeric expression is less than or equal to the second numeric expression  |

### CriteriaQuery 

| Function  | Arguments |Returns |Description |
| ------------- | ------------- |------------- |------------- |
| from | q, [filtering:boolean]  | q:string |   |
| where | q  | q:string |   |

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

## Licence

[See](./LICENSE.md)
