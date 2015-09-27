"use strict";
let assert = require("assert");
let Foo = require("../examples/Foo");
let m = require("..");
let Persistence = require("./Persistence");
describe("cassandra-persistence", function ()
{
    describe("#JPATest", function ()
    {
        let entityManager;
        let fooMetaModel = new MetaModel({
            keySpace: "imergo_test",
            name: "foo",
            fields: new Map([["id", "timeuuid"], ["name", "text"], ["created", "timeuuid"],
                ["entity", "text"], ["entities", "list<text>"], ["simpleObjects", "list<text>"],
                ["enabled", "boolean"]]),
            partitionKeys: ["id"],
            clusteringColumns: new Map([["name", "ASC"]]),
            secondaryIndexes: ["name"],
            entityClass: Foo
        });
        it("should initiate JPA", function ()
        {
            let emFactory = Persistence.createEntityManagerFactory("Foo", config);
            entityManager = emFactory.createEntityManager();
        });
        it("should persist", function (done)
        {
            entityManager.persist(foo, fooMetaModel, function (error, result)
            {
                assert.equals(error, null);
                done();
            });
        });
        it("should criteria", function (done)
        {
            //let criteriaBuilder = entitymanager.getCriteriaBuilder();
            //let criteriaQuery = criteriaBuilder.createQuery();
            //let from = criteriaQuery.from(Foo);
            done();
        });
    });
});