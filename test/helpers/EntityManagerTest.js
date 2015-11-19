"use strict";

const async = require("async");
const debug = require("debug")("cassandra-jpa");
const assert = require("assert");
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const Persistence = require("./../../lib/Persistence");
const EntityManager = require("./../../lib/EntityManager");

module.exports = class EntityManagerTest {
    constructor(config)
    {
        this.jpaConfig = config.jpaConfig;
        this.metaModelClass = config.metaModelClass;
        this.metaModel = new this.metaModelClass(this.jpaConfig);
        this.entityManager = null;
        this.entityClass = config.entityClass;
        this.entity = config.entity;
        this.testField = config.testField;
        this.testFieldValue = config.testFieldValue;
        this.idField = config.idField;
        this.idValue = config.idValue;
        this.criteriaQuery = config.criteriaQuery;
    }

    testInitManager()
    {
        this.emFactory = Persistence.createEntityManagerFactory("Foo", this.jpaConfig);
        this.entityManager = this.emFactory.createEntityManager(this.metaModel);
        this.cb = this.entityManager.getCriteriaBuilder();
        this.cq = this.cb.createQuery();
        assert.equal(this.entityManager instanceof EntityManager, true);
        assert.equal(this.entityManager.metaModel instanceof this.metaModelClass, true);
    }

    testToRow()
    {
        debug("should convert entity to row");
        let row = this.metaModel.toRow(this.entity);
        assert.equal(row[this.testField], this.testFieldValue);
    }

    testFromRow()
    {
        debug("should convert row to entity");
        let row = this.metaModel.toRow(this.entity);
        let entityNew = this.metaModel.fromRow(row);
        assert.equal(entityNew instanceof this.entityClass, true);
        assert.equal(row[this.testField], this.testFieldValue);
    }

    testDropTable(done)
    {
        debug("should drop Table entity");
        this.entityManager.dropTable(function (error, res)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testCreateTable(done)
    {
        debug("should drop Table entity");
        this.entityManager.createTable(function (error, res)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testInsertIndexes(done)
    {
        debug("should insert Indexes to Table entity");
        this.entityManager.insertIndexes(function (error, res)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testTruncateTable(done)
    {
        debug("should truncate Table entity");
        this.entityManager.truncate(function (error, res)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testPersist(done)
    {
        debug("should persist");
        this.entityManager.persist(this.entity, function (error, result)
        {
            assert.equal(error, null);
            return done();
        });
    }

    testFindOne(done, criteriaQuery)
    {
        let self = this;
        debug("should findOne by criteria");
        assert.equal(this.entity[this.testField], this.testFieldValue);
        if(!criteriaQuery)
        {
            let op1 = this.cb.equal(this.idField, this.idValue);
            let q1 = this.cb.and([op1]);
            criteriaQuery = this.cq.where(this.cb.and([op1]));
        }
        this.entityManager.findOne(function (error, res)
        {
            assert.equal(error, null);
            if(self.entityManager.entityClass)
            {
                assert(res instanceof self.entityClass);
            }
            assert.equal(res[self.idField], self.idValue);
            assert.equal(res[self.testField], self.testFieldValue);
            return done();
        }, criteriaQuery);
    }

    testUpdate(done)
    {
        debug("should update entity");
        let self = this;
        let newEntity;
        async.series([function (callback)
        {
            let criteria = new Map();
            criteria.set("id", TimeUuid.fromString(entity.id));
            self.entityManager.findOne(function (error, res)
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
            self.entityManager.updateByCriteria(newEntity, function (error, res)
            {
                assert.equal(error, null);
                return callback(error, res);
            }, criteria);
        }, function (callback)
        {
            criteria.set("id", TimeUuid.fromString(newEntity.id));
            self.entityManager.findOne(function (error, res)
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
        debug("should findAll entityClass by criteria");
        this.entityManager.findAll(function (error, res)
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
        debug("should remove entityClass by criteria");
        criteria.set("id", TimeUuid.fromString(entity.id));
        this.entityManager.removeByCriteria(function (error, res)
        {
            assert.equal(error, null);
            return done();
        }, criteria);
    }

    testPersistAll(done)
    {
        debug("should persist All entityClass");
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
            self.entityManager.persistAll(entities, function (error, res)
            {
                assert.equal(error, null);
                return callback(error, res);
            });
        }, function (callback)
        {
            let criteria = new Map();
            criteria.set("testCriterionID", "http://criterio.info");
            self.entityManager.findAll(function (error, res)
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