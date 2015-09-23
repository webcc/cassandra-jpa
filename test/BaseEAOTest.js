"use strict";
let assert = require("assert");
let async = require("async");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
let BaseEAO = require("../lib/BaseEAO");
let CassandraClientFactory = require("../lib/CassandraClientFactory");
let Foo = require("./../examples/FooEntity");
let FooEAO = require("./../examples/FooEAO");
let FooEAOFactory = require("./../examples/FooEAOFactory");
let CassandraEntity = require("../lib/CassandraEntity");
let PersistenceConfiguration = require("../lib/PersistenceConfiguration");
describe("cassandra-persistence", function ()
{
    describe("#BaseEAO", function ()
    {
        let config;
        let eao;
        let foo = new Foo({
            name: "test",
            created: new Date(),
            entity: new CassandraEntity(),
            entities: [new CassandraEntity(), new CassandraEntity()]
        });
        let id = foo.id;
        before(function ()
        {
            config = new PersistenceConfiguration();
            assert.equal(config instanceof PersistenceConfiguration, true);
            eao = new FooEAO(config);
            assert.equal(eao instanceof FooEAO, true);
        });
        it("should initiate BaseEAO", function ()
        {
            let baseEAO = new BaseEAO(config);
            assert.equal(baseEAO instanceof BaseEAO, true);
        });
        it("should convert entity toRow", function ()
        {
            let row = eao.toRow(foo);
            assert.equal(typeof row.entity === "string", true);
            assert.equal(row.id instanceof TimeUuid, true);
            assert.equal(row.entities.length, 2);
            assert.equal(row.entities[0] instanceof CassandraEntity, false);
        });
        it("should convert row to entity", function ()
        {
            let row = eao.toRow(foo);
            let entity = eao.fromRow(row);
            assert.equal(entity instanceof Foo, true);
            assert.equal(typeof entity.id === "string", true);
            assert.equal(entity.entity instanceof CassandraEntity, true);
            assert.equal(entity.entities.length, 2);
            assert.equal(entity.entities[0] instanceof CassandraEntity, true);
        });
        it("should drop Table foo", function (done)
        {
            eao.dropTable(function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should create Table foo", function (done)
        {
            eao.createTable(function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should insert Indexes to Table foo", function (done)
        {
            eao.insertIndexes(function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should truncate Table foo", function (done)
        {
            eao.truncate(function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should persist Foo", function (done)
        {
            eao.persist(foo, function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should findOne Foo by criteria", function (done)
        {
            async.series([function (callback)
            {
                eao.persist(foo, function (error, res)
                {
                    assert.equal(error, null);
                    return callback(error, res);
                });
            }, function (callback)
            {
                let criteria = new Map();
                criteria.set("id", TimeUuid.fromString(foo.id));
                eao.findOne(criteria, function (error, res)
                {
                    assert.equal(error, null);
                    assert(res instanceof CassandraEntity);
                    assert(res.id === id);
                    assert(res.name === "test");
                    return callback(error, res);
                });
            }], function (err, results)
            {
                assert.equal(err, null);
                return done();
            });
        });
        it("should update foo", function (done)
        {
            let newFoo;
            async.series([function (callback)
            {
                let criteria = new Map();
                criteria.set("id", TimeUuid.fromString(foo.id));
                criteria.set("name", foo.name);
                eao.findOne(criteria, function (error, res)
                {
                    assert.equal(error, null);
                    newFoo = res;
                    assert(newFoo instanceof CassandraEntity);
                    assert(newFoo.id === id);
                    assert(newFoo.enabled === true);
                    return callback(error, res);
                });
            }, function (callback)
            {
                newFoo.enabled = false;
                let criteria = new Map();
                criteria.set("id", TimeUuid.fromString(newFoo.id));;
                criteria.set("name", newFoo.name);
                eao.update(newFoo, criteria, function (error, res)
                {
                    assert.equal(error, null);
                    return callback(error, res);
                });
            }, function (callback)
            {
                let criteria = new Map();
                criteria.set("id", TimeUuid.fromString(newFoo.id));;
                criteria.set("name", newFoo.name);
                eao.findOne(criteria, function (error, res)
                {
                    assert.equal(error, null);
                    assert(res instanceof CassandraEntity);
                    assert(res.id === id);
                    assert(res.enabled === false);
                    return callback(error, res);
                });
            }], function (err, results)
            {
                assert.equal(err, null);
                return done();
            });
        });
        it("should findAll Foo by criteria", function (done)
        {
            let criteria = new Map();
            criteria.set("id", TimeUuid.fromString(foo.id));;
            criteria.set("name", foo.name);
            eao.findAll(criteria, function (error, res)
            {
                assert.equal(error, null);
                assert.equal(res.length, 1);
                let newFoo = res[0];
                assert(newFoo.id === id);
                assert(newFoo.enabled === false);
                return done();
            });
        });
        it("should remove Foo by criteria", function (done)
        {
            let criteria = new Map();
            criteria.set("id", TimeUuid.fromString(foo.id));;
            eao.remove(criteria, function (error, res)
            {
                assert.equal(error, null);
                return done();
            });
        });
        it("should persist All Foo", function (done)
        {
            async.series([function (callback)
            {
                let foos = [];
                for(let i=0;i<3;i++)
                {
                    let f = new Foo({
                        name: "manyFoos"
                    });
                    foos.push(f);
                }

                eao.persistAll(foos, function (error, res)
                {
                    assert.equal(error, null);
                    return callback(error, res);
                });
            }, function (callback)
            {
                let criteria = new Map();
                criteria.set("name", "manyFoos");
                eao.findAll(criteria, function (error, res)
                {
                    assert.equal(error, null);
                    assert.equal(res.length, 3);
                    return callback(error, res);
                });
            }], function (err, results)
            {
                assert.equal(err, null);
                return done();
            });
        });
    });
});