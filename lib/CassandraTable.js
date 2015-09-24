"use strict";
let CassandraEntity = require("./CassandraEntity");
module.exports = class CassandraTable extends CassandraEntity {
    constructor(keyspace, config)
    {
        if (arguments.length < 1 || keyspace === null)
        {
            throw new RangeError("Invalid constructor arguments");
        }
        super(config);
        this.keyspace = keyspace;
    }

    initDefaults()
    {
        this.keyspace = "tests";
        this.name = "base";
        this.fields = new Map([["id", "timeuuid"]]);
        this.partitionKeys = ["id"];
        this.clusteringColumns = new Map();
        this.secondaryIndexes = [];
    }

    buildUpdateQueryByCriteria(row, criteria)
    {
        let subQ = this.buildWhereSubQueryFromCriteria(criteria);
        let params = [];
        let pairsQ = "";
        let propertiesCount = Object.getOwnPropertyNames(row).length - criteria.size;
        let count = 0;
        for (var key in row)
        {
            if (row.hasOwnProperty(key) && !criteria.has(key))
            {
                var value = row[key];
                params.push(value);
                pairsQ = pairsQ + "\"" + key + "\"" + "=? ";
                if (count < propertiesCount - 1)
                {
                    pairsQ = pairsQ + ", ";
                }
                count++;
            }
        }
        criteria.forEach((value, key, map) =>
        {
            params.push(value);
        });
        return {
            query: "UPDATE \"" + this.keyspace + "\".\"" + this.name + "\" SET " + pairsQ + " WHERE " + subQ + ";",
            params: params
        };
    }

    buildRemoveQuery(criteria, keyspace)
    {
        let subQ = this.buildWhereSubQueryFromCriteria(criteria);
        let params = [];
        criteria.forEach((value, key, map) =>
        {
            params.push(value);
        });
        return {
            query: "DELETE FROM  \"" + this.keyspace + "\".\"" + this.name + "\" WHERE " + subQ + ";",
            params: params
        };
    }

    buildInsertQueryObject(row, keyspace)
    {
        let params = [];
        let keys = [];
        let qq = [];
        for (var key in row)
        {
            if (row.hasOwnProperty(key))
            {
                var value = row[key];
                qq.push("?");
                keys.push(key);
                params.push(value);
            }
        }
        let paramsKeys = JSON.stringify(keys).toString().substring(1);
        paramsKeys = " (" + paramsKeys.substring(0, paramsKeys.length - 1) + ") ";
        let paramsQ = JSON.stringify(qq).toString().replace(/"/g, '').substring(1);
        paramsQ = " (" + paramsQ.substring(0, paramsQ.length - 1) + ") ";
        let queryObject = {
            query: "INSERT INTO \"" + this.keyspace + "\".\"" + this.name + "\"" + paramsKeys + " VALUES " + paramsQ + " IF NOT EXISTS;",
            params: params
        };
        return (queryObject);
    }

    buildSelectQueryObjectFromCriteria(criteria)
    {
        let subQ = this.buildWhereSubQueryFromCriteria(criteria);
        let params = [];
        criteria.forEach(function (value, key, map)
        {
            params.push(value);
        });
        return {
            query: "SELECT * FROM \"" + this.keyspace + "\".\"" + this.name + "\" WHERE " + subQ + ";",
            params: params
        };
    }

    buildWhereSubQueryFromCriteria(criteria)
    {
        let q = '';
        let count = 0;
        criteria.forEach(function (value, key, map)
        {
            q = q + "\"" + key + "\" = ? ";
            if (count < map.size - 1)
            {
                q = q + "AND ";
            }
            count++;
        });
        return q;
    }

    buildCreateTableQuery()
    {
        let q = "CREATE TABLE IF NOT EXISTS \"" + this.keyspace + "\".\"" + this.name + "\" ( ";
        this.fields.forEach(function (value, key)
        {
            q = q + '"' + key + '"' + " " + value + ", ";
        });
        q = q + "PRIMARY KEY ((";
        if (this.partitionKeys.length > 0)
        {
            this.partitionKeys.forEach(function (item, index, array)
            {
                q = q + '"' + item + '"';
                if (index < array.length - 1)
                {
                    q = q + ",";
                }
            });
        }
        q = q + ")";
        // clustering keys
        if (this.clusteringColumns.size > 0)
        {
            q = q + ", ";
            this.clusteringColumns.forEach(function (value, key)
            {
                q = q + '"' + key + '"';
                q = q + ",";
            });
            q = q.substring(0, q.length - 1);
            q = q + ")) ";
            q = q + "WITH CLUSTERING ORDER BY (";
            this.clusteringColumns.forEach(function (value, key)
            {
                q = q + '"' + key + '" ';
                q = q + value;
                q = q + ",";
            });
            q = q.substring(0, q.length - 1);
        }
        else
        {
            q = q + ") ";
        }
        q = q + "); ";
        return q;
    }

    buildDropTableQuery(table)
    {
        return "DROP TABLE IF EXISTS \"" + this.keyspace + "\".\"" + this.name + "\"";
    }

    buildInsertIndexQuery(field)
    {
        return "CREATE INDEX ON \"" + this.keyspace + "\".\"" + this.name + "\"(" + field + ");";
    }

    buildDropIndexQuery(indexName)
    {
        return "DROP INDEX IF EXISTS \"" + this.keyspace + "\".\"" + indexName + "\";";
    }

    // Setter and Getters
    get keyspace()
    {
        return this._keyspace;
    }

    set keyspace(value)
    {
        this._keyspace = value;
    }

    get name()
    {
        return this._name;
    }

    set name(value)
    {
        this._name = value;
    }

    get fields()
    {
        return this._fields;
    }

    set fields(value)
    {
        if (value instanceof Map === false)
        {
            throw new RangeError("Invalid argument, required Map ");
        }
        this._fields = value;
    }

    get partitionKeys()
    {
        return this._partitionKeys;
    }

    set partitionKeys(value)
    {
        if (!Array.isArray(value))
        {
            throw new RangeError("Invalid argument, required array ");
        }
        this._partitionKeys = value;
    }

    get clusteringColumns()
    {
        return this._clusteringColumns;
    }

    set clusteringColumns(value)
    {
        if (value instanceof Map === false)
        {
            throw new RangeError("Invalid argument, required Map ");
        }
        this._clusteringColumns = value;
    }

    get secondaryIndexes()
    {
        return this._secondaryIndexes;
    }

    set secondaryIndexes(value)
    {
        if (!Array.isArray(value))
        {
            throw new RangeError("Invalid argument, required array ");
        }
        this._secondaryIndexes = value;
    }
};