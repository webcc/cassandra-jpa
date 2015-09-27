"use strict";
let assert = require("assert");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
let m = require("..");
let Foo = require("../examples/Foo");
let FooMetaModel = require("../examples/FooMetaModel");
describe("cassandra-persistence", function ()
{
    describe("#JPATest", function ()
    {
        let config = require("./config/config.js");
        let fooMetaModel = new FooMetaModel(config.cassandra.keyspace);
        let entityManager;
        let foo = new Foo({
            name: "test",
            created: new Date(),
            entity: new m.Entity(),
            entities: [new m.Entity(), new m.Entity()]
        });
        let id = foo.id;
        before(function ()
        {
            let emFactory = m.Persistence.createEntityManagerFactory("Foo", config);
            entityManager = emFactory.createEntityManager();
            assert.equal(entityManager instanceof m.EntityManager, true);
        });
        it("should convert entity toRow", function ()
        {
            let row = fooMetaModel.toRow(foo);
            assert.equal(typeof row.entity === "string", true);
            assert.equal(row.id instanceof TimeUuid, true);
            assert.equal(row.entities.length, 2);
            assert.equal(row.entities[0] instanceof Foo, false);
        });
        it.only("should convert row to entity", function ()
        {
            let row = fooMetaModel.toRow(foo);
            let entity = fooMetaModel.fromRow(row);
            assert.equal(entity instanceof Foo, true);
            assert.equal(typeof entity.id === "string", true);
            assert.equal(entity.entity instanceof m.Entity, true);
            assert.equal(entity.entities.length, 2);
            assert.equal(entity.entities[0] instanceof m.Entity, true);
        });
        it.only("should drop Table foo", function (done)
        {
            entityManager.dropTable(fooMetaModel, function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
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