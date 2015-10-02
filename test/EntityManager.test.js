"use strict";
let assert = require("assert");
let async = require("async");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
let m = require("..");
let Foo = require("../examples/Foo");
let FooMetaModel = require("../examples/FooMetaModel");
describe("cassandra-persistence", function ()
{
    describe("#EntityManager", function ()
    {
        let config = require("./config/config.js");
        config.cassandra.contactPoints = [ process.env.DBHOST || config.cassandra.contactPoints[0] ];
        let fooMetaModel = new FooMetaModel(config.cassandra.keyspace);
        let entityManager;
        let foo = new Foo({
            name: "test",
            created: new Date(),
            entity: new m.Entity(),
            entities: [new m.Entity(), new m.Entity()]
        });
        let id = foo.id;
        let cb, cq;
        before(function ()
        {
            let emFactory = m.Persistence.createEntityManagerFactory("Foo", config);
            entityManager = emFactory.createEntityManager(fooMetaModel);
            cb = entityManager.getCriteriaBuilder();
            cq = cb.createQuery();
            assert.equal(entityManager instanceof m.EntityManager, true);
            assert.equal(entityManager.metaModel instanceof FooMetaModel, true);
        });
        it("should convert entity toRow", function ()
        {
            let row = fooMetaModel.toRow(foo);
            assert.equal(typeof row.entity === "string", true);
            assert.equal(row.entities.length, 2);
            assert.equal(row.entities[0] instanceof Foo, false);
        });
        it("should convert row to entity", function ()
        {
            let row = fooMetaModel.toRow(foo);
            let entity = fooMetaModel.fromRow(row);
            assert.equal(entity instanceof Foo, true);
            assert.equal(typeof entity.id === "string", true);
            assert.equal(entity.entity instanceof m.Entity, true);
            assert.equal(entity.entities.length, 2);
            assert.equal(entity.entities[0] instanceof m.Entity, true);
        });
        it("should drop Table foo", function (done)
        {
            entityManager.dropTable(function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should create Table foo", function (done)
        {
            entityManager.createTable(function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });

        it("should insert Indexes to Table foo", function (done)
        {
            entityManager.insertIndexes(function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should truncate Table foo", function (done)
        {
            entityManager.truncate(function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });

         it("should persist Foo", function (done)
        {
            entityManager.persist(foo, function (error, result)
            {
                assert.equal(error, null);
                return done();
            });
        });

        it("should findOne Foo by criteriaQuery", function (done)
        {
            let op1 = cb.equal("id", TimeUuid.fromString(foo.id));
            let q1 = cb.and([op1]);
            let criteriaQuery = cq.where(cb.and([op1]));
            assert(foo.name === "test");
            entityManager.findOne(function (error, res)
            {
                assert.equal(error, null);
                assert(res instanceof Foo);
                assert(res.id === id);
                assert.equal(res.name, "test");
                return done();
            }, criteriaQuery);
        });

        it("should update foo", function (done)
        {
            let newFoo;
            async.series([function (callback)
            {
                let op1 = cb.equal("id", TimeUuid.fromString(foo.id));
                let op2 = cb.equal("name", foo.name);
                let criteriaQuery = cq.where(cb.and([op1, op2]));
                entityManager.findOne(function (error, res)
                {
                    assert.equal(error, null);
                    newFoo = res;
                    assert(newFoo instanceof Foo);
                    assert(newFoo.id === id);
                    assert(newFoo.enabled === true);
                    return callback(error, res);
                }, criteriaQuery);
            }, function (callback)
            {
                newFoo.enabled = false;
                let op1 = cb.equal("id", TimeUuid.fromString(foo.id));
                let op2 = cb.equal("name", newFoo.name);
                let criteriaQuery = cq.where(cb.and([op1, op2]));
                entityManager.updateByCriteria(newFoo, function (error, res)
                {
                    assert.equal(error, null);
                    return callback(error, res);
                }, criteriaQuery);
            }, function (callback)
            {
                let op1 = cb.equal("id", TimeUuid.fromString(foo.id));
                let op2 = cb.equal("name", newFoo.name);
                let criteriaQuery = cq.where(cb.and([op1, op2]));
                entityManager.findOne(function (error, res)
                {
                    assert.equal(error, null);
                    assert(res instanceof Foo);
                    assert(res.id === id);
                    assert(res.enabled === false);
                    return callback(error, res);
                }, criteriaQuery);
            }], function (err, results)
            {
                assert.equal(err, null);
                return done();
            });
        });

        it("should findAll Foo by criteriaQuery", function (done)
        {
            let op1 = cb.equal("id", TimeUuid.fromString(foo.id));
            let op2 = cb.equal("name", foo.name);
            let criteriaQuery = cq.where(cb.and([op1, op2]));
            entityManager.findAll(function (error, res)
            {
                assert.equal(error, null);
                assert.equal(res.length, 1);
                let newFoo = res[0];
                assert(newFoo.id === id);
                assert(newFoo.enabled === false);
                return done();
            }, criteriaQuery);
        });

        it("should remove Foo by criteriaQuery", function (done)
        {
            let op1 = cb.equal("id", TimeUuid.fromString(foo.id));
            let criteriaQuery = cq.where(cb.and([op1]));
            entityManager.removeByCriteria(function (error, res)
            {
                assert.equal(error, null);
                return done();
            }, criteriaQuery);
        });

        it("should persist All Foo", function (done)
        {
            async.series([function (callback)
            {
                let foos = [];
                for (let i = 0; i < 3; i++)
                {
                    let f = new Foo({
                        name: "manyFoos"
                    });
                    foos.push(f);
                }
                entityManager.persistAll(foos, function (error, res)
                {
                    assert.equal(error, null);
                    return callback(error, res);
                });
            }, function (callback)
            {
                let op = cb.equal("name", "manyFoos");
                let criteriaQuery = cq.where(cb.and([op]));
                entityManager.findAll(function (error, res)
                {
                    assert.equal(error, null);
                    assert.equal(res.length, 3);
                    return callback(error, res);
                }, criteriaQuery);
            }], function (err, results)
            {
                assert.equal(err, null);
                return done();
            });
        });
    });
});