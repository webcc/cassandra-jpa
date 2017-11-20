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
    err: require("./lib/JPAErrors")/*,
    tests: {
        Foo: require("./test/helpers/Foo"),
        FooMetaModel: require("./test/helpers/FooMetaModel"),
        ExtendedFooMetaModel: require("./test/helpers/ExtendedFooMetaModel"),
        EntityManagerTest: require("./test/helpers/EntityManagerTest"),
        PureMetaModel:  require("./test/helpers/PureMetaModel")
    }*/
};