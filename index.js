"use strict";
module.exports = {
    MetaModel: require("./lib/MetaModel"),
    JPAConfiguration: require("./lib/JPAConfiguration"),
    CriteriaBuilder: require("./lib/CriteriaBuilder"),
    PersistenceUtils: require("./lib/PersistenceUtils"),
    Persistence: require("./lib/Persistence"),
    EntityManager: require("./lib/EntityManager"),
    EntityManagerFactory: require("./lib/EntityManagerFactory"),
    Entity: require("./lib/Entity"),
    CassandraClientFactory: require("./lib/CassandraClientFactory"),
    err: require("./lib/errors"),
    EntityManagerTest: require("./lib/EntityManagerTest"),
    examples: {
        Foo: require("./examples/Foo"),
        FooMetaModel: require("./examples/FooMetaModel")
    }
};