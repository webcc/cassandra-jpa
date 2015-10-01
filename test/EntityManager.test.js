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
            entityManager.dropTable(fooMetaModel, function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should create Table foo", function (done)
        {
            entityManager.createTable(fooMetaModel, function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should insert Indexes to Table foo", function (done)
        {
            entityManager.insertIndexes(fooMetaModel, function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should truncate Table foo", function (done)
        {
            entityManager.truncate(fooMetaModel, function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should persist Foo", function (done)
        {
            entityManager.persist(foo, fooMetaModel, function (error, result)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should findOne Foo by criteria", function (done)
        {
            let criteria = new Map();
            criteria.set("id", TimeUuid.fromString(foo.id));
            assert(foo.name === "test");
            entityManager.findOne(fooMetaModel, function (error, res)
            {
                assert.equal(error, null);
                assert(res instanceof Foo);
                assert(res.id === id);
                assert.equal(res.name, "test");
                return done();
            }, criteria);
        });
        it("should update foo", function (done)
        {
            let newFoo;
            async.series([function (callback)
            {
                let criteria = new Map();
                criteria.set("id", TimeUuid.fromString(foo.id));
                criteria.set("name", foo.name);
                entityManager.findOne(fooMetaModel, function (error, res)
                {
                    assert.equal(error, null);
                    newFoo = res;
                    assert(newFoo instanceof Foo);
                    assert(newFoo.id === id);
                    assert(newFoo.enabled === true);
                    return callback(error, res);
                }, criteria);
            }, function (callback)
            {
                newFoo.enabled = false;
                let criteria = new Map();
                criteria.set("id", TimeUuid.fromString(newFoo.id));
                ;
                criteria.set("name", newFoo.name);
                entityManager.updateByCriteria(newFoo, fooMetaModel, function (error, res)
                {
                    assert.equal(error, null);
                    return callback(error, res);
                }, criteria);
            }, function (callback)
            {
                let criteria = new Map();
                criteria.set("id", TimeUuid.fromString(newFoo.id));
                criteria.set("name", newFoo.name);
                entityManager.findOne(fooMetaModel, function (error, res)
                {
                    assert.equal(error, null);
                    assert(res instanceof Foo);
                    assert(res.id === id);
                    assert(res.enabled === false);
                    return callback(error, res);
                }, criteria);
            }], function (err, results)
            {
                assert.equal(err, null);
                return done();
            });
        });
        it("should findAll Foo by criteria", function (done)
        {
            let criteria = new Map();
            criteria.set("id", TimeUuid.fromString(foo.id));
            ;
            criteria.set("name", foo.name);
            entityManager.findAll(fooMetaModel, function (error, res)
            {
                assert.equal(error, null);
                assert.equal(res.length, 1);
                let newFoo = res[0];
                assert(newFoo.id === id);
                assert(newFoo.enabled === false);
                return done();
            }, criteria);
        });
        it("should remove Foo by criteria", function (done)
        {
            let criteria = new Map();
            criteria.set("id", TimeUuid.fromString(foo.id));
            ;
            entityManager.removeByCriteria(fooMetaModel, function (error, res)
            {
                assert.equal(error, null);
                return done();
            }, criteria);
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
                entityManager.persistAll(foos, fooMetaModel, function (error, res)
                {
                    assert.equal(error, null);
                    return callback(error, res);
                });
            }, function (callback)
            {
                let criteria = new Map();
                criteria.set("name", "manyFoos");
                entityManager.findAll(fooMetaModel, function (error, res)
                {
                    assert.equal(error, null);
                    assert.equal(res.length, 3);
                    return callback(error, res);
                }, criteria);
            }], function (err, results)
            {
                assert.equal(err, null);
                return done();
            });
        });
    });
});