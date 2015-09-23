"use strict";
let TimeUuid = require('cassandra-driver').types.TimeUuid;
module.exports = class PersistenceUtils {
    static buildInsertQuery(table)
    {
    }

    static buildUpdateQuery(row, criteria, tableName, keyspace)
    {
        let subQ = PersistenceUtils.buildWhereSubQueryFromCriteria(criteria);
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
            query: "UPDATE \"" + keyspace + "\".\"" + tableName + "\" SET " + pairsQ + " WHERE " + subQ + ";",
            params: params
        };
    }

    static buildRemoveQuery(criteria, tableName, keyspace)
    {
        let subQ = PersistenceUtils.buildWhereSubQueryFromCriteria(criteria);
        let params = [];
        criteria.forEach((value, key, map) =>
        {
            params.push(value);
        });
        return {
            query: "DELETE FROM  \"" + keyspace + "\".\"" + tableName + "\" WHERE " + subQ + ";",
            params: params
        };
    }

    static buildInsertQueryObject(row, tableName, keyspace)
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
            query: "INSERT INTO \"" + keyspace + "\".\"" + tableName + "\"" + paramsKeys + " VALUES " + paramsQ + " IF NOT EXISTS;",
            params: params
        };
        return (queryObject);
    }

    static buildSelectQueryObjectFromCriteria(criteria, tableName, keyspace)
    {
        let subQ = PersistenceUtils.buildWhereSubQueryFromCriteria(criteria);
        let params = [];
        criteria.forEach(function (value, key, map)
        {
            params.push(value);
        });
        let queryObject = {
            query: "SELECT * FROM " + keyspace + "." + tableName + " WHERE " + subQ + ";",
            params: params
        };
        return queryObject;
    }

    static buildWhereSubQueryFromCriteria(criteria)
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

    static buildCreateTableQuery(table)
    {
        let q = 'CREATE TABLE IF NOT EXISTS "{{keyspace}}"."{{table}}" (';
        table.fields.forEach(function (value, key)
        {
            q = q + '"' + key + '"' + " " + value + ", ";
        });
        q = q + "PRIMARY KEY ((";
        if (table.partitionKeys.length > 0)
        {
            table.partitionKeys.forEach(function (item, index, array)
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
        if (table.clusteringColumns.size > 0)
        {
            q = q + ", ";
            table.clusteringColumns.forEach(function (value, key)
            {
                q = q + '"' + key + '"';
                q = q + ",";
            });
            q = q.substring(0, q.length - 1);
            q = q + ")) ";
            q = q + "WITH CLUSTERING ORDER BY (";
            table.clusteringColumns.forEach(function (value, key)
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

    static buildDropTableQuery(table)
    {
        return 'DROP TABLE IF EXISTS "{{keyspace}}"."{{table}}";';
    }

    static buildInsertIndexQuery(field)
    {
        return "CREATE INDEX ON {{keyspace}}.{{table}} (" + field + ");";
    }

    static buildDropIndexQuery(index_name)
    {
        return 'DROP INDEX IF EXISTS "{{keyspace}}"."{{index_name}}";';
    }

    static getTimeUuid(s)
    {
        if (s)
        {
            if (typeof s === "string" && s.length > 0)
            {
                let isDate = Date.parse(s);
                if (isDate)
                {
                    s = TimeUuid.fromDate(s);
                }
                else
                {
                    s = TimeUuid.fromString(s);
                }
            }
            else if (typeof s === "object")
            {
                let isDate = Date.parse(s);
                if (isDate)
                {
                    s = TimeUuid.fromDate(s);
                }
            }
            else
            {
                throw new PersistenceError("Unexpected input to convert to TimeUuid " + typeof s);
            }
        }
        else
        {
            s = TimeUuid.now();
        }
        return s;
    }

    static json2CQLmap(json)
    {
        if (!json)
        {
            return null;
        }
        let _ = require("underscore");
        let map = {};
        for (var key in json)
        {
            if (json.hasOwnProperty(key))
            {
                if (!_.isString(json[key]))
                {
                    if (json[key])
                    {
                        map[key] = json[key].toString();
                    }
                    else
                    {
                        map[key] = json[key];
                    }
                }
                else
                {
                    map[key] = json[key].replace(/\"/g, "&quot;").replace(/\'/g, "&apos;");
                }
            }
        }
        return JSON.stringify(map, null, 0).replace(/\"/g, "\'").replace(/&quot;/g,
        '"').replace(/&apos;/g, "''");
    }

    static cqlStringStrip(s)
    {
        return s.replace(/\'/g, "''");
    }
};