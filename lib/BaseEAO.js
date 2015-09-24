"use strict";
let async = require("async");
let _ = require("underscore");
let S = require("string");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
let PersistenceError = require("./errors/PersistenceError");
let CassandraEntity = require("./CassandraEntity");
let PersistenceUtils = require("./PersistenceUtils");
let PersistenceConfiguration = require('./PersistenceConfiguration');
let CassandraClientFactory = require("./CassandraClientFactory");
let Logger;
module.exports = class BaseEAO {
    constructor(config)
    {
        PersistenceConfiguration.validate(config);
        Logger = config.logger;
        if (config.cassandra.client === null)
        {
            this.client = CassandraClientFactory.getClient(config.cassandra);
        }
        else
        {
            this.client = config.cassandra.client;
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
        this.entityClass = config.baseEntityClass || CassandraEntity;
        this.table = {
            name: "base",
            fields: new Map([["id", "timeuuid"]]),
            partitionKeys: ["id"],
            clusteringColumns: new Map(),
            secondaryIndexes: []
        };
        this.ttl = this.client.options.queryOptions.ttl;
        Logger = config.logger;
    }

    persistRow(row, callback)
    {
        const queryObject = PersistenceUtils.buildInsertQueryObject(row, this.table.name, this.client.options.keyspace);
        return this.query(queryObject, callback);
    }

    persistAllRows(rows, callback)
    {
        let self = this;
        async.each(rows, function (row, cb)
        {
            const queryObject = PersistenceUtils.buildInsertQueryObject(row, self.table.name, self.client.options.keyspace);
            return self.query(queryObject, cb);
        }, function (err)
        {
            return callback(err);
        });
    }

    updateRowByCriteria(row, criteria, callback)
    {
        const queryObject = PersistenceUtils.buildUpdateQueryByCriteria(row, criteria, this.table.name,
        this.client.options.keyspace);
        return this.query(queryObject, callback);
    }

    updateRow(row, callback)
    {
        throw Error("not implemented"); //TODO:implement
        /*
        const queryObject = PersistenceUtils.buildUpdateQuery(row, this.table.name,
        this.client.options.keyspace);
        return this.query(queryObject, callback);
         */
    }

    removeRows(criteria, callback)
    {
        const queryObject = PersistenceUtils.buildRemoveQuery(criteria, this.table.name, this.client.options.keyspace);
        return this.query(queryObject, callback);
    }

    findOneRow(criteria, callback)
    {
        const queryObject = PersistenceUtils.buildSelectQueryObjectFromCriteria(criteria, this.table.name,
        this.client.options.keyspace);
        return this.findOneByQueryObject(queryObject, this.fromRow, callback);
    }

    findAllRows(criteria, callback)
    {
        const queryObject = PersistenceUtils.buildSelectQueryObjectFromCriteria(criteria, this.table.name,
        this.client.options.keyspace);
        return this.findAllByQueryObject(queryObject, this.fromRow, callback);
    }

    fromRow(row)
    {
        if (row === "undefined" || row === null)
        {
            throw new TypeError("invalid row: " + typeof entity);
        }
        Object.keys(row).forEach(key =>
        {
            if (typeof row[key] === "object")
            {
                if (row[key] instanceof TimeUuid)
                {
                    row[key] = row[key].toString();
                }
            }
        });
        return new this.entityClass(row);
    }

    toRow(entity)
    {
        if (entity === "undefined" || entity === null)
        {
            throw new TypeError("entity row cannot be prepared, unexpected entity type: " + typeof entity);
        }
        if (entity instanceof CassandraEntity === false)
        {
            throw new RangeError("row cannot be prepared, unexpected entity class: " + entity.constructor.name);
        }
        let entityClone = entity.clone();
        Object.keys(entityClone).forEach(propertyKey =>
        {
            let property = entityClone[propertyKey];
            if (propertyKey === "_id")
            {
                try
                {
                    entityClone[propertyKey] = TimeUuid.fromString(property.toString());
                }
                catch (e)
                {
                    throw new TypeError("id of the entity expected as TimeUuid, found " + property);
                }
                if (entityClone[propertyKey] instanceof TimeUuid === false)
                {
                    throw new TypeError("id of the entity expected as TimeUuid, found " + entityClone[propertyKey]);
                }
            }
            else
            {
                if (typeof property === "object")
                {
                    if (property === null)
                    {
                        entityClone[propertyKey] = null;
                    }
                    else if (property instanceof CassandraEntity)
                    {
                        entityClone[propertyKey] = JSON.stringify(property);
                    }
                    else if (property instanceof TimeUuid)
                    {
                        entityClone[propertyKey] = PersistenceUtils.getTimeUuid(property);
                    }
                    else if (property instanceof Date)
                    {
                        let timeUuid = TimeUuid.fromDate(property);
                        entityClone[propertyKey] = timeUuid.toString();
                        //TODO: keep native Date for Cassandra 2.2
                    }
                    else if (property instanceof Map)
                    {
                        property.forEach()
                    }
                    else if (Array.isArray(property))
                    {
                        let properties = [];
                        property.forEach((pro) =>
                        {
                            if (pro instanceof CassandraEntity)
                            {
                                properties.push(JSON.stringify(pro));
                            }
                            else
                            {
                                properties.push(pro);
                            }
                        });
                        entityClone[propertyKey] = properties;
                    }
                    else
                    {
                        throw new PersistenceError("Not available translation for row property");
                    }
                }
            }
        });
        return entityClone.toJSON();
    }

    query(queryObject, callback)
    {
        let self = this;
        queryObject.query = this.parameterizeQuery(queryObject.query, {});
        this.client.execute(queryObject.query, queryObject.params, this.client.options.queryOptions, function (error, result)
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
        let self = this;
        queryObjects = queryObjects.map(function (queryObject)
        {
            queryObject.query = self.parameterizeQuery(queryObject.query, {});
            return queryObject;
        });
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

    truncate(callback)
    {
        let self = this;
        const Q_TRUNCATE_TABLE = "TRUNCATE {{keyspace}}.{{table}};";
        let query = this.parameterizeQuery(Q_TRUNCATE_TABLE, {});
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

    getDefaultStringTemplateValues()
    {
        return {
            keyspace: this.client.options.keyspace,
            table: this.table.name,
            ttl: this.ttl
        };
    }

    parameterizeQuery(query, stringTemplateValues) //TODO: replace string with es6
    {
        return S(query).template(_.extend(this.getDefaultStringTemplateValues(), stringTemplateValues)).s;
    }

    findAllByQueryObject(queryObject, func, callback)
    {
        let self = this;
        if (typeof func !== "function" || typeof callback !== "function")
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
                        entities.push(func.call(self, row));
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

    findOneByQueryObject(queryObject, func, callback)
    {
        let self = this;
        if (typeof func !== "function" || typeof callback !== "function")
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
                        return callback(error, func.call(self, result.rows[0]));
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

    createTable(callback)
    {
        let self = this;
        let queryObject = {
            query: PersistenceUtils.buildCreateTableQuery(this.table),
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

    insertIndexes(callback)
    {
        let self = this;
        let indexQueries = [];
        this.table.secondaryIndexes.forEach((field) =>
        {
            let queryObject = {
                query: PersistenceUtils.buildInsertIndexQuery(field),
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

    dropIndexes()
    {
        let indexQueries = [];
        this.table.secondaryIndexes.forEach((field) =>
        {
            let queryObject = {
                query: PersistenceUtils.buildDropIndexQuery(field),
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

    dropTable(callback)
    {
        let queryObject = {
            query: PersistenceUtils.buildDropTableQuery(),
            params: []
        };
        this.query(queryObject, function (error, result)
        {
            return callback(error, result);
        });
    }
};