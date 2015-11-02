"use strict";
// see https://docs.oracle.com/javaee/6/api/javax/persistence/criteria/CriteriaQuery.html
module.exports = class CriteriaQuery {
    constructor(metaModel)
    {
        this.metaModel = metaModel;
    }

    static createQuery(metaModel)
    {
        return new CriteriaQuery(metaModel);
    }

    getFullTableName()
    {
        return "\"" + this.metaModel.keySpace + "\".\"" + this.metaModel.name + "\"";
    }

    from(q)
    {
        q = q || "";
        return "SELECT * FROM " + this.getFullTableName() + " " + q + ";";
    }

    where(q, limit, orderBy, allowFiltering)
    {
        let limitQ = "";
        let orderByQ = "";
        let allowFilteringQ = " ";
        if(typeof limit !== "undefined" && isNaN(limit))
        {
            //LIMIT n
            limitQ = " LIMIT " + limit + " ";
        }
        if(typeof orderBy !== "undefined")
        {
            //ORDER BY ( clustering_column ( ASC | DESC )...)
            orderByQ = "ORDER BY "
        }
        if(typeof allowFiltering !== "undefined" && allowFiltering === true)
        {
            //ALLOW FILTERING
            allowFilteringQ = " ALLOW FILTERING ";
        }
        return " WHERE " + q + orderByQ + limitQ + allowFilteringQ;
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
        let ttlQ = "";
        if(this.metaModel.ttl){
            ttlQ = " USING TTL " + this.metaModel.ttl + " ";
        }
        return {
            query: "UPDATE " + this.getFullTableName() + ttlQ + " SET " + pairsQ  + criteriaQuery + ";",
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
        let ttlQ = "";
        if(this.metaModel.ttl){
            ttlQ = " USING TTL " + this.metaModel.ttl + " ";
        }
        let queryObject = {
            query: "INSERT INTO " + this.getFullTableName()  + paramsKeys + " VALUES " + paramsQ + " IF NOT EXISTS " + ttlQ + ";",
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
        return 'CREATE INDEX ON ' + this.getFullTableName() + '("' + field + '");';
    }

    dropIndex(indexName)
    {
        return "DROP INDEX IF EXISTS \"" + this.metaModel.keySpace + "\".\"" + indexName + "\";";
    }
};