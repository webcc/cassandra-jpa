"use strict";

const async = require("async");
const debug = require("debug")("cassandra-jpa");
const _ = require("underscore");
const S = require("string");
const err = require("./JPAErrors");
const JPAConfiguration = require('./JPAConfiguration');
const CassandraClientFactory = require("./CassandraClientFactory");
const CriteriaBuilder = require("./CriteriaBuilder");

module.exports = class EntityManager {
    constructor(config, metaModel)
    {
        this.metaModel = metaModel;
        this.config = config;
        if (this.metaModel)
        {
            this.criteriaBuilder = new CriteriaBuilder(this.metaModel);
            this.criteriaQuery = this.criteriaBuilder.createQuery(this.metaModel);
        }
        this.client = CassandraClientFactory.getClient(config.cassandra);
        this.client.on("log", function (level, className, message, furtherInfo)
        {
            debug("[%s] %s [%s], className: %s", level, message, furtherInfo, className);
        });
    }

    getCriteriaBuilder(metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        if (!this.criteriaBuilder)
        {
            this.criteriaBuilder = new CriteriaBuilder(this.metaModel);
        }
        return this.criteriaBuilder;
    }

    getCriteriaQuery(metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        if (!this.criteriaQuery)
        {
            this.criteriaQuery = this.getCriteriaBuilder(this.metaModel).createQuery(this.metaModel);
        }
        return this.criteriaQuery;
    }

    persist(entity, callback, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        let row = this.metaModel.toRow(entity);
        row.id = row.id.toString();
        const queryObject = this.getCriteriaQuery().insert(row);
        return this.query(queryObject, callback);
    }

    persistAll(entities, callback, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        let self = this;
        async.each(entities, function (entity, cb)
        {
            let row = self.metaModel.toRow(entity);
            const queryObject = self.getCriteriaQuery().insert(row);
            return self.query(queryObject, cb);
        }, function (err)
        {
            return callback(err);
        });
    }

    persistBunch(entities, callback, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        let queryObjects = [];
        entities.forEach((entity)=>
        {
            let row = this.metaModel.toRow(entity);
            let q = this.getCriteriaQuery().insertOrUpdate(row);
            queryObjects.push(q);
        });
        this.queryBatch(queryObjects, callback);
    }

    updateByCriteria(entity, callback, criteriaQuery, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        let row = this.metaModel.toRow(entity);
        const queryObject = this.getCriteriaQuery().update(row, criteriaQuery);
        return this.query(queryObject, callback);
    }

    removeByCriteria(callback, criteriaQuery, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        const queryObject = this.getCriteriaQuery().remove(criteriaQuery);
        return this.query(queryObject, callback);
    }

    findOne(callback, criteriaQuery, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        const queryObject = {
            query: this.getCriteriaQuery().from(criteriaQuery),
            params: null
        };
        return this.findOneByQueryObject(queryObject, this.metaModel, callback);
    }

    findAll(callback, criteriaQuery, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        const queryObject = {
            query: this.getCriteriaQuery().from(criteriaQuery),
            params: null
        };
        return this.findAllByQueryObject(queryObject, this.metaModel, callback);
    }

    query(queryObject, callback)
    {
        this.logQueryObject(queryObject);
        let self = this;
        this.client.execute(queryObject.query, queryObject.params,
            this.client.options.queryOptions, function (error, result)
            {
                if (error)
                {
                    debug(JSON.stringify(error, null, 0));
                }
                else
                {
                    debug(JSON.stringify(result, null, 0));
                }
                return callback(error, result);
            });
    }

    queryBatch(queryObjects, callback)
    {
        let self = this;
        const MAX_QUERY_LENGTH = 16;
        let splicedQ = [];
        while (queryObjects.length)
        {
            splicedQ.push(queryObjects.splice(0, MAX_QUERY_LENGTH));
        }
        async.eachSeries(splicedQ, function (queryObjectsPart, cb)
        {
            self.client.batch(queryObjectsPart, self.client.options.queryOptions,
                function (error, result)
                {
                    self.logQueryObject(queryObjectsPart);
                    if (error)
                    {
                        debug(JSON.stringify(error, null, 0));
                    }
                    else
                    {
                        debug(JSON.stringify(result, null, 0));
                    }
                    cb();
                });
        }, function (err)
        {
            if (err)
            {
                debug(JSON.stringify(err, null, 0));
            }
            return callback(err, null);
        });
    }

    truncate(callback, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        let self = this;
        let query = this.getCriteriaQuery().truncate();
        this.client.execute(query, null, this.client.options.queryOptions,
            function (error, result)
            {
                if (error)
                {
                    debug(JSON.stringify(error, null, 0));
                }
                else
                {
                    debug(JSON.stringify(result, null, 0));
                }
                return callback(error, result);
            });
    }

    findAllByQueryObject(queryObject, metaModel, callback)
    {
        this.metaModel = metaModel || this.metaModel;
        let self = this;
        if (typeof callback !== "function")
        {
            let msg = "passed not valid arguments for findAllByQueryObject. Expected function object";
            debug(msg);
            return callback(msg);
        }
        this.query(queryObject, function (error, result)
        {
            if (error)
            {
                debug(JSON.stringify(error, null, 0));
                return callback(error, null);
            }
            else
            {
                if (result && result.rows)
                {
                    let entities = [];
                    result.rows.forEach(function (row)
                    {
                        entities.push(self.metaModel.fromRow(row));
                    });
                    return callback(error, entities);
                }
                else
                {
                    return callback(error, null);
                }
            }
        });
    }

    findOneByQueryObject(queryObject, metaModel, callback)
    {
        this.metaModel = metaModel || this.metaModel;
        let self = this;
        if (typeof callback !== "function")
        {
            debug("not valid for findOneByQueryObject arguments. Expected function object, found: " + typeof func);
            return null;
        }
        this.query(queryObject, function (error, result)
        {
            if (error)
            {
                debug(JSON.stringify(error, null, 0));
                return callback(error, null);
            }
            else
            {
                if (result && result.rows)
                {
                    if (result.rows[ 0 ])
                    {
                        return callback(error,
                            self.metaModel.fromRow(result.rows[ 0 ]));
                    }
                    else
                    {
                        return callback(null, null);
                    }
                }
                else
                {
                    return callback(error, null);
                }
            }
        });
    }

    removeByQueryObject(queryObject, callback)
    {
        let self = this;
        this.query(queryObject, function (error, result)
        {
            if (error)
            {
                debug(JSON.stringify(error, null, 0));
            }
            else
            {
                debug(JSON.stringify(result, null, 0));
            }
            return callback(error, queryObject.params);
        });
    }

    createTable(callback, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        let self = this;
        let queryObject = {
            query: this.getCriteriaQuery().create(),
            params: []
        };
        this.query(queryObject, function (error, result)
        {
            if (error === null)
            {
                return callback(error);
            }
            return callback(error, result);
        });
    }

    insertIndexes(callback, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        let self = this;
        let indexQueries = [];
        this.metaModel.secondaryIndexes.forEach((field) =>
        {
            let queryObject = {
                query: this.getCriteriaQuery().insertIndex(field),
                params: []
            };
            indexQueries.push(queryObject);
        });
        async.each(indexQueries, function (queryObject, cb)
        {
            self.query(queryObject, function (error, result)
            {
                return cb(error, result);
            });
        }, function (err, res)
        {
            return callback(err, res);
        });
    }

    dropIndexes(callback, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        let indexQueries = [];
        this.metaModel.secondaryIndexes.forEach((field) =>
        {
            let queryObject = {
                query: this.getCriteriaQuery().dropIndex(field),
                params: []
            };
            indexQueries.push(queryObject);
        });
        this.queryBatch(indexQueries, function (error, result)
        {
            if (error === null)
            {
                return callback(error, result);
            }
        });
    }

    dropTable(callback, metaModel)
    {
        this.metaModel = metaModel || this.metaModel;
        let queryObject = {
            query: this.getCriteriaQuery().drop(),
            params: []
        };
        this.query(queryObject, function (error, result)
        {
            return callback(error, result);
        });
    }

    logQueryObject(q)
    {
        let logQueryObject = false;
        if (this.config.logQueryObject !== "undefined")
        {
            logQueryObject = this.config.logQueryObject;
        }
        if (logQueryObject)
        {
            debug(JSON.stringify(q));
        }
    }
};