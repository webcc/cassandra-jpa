"use strict";
// see https://docs.oracle.com/javaee/6/api/javax/persistence/criteria/CriteriaQuery.html
module.exports = class CriteriaQuery {
    constructor(metaModel)
    {
        this.metaModel = metaModel;
    }

    static createQuery(metaModel)
    {
        this.metaModel = metaModel;
        return new CriteriaQuery(metaModel);
    }

    getFullTableName()
    {
        return "\"" + this.metaModel.keySpace + "\".\"" + this.metaModel.name + "\"";
    }

    from(q, filtering)
    {
        q = q || "";
        if (typeof filtering !== "undefined" && filtering === false)
        {
            return "SELECT * FROM " + this.getFullTableName() + " " + q + ";";
        }
        else
        {
            return "SELECT * FROM " + this.getFullTableName() + " " + q + " ALLOW FILTERING;";
        }
    }

    where(q)
    {
        return " WHERE " + q;
    }

    truncate()
    {
        return "TRUNCATE " + this.getFullTableName() + ";";
    }

    update(row, criteriaQuery)
    {
        let params = [];
        let pairsQ = "";
        let propertiesCount = Object.getOwnPropertyNames(row).length - this.metaModel.getRestrictedFields().length;
        let count = 0;
        for (let key of this.metaModel.fields.keys())
        {
            if (row.hasOwnProperty(key) && !this.metaModel.isRestricted(key))
            {
                if (count>0)
                {
                    pairsQ = pairsQ + ", ";
                }
                count++;
                var value = row[key];
                params.push(value);
                pairsQ = pairsQ + "\"" + key + "\"" + "=? ";
            }
        }
        return {
            query: "UPDATE " + this.getFullTableName() + " SET " + pairsQ  + criteriaQuery + ";",
            params: params
        };
    }

    remove(criteriaQuery)
    {
        return {
            query: "DELETE FROM  " + this.getFullTableName() + criteriaQuery + ";",
            params: []
        };
    }

    insert(row)
    {
        let params = [];
        let keys = [];
        let qq = [];
        for (let key of this.metaModel.fields.keys())
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
            query: "INSERT INTO " + this.getFullTableName()  + paramsKeys + " VALUES " + paramsQ + " IF NOT EXISTS;",
            params: params
        };
        return (queryObject);
    }

    create()
    {
        let q = "CREATE TABLE IF NOT EXISTS " + this.getFullTableName() + " ( ";
        this.metaModel.fields.forEach(function (value, key)
        {
            q = q + '"' + key + '"' + " " + value + ", ";
        });
        q = q + "PRIMARY KEY ((";
        if (this.metaModel.partitionKeys.length > 0)
        {
            this.metaModel.partitionKeys.forEach(function (item, index, array)
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
        if (this.metaModel.clusteringColumns.size > 0)
        {
            q = q + ", ";
            this.metaModel.clusteringColumns.forEach(function (value, key)
            {
                q = q + '"' + key + '"';
                q = q + ",";
            });
            q = q.substring(0, q.length - 1);
            q = q + ")) ";
            q = q + "WITH CLUSTERING ORDER BY (";
            this.metaModel.clusteringColumns.forEach(function (value, key)
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

    drop()
    {
        return "DROP TABLE IF EXISTS " + this.getFullTableName() + ";";
    }

    insertIndex(field)
    {
        return "CREATE INDEX ON " + this.getFullTableName() + "(" + field + ");";
    }

    dropIndex(indexName)
    {
        return "DROP INDEX IF EXISTS \"" + this.metaModel.keySpace + "\".\"" + indexName + "\";";
    }
};