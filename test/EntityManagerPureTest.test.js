"use strict";
let assert = require("assert");
let async = require("async");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
let m = require("..");
let PureMetaModel = require("../examples/PureMetaModel");
describe("cassandra-jpa::EntityManagerPure", function ()
{
    let entity = {
        id: TimeUuid.now().toString(),
        name: "test"
    };
    let test = new m.EntityManagerTest({
        jpaConfig: new m.JPAConfiguration(),
        metaModelClass: PureMetaModel,
        entityClass: null,
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