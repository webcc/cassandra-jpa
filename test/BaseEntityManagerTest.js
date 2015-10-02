"use strict";
let assert = require("assert");
let async = require("async");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
let jpa = require("cassandra-jpa");
module.exports = class EntityManagerBaseTest {
    constructor(config, jpaConfig)
    {
        this.jpaConfig = jpaConfig;
        this.metaModelClass = config.metaModelClass;
        this.metaModel = new this.metaModelClass(this.jpaConfig.cassandra.keyspace);
        this.entityManager = null;
        this.entityClass = config.entityClass;
        this.entity = config.entity;
        this.testField = config.testField;
        this.testFieldValue = config.testFieldValue;
        this.criteria = config.criteria;
    }

    testInitManager()
    {
        let emFactory = jpa.Persistence.createEntityManagerFactory(this.metaModel.name, config);
        this.entityManager = emFactory.createEntityManager();
        assert.equal(this.entityManager instanceof jpa.EntityManager, true);
    }

    testToRow()
    {
        Logger.info("should convert entity to row");
        let row = this.metaModel.toRow(entity);
        assert.equal(row.id instanceof TimeUuid, true);
    }

    testFromRow()
    {
        Logger.info("should convert row to entity");
        let row = this.metaModel.toRow(entity);
        let entityNew = this.metaModel.fromRow(row);
        assert.equal(entityNew instanceof this.entityClass, true);
        assert.equal(typeof entityNew.id === "string", true);
    }

    testDropTable(done)
    {
        Logger.info("should drop Table entity");
        this.entityManager.dropTable(this.metaModel, function (error, res)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testCreateTable(done)
    {
        Logger.info("should drop Table entity");
        this.entityManager.createTable(this.metaModel, function (error, res)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testInsertIndexes(done)
    {
        Logger.info("should insert Indexes to Table entity");
        this.entityManager.insertIndexes(this.metaModel, function (error, res)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testTruncateTable(done)
    {
        Logger.info("should truncate Table entity");
        this.entityManager.truncate(this.metaModel, function (error, res)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testPersist(done)
    {
        Logger.info("should persist");
        this.entityManager.persist(entity, this.metaModel, function (error, result)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testFindOne(done)
    {
        Logger.info("should findOne by criteria");
        let criteria = new Map();
        criteria.set("id", TimeUuid.fromString(this.entity.id));
        this.entityManager.findOne(this.metaModel, function (error, res)
        {
            assert.equal(error, null);
            assert(res instanceof entityClass);
            assert(res.id === id);
            return done();
        }, criteria);
    }

    testUpdate(done)
    {
        Logger.info("should update entity");
        let self = this;
        let newEntity;
        async.series([function (callback)
        {
            let criteria = new Map();
            criteria.set("id", TimeUuid.fromString(entity.id));
            self.entityManager.findOne(this.metaModel, function (error, res)
            {
                assert.equal(error, null);
                newEntity = res;
                assert(newEntity instanceof entityClass);
                assert(newEntity.id === id);
                return callback(error, res);
            }, criteria);
        }, function (callback)
        {
            criteria.set("id", TimeUuid.fromString(newEntity.id));
            self.entityManager.updateByCriteria(newEntity, this.metaModel, function (error, res)
            {
                assert.equal(error, null);
                return callback(error, res);
            }, criteria);
        }, function (callback)
        {
            criteria.set("id", TimeUuid.fromString(newEntity.id));
            self.entityManager.findOne(this.metaModel, function (error, res)
            {
                assert.equal(error, null);
                assert(res instanceof entityClass);
                assert(res.id === id);
                return callback(error, res);
            }, criteria);
        }], function (err, results)
        {
            assert.equal(err, null);
            return done();
        });
    }

    testFindAll(done)
    {
        Logger.info("should findAll entityClass by criteria");
        this.entityManager.findAll(this.metaModel, function (error, res)
        {
            assert.equal(error, null);
            assert.equal(res.length, 1);
            let newEntity = res[0];
            assert(newEntity.id === id);
            return done();
        }, criteria);
    }

    testRemove(done)
    {
        Logger.info("should remove entityClass by criteria");
        criteria.set("id", TimeUuid.fromString(entity.id));
        this.entityManager.removeByCriteria(this.metaModel, function (error, res)
        {
            assert.equal(error, null);
            return done();
        }, criteria);
    }

    testPersistAll(done)
    {
        Logger.info("should persist All entityClass");
        let self = this;
        async.series([function (callback)
        {
            let entities = [];
            for (let i = 0; i < 3; i++)
            {
                let f = new entityClass({
                    testCriterionID: "http://criterio.info",
                    testField: testFieldValue
                });
                entities.push(f);
            }
            self.entityManager.persistAll(entities, this.metaModel, function (error, res)
            {
                assert.equal(error, null);
                return callback(error, res);
            });
        }, function (callback)
        {
            let criteria = new Map();
            criteria.set("testCriterionID", "http://criterio.info");
            self.entityManager.findAll(this.metaModel, function (error, res)
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
    }
};