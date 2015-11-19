"use strict";

describe("cassandra-jpa::EntityManagerPure", function ()
{
    const assert = require("assert");
    const async = require("async");
    const uuid = require('uuid');
    const m = require("..");
    let entity = {
        id: uuid.v1(),
        name: "test"
    };
    let test = new m.tests.EntityManagerTest({
        jpaConfig: new m.JPAConfiguration(),
        metaModelClass: m.tests.PureMetaModel,
        entityClass: null,
        entity: entity,
        testField: "name",
        testFieldValue: "test",
        idField: "id",
        idValue: entity.id,
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