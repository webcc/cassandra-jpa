"use strict";
let err = require("./errors");
module.exports = class QueryBuilder {
    constructor()
    {
    }

    static parameterizeQuery(metaModel, query, stringTemplateValues)
    {
        return S(query).template(_.extend(metaModel, stringTemplateValues)).s;
    }

    static buildTruncateTableQuery(metaModel)
    {
        return "TRUNCATE \"" + metaModel.keySpace + "\".\"" + metaModel.name + "\";";
    }

    static buildUpdateQueryByCriteria(row, metaModel, criteria)
    {
        let subQ = QueryBuilder.buildWhereSubQueryFromCriteria(metaModel, criteria);
        let params = [];
        let pairsQ = "";
        let propertiesCount = Object.getOwnPropertyNames(row).length - criteria.size;
        let count = 0;
        for (let key of metaModel.fields.keys())
        {
            if (row.hasOwnProperty(key) && !criteria.has(key) && !metaModel.isRestricted(key))
            {
                var value = metaModel.fields[key];
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
            query: "UPDATE \"" + metaModel.keySpace + "\".\"" + metaModel.name + "\" SET " + pairsQ + " WHERE " + subQ + ";",
            params: params
        };
    }

    static buildRemoveQuery(metaModel, criteria)
    {
        let subQ = QueryBuilder.buildWhereSubQueryFromCriteria(metaModel, criteria);
        let params = [];
        criteria.forEach((value, key, map) =>
        {
            params.push(value);
        });
        return {
            query: "DELETE FROM  \"" + metaModel.keySpace + "\".\"" + metaModel.name + "\" WHERE " + subQ + ";",
            params: params
        };
    }

    static buildInsertQueryObject(row, metaModel)
    {
        let params = [];
        let keys = [];
        let qq = [];
        for (let key of metaModel.fields.keys())
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
            query: "INSERT INTO \"" + metaModel.keySpace + "\".\"" + metaModel.name + "\"" + paramsKeys + " VALUES " + paramsQ + " IF NOT EXISTS;",
            params: params
        };
        return (queryObject);
    }

    static buildSelectQueryObjectFromCriteria(metaModel, criteria)
    {
        let subQ = QueryBuilder.buildWhereSubQueryFromCriteria(metaModel, criteria);
        let params = [];
        criteria.forEach(function (value, key, map)
        {
            params.push(value);
        });
        return {
            query: "SELECT * FROM \"" + metaModel.keySpace + "\".\"" + metaModel.name + "\" WHERE " + subQ + " ALLOW FILTERING;",
            params: params
        };
    }

    static buildWhereSubQueryFromCriteria(metaModel, criteria)
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

    static buildCreateTableQuery(metaModel)
    {
        let q = "CREATE TABLE IF NOT EXISTS \"" + metaModel.keySpace + "\".\"" + metaModel.name + "\" ( ";
        metaModel.fields.forEach(function (value, key)
        {
            q = q + '"' + key + '"' + " " + value + ", ";
        });
        q = q + "PRIMARY KEY ((";
        if (metaModel.partitionKeys.length > 0)
        {
            metaModel.partitionKeys.forEach(function (item, index, array)
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
        if (metaModel.clusteringColumns.size > 0)
        {
            q = q + ", ";
            metaModel.clusteringColumns.forEach(function (value, key)
            {
                q = q + '"' + key + '"';
                q = q + ",";
            });
            q = q.substring(0, q.length - 1);
            q = q + ")) ";
            q = q + "WITH CLUSTERING ORDER BY (";
            metaModel.clusteringColumns.forEach(function (value, key)
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

    static buildDropTableQuery(metaModel)
    {
        return "DROP TABLE IF EXISTS \"" + metaModel.keySpace + "\".\"" + metaModel.name + "\"";
    }

    static buildInsertIndexQuery(metaModel, field)
    {
        return "CREATE INDEX ON \"" + metaModel.keySpace + "\".\"" + metaModel.name + "\"(" + field + ");";
    }

    static buildDropIndexQuery(metaModel, indexName)
    {
        return "DROP INDEX IF EXISTS \"" + metaModel.keySpace + "\".\"" + indexName + "\";";
    }
};