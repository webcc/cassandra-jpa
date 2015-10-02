"use strict";
let async = require("async");
let _ = require("underscore");
let S = require("string");
let err = require("./errors");
let JPAConfiguration = require('./JPAConfiguration');
let CassandraClientFactory = require("./CassandraClientFactory");
let CriteriaBuilder = require("./CriteriaBuilder");
let Logger = require("./DefaultLogger");
module.exports = class EntityManager {
    constructor(config, metaModel)
    {
        JPAConfiguration.validate(config);
        this.metaModel = metaModel;
        if (this.metaModel)
        {
            this.criteriaBuilder = new CriteriaBuilder(metaModel);
            this.criteriaQuery = this.criteriaBuilder.createQuery();
        }
        if (typeof config.client === "undefined" || config.client === null)
        {
            this.client = CassandraClientFactory.getClient(config.cassandra);
        }
        else
        {
            this.client = config.client;
        }
        if (config.logger)
        {
            this.logger = config.logger;
        }
        this.client.on("log", function (level, className, message, furtherInfo)
        {
            if (level === "error")
            {
                Logger.error("(cassandra) %s [%s], className: %s", message, furtherInfo, className);
            }
            else
            {
                Logger.debug("(cassandra) %s [%s], className: %s", message, furtherInfo, className);
            }
        });
    }

    getCriteriaBuilder(metaModel)
    {
        metaModel = metaModel || this.metaModel;
        if (!this.criteriaBuilder)
        {
            this.criteriaBuilder = new CriteriaBuilder(metaModel);
        }
        return this.criteriaBuilder;
    }

    getCriteriaQuery(metaModel)
    {
        metaModel = metaModel || this.metaModel;
        if (!this.criteriaQuery)
        {
            this.criteriaQuery = this.getCriteriaBuilder(metaModel).createQuery();
        }
        return this.criteriaQuery;
    }

    persist(entity, callback, metaModel)
    {
        metaModel = metaModel || this.metaModel;
        let row = metaModel.toRow(entity);
        const queryObject = this.getCriteriaQuery(metaModel).insert(row);
        return this.query(queryObject, callback);
    }

    persistAll(entities, callback, metaModel)
    {
        metaModel = metaModel || this.metaModel;
        let self = this;
        async.each(entities, function (entity, cb)
        {
            let row = metaModel.toRow(entity);
            const queryObject = self.getCriteriaQuery(metaModel).insert(row);
            return self.query(queryObject, cb);
        }, function (err)
        {
            return callback(err);
        });
    }

    updateByCriteria(entity, callback, criteriaQuery, metaModel)
    {
        metaModel = metaModel || this.metaModel;
        let row = metaModel.toRow(entity);
        const queryObject = this.getCriteriaQuery(metaModel).update(row, criteriaQuery);
        return this.query(queryObject, callback);
    }

    removeByCriteria(callback, criteriaQuery, metaModel)
    {
        metaModel = metaModel || this.metaModel;
        const queryObject = this.getCriteriaQuery(metaModel).remove(criteriaQuery);
        return this.query(queryObject, callback);
    }

    findOne(callback, criteriaQuery, metaModel)
    {
        metaModel = metaModel || this.metaModel;
        const queryObject = {
            query: this.getCriteriaQuery(metaModel).from(criteriaQuery),
            params: null
        };
        return this.findOneByQueryObject(queryObject, metaModel, callback);
    }

    findAll(callback, criteriaQuery, metaModel)
    {
        metaModel = metaModel || this.metaModel;
        const queryObject = {
            query: this.getCriteriaQuery(metaModel).from(criteriaQuery),
            params: null
        };
        return this.findAllByQueryObject(queryObject, metaModel, callback);
    }

    query(queryObject, callback)
    {
        let self = this;
        this.client.execute(queryObject.query, queryObject.params, this.client.options.queryOptions,
        function (error, result)
        {
            if (error)
            {
                Logger.error(JSON.stringify(error, null, 0));
            }
            else
            {
                Logger.debug(JSON.stringify(result, null, 0));
            }
            return callback(error, result);
        });
    }

    queryBatch(queryObjects, callback)
    {
        const MAX_QUERY_LENGTH = 16;
        let splicedQ = [];
        while (queryObjects.length)
        {
            splicedQ.push(queryObjects.splice(0, MAX_QUERY_LENGTH));
        }
        async.eachSeries(splicedQ, function (query, cb)
        {
            self.client.batch(query, self.client.options.queryOptions, function (error, result)
            {
                if (error)
                {
                    Logger.error(JSON.stringify(error, null, 0));
                }
                else
                {
                    Logger.debug(JSON.stringify(result, null, 0));
                }
                cb();
            });
        }, function (err)
        {
            if (err)
            {
                Logger.error(JSON.stringify(err, null, 0));
            }
            return callback(err, null);
        });
    }

    truncate(callback, metaModel)
    {
        metaModel = metaModel || this.metaModel;
        let self = this;
        let query = this.getCriteriaQuery(metaModel).truncate();
        this.client.execute(query, null, this.client.options.queryOptions, function (error, result)
        {
            if (error)
            {
                Logger.error(JSON.stringify(error, null, 0));
            }
            else
            {
                Logger.debug(JSON.stringify(result, null, 0));
            }
            return callback(error, result);
        });
    }

    findAllByQueryObject(queryObject, metaModel, callback)
    {
        let self = this;
        if (typeof callback !== "function")
        {
            let msg = "passed not valid arguments for findAllByQueryObject. Expected function object";
            Logger.warn(msg);
            return callback(msg);
        }
        this.query(queryObject, function (error, result)
        {
            if (error)
            {
                Logger.error(JSON.stringify(error, null, 0));
                return callback(error, null);
            }
            else
            {
                if (result && result.rows)
                {
                    let entities = [];
                    result.rows.forEach(function (row)
                    {
                        entities.push(metaModel.fromRow(row));
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
        let self = this;
        if (typeof callback !== "function")
        {
            Logger.warn("not valid for findOneByQueryObject arguments. Expected function object, found: " + typeof func);
            return null;
        }
        this.query(queryObject, function (error, result)
        {
            if (error)
            {
                Logger.error(JSON.stringify(error, null, 0));
                return callback(error, null);
            }
            else
            {
                if (result && result.rows)
                {
                    if (result.rows[0])
                    {
                        return callback(error, metaModel.fromRow(result.rows[0]));
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
                Logger.error(JSON.stringify(error, null, 0));
            }
            else
            {
                Logger.debug(JSON.stringify(result, null, 0));
            }
            return callback(error, queryObject.params);
        });
    }

    createTable(callback, metaModel)
    {
        metaModel = metaModel || this.metaModel;
        let self = this;
        let queryObject = {
            query: this.getCriteriaQuery(metaModel).create(),
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
        metaModel = metaModel || this.metaModel;
        let self = this;
        let indexQueries = [];
        metaModel.secondaryIndexes.forEach((field) =>
        {
            let queryObject = {
                query: this.getCriteriaQuery(metaModel).insertIndex(field),
                params: []
            };
            indexQueries.push(queryObject);
        });
        async.each(indexQueries, function (queryObject, cb)
        {
            self.query(queryObject, function (error, result)
            {
                if (error === null)
                {
                    return cb(error, result);
                }
            });
        }, function (err, res)
        {
            return callback(err, res);
        });
    }

    dropIndexes(callback, metaModel)
    {
        metaModel = metaModel || this.metaModel;
        let indexQueries = [];
        metaModel.secondaryIndexes.forEach((field) =>
        {
            let queryObject = {
                query: this.getCriteriaQuery(metaModel).dropIndex(field),
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
        metaModel = metaModel || this.metaModel;
        let queryObject = {
            query: this.getCriteriaQuery(metaModel).drop(),
            params: []
        };
        this.query(queryObject, function (error, result)
        {
            return callback(error, result);
        });
    }
};