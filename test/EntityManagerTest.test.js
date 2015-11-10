"use strict";
let assert = require("assert");
let async = require("async");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
let m = require("..");
let Foo = require("../examples/Foo");
let FooMetaModel = require("../examples/FooMetaModel");
describe("cassandra-jpa::EntityManager", function ()
{
    let entity = new Foo({
        name: "test",
        created: new Date(),
        entity: new m.Entity(),
        entities: [new m.Entity(), new m.Entity()]
    });
    let test = new m.EntityManagerTest({
        jpaConfig: require("./config/config.js"),
        metaModelClass: FooMetaModel,
        entityClass: Foo,
        entity: entity,
        testField: "name",
        testFieldValue: "test",
        idField: "id",
        idValue: TimeUuid.fromString(entity.id),
        criteriaQuery: ""
    });
    before(function ()
    {
        test.testInitManager();
    });
    it("should convert entity toRow", function ()
    {
        test.testToRow();
    });
    it("should convert row to entity", function ()
    {
        test.testFromRow();
    });
    it("should drop Table foo", function (done)
    {
        test.testDropTable(done);
    });
    it("should create Table foo", function (done)
    {
        test.testCreateTable(done);
    });
    it("should insert Indexes to Table foo", function (done)
    {
        test.testInsertIndexes(done);
    });
    it("should truncate Table foo", function (done)
    {
        test.testTruncateTable(done);
    });
    it("should persist Foo", function (done)
    {
        test.testPersist(done);
    });
    it("should findOne Foo by criteriaQuery", function (done)
    {
        test.testFindOne(done);
    });
});