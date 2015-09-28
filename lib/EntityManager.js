"use strict";
let async = require("async");
let _ = require("underscore");
let S = require("string");
let err = require("./errors");
let JPAConfiguration = require('./JPAConfiguration');
let CassandraClientFactory = require("./CassandraClientFactory");
let QueryBuilder = require("./QueryBuilder");
let Logger = require("./DefaultLogger");
module.exports = class EntityManager {
    constructor(config)
    {
        JPAConfiguration.validate(config);
        if (typeof config.client === "undefined" || config.client === null)
        {
            this.client = CassandraClientFactory.getClient(config.cassandra);
        }
        else
        {
            this.client = config.client;
        }
        if(config.logger)
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

    persist(entity, metaModel, callback)
    {
        let row = metaModel.toRow(entity);
        const queryObject = QueryBuilder.buildInsertQueryObject(row, metaModel);
        return this.query(queryObject, callback);
    }

    persistAll(entities, metaModel, callback)
    {
        let self = this;
        async.each(entities, function (entity, cb)
        {
            let row = metaModel.toRow(entity);
            const queryObject = QueryBuilder.buildInsertQueryObject(row, metaModel);
            return self.query(queryObject, cb);
        }, function (err)
        {
            return callback(err);
        });
    }

    updateByCriteria(entity, metaModel, callback, criteria)
    {
        let row = metaModel.toRow(entity);
        const queryObject = QueryBuilder.buildUpdateQueryByCriteria(row, metaModel, criteria);
        return this.query(queryObject, callback);
    }

    removeByCriteria(metaModel, callback, criteria)
    {
        const queryObject = QueryBuilder.buildRemoveQuery(metaModel, criteria);
        return this.query(queryObject, callback);
    }

    findOne(metaModel, callback, criteria)
    {
        const queryObject = QueryBuilder.buildSelectQueryObjectFromCriteria(metaModel, criteria);
        return this.findOneByQueryObject(queryObject, metaModel, callback);
    }

    findAll(metaModel, callback, criteria)
    {
        const queryObject = QueryBuilder.buildSelectQueryObjectFromCriteria(metaModel, criteria);
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

    truncate(metaModel, callback)
    {
        let self = this;
        let query = QueryBuilder.buildTruncateTableQuery(metaModel);
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

    createTable(metaModel, callback)
    {
        let self = this;
        let queryObject = {
            query: QueryBuilder.buildCreateTableQuery(metaModel),
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

    insertIndexes(metaModel, callback)
    {
        let self = this;
        let indexQueries = [];
        metaModel.secondaryIndexes.forEach((field) =>
        {
            let queryObject = {
                query: QueryBuilder.buildInsertIndexQuery(metaModel, field),
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

    dropIndexes(metaModel, callback)
    {
        let indexQueries = [];
        metaModel.secondaryIndexes.forEach((field) =>
        {
            let queryObject = {
                query: QueryBuilder.buildDropIndexQuery(field, metaModel),
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

    dropTable(metaModel, callback)
    {
        let queryObject = {
            query: QueryBuilder.buildDropTableQuery(metaModel),
            params: []
        };
        this.query(queryObject, function (error, result)
        {
            return callback(error, result);
        });
    }
};