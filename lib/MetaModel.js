"use strict";
let err = require("./errors");
let Entity = require("./Entity");
let DefaultRowInterceptor = require("./DefaultRowInterceptor");
let TimeUuid = require('cassandra-driver').types.TimeUuid;

module.exports = class MetaModel {
    constructor(config)
    {
        this.keySpace = config.keySpace || "tests";
        this.name = config.name || "base";
        this.fields = config.fields || new Map([["id", "timeuuid"]]);
        this.partitionKeys = config.partitionKeys || ["id"];
        this.clusteringColumns = config.clusteringColumns || new Map();
        this.secondaryIndexes = config.secondaryIndexes || [];
        this.entityClass = config.entityClass || Entity;
        this.rowInterceptor = config.rowInterceptor || new DefaultRowInterceptor();
    }

    fromRow(row)
    {
        if (row === "undefined" || row === null)
        {
            throw new TypeError("invalid row: " + typeof this.entityClass);
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
        if (entity instanceof this.entityClass === false)
        {
            throw new RangeError("row cannot be prepared, unexpected entity class: " + entity.constructor.name);
        }
        let entityClone = entity.clone();
        Object.keys(entityClone).forEach(propertyKey =>
        {
            let property = entityClone[propertyKey];
            if(this.fields.get(propertyKey.substring(1)))
            {
                let type = this.fields.get(propertyKey.substring(1));
                entityClone[propertyKey] = this.rowInterceptor.toRow(type, property, this.entityClass);
            }
        });
        return entityClone.toJSON();
    }

    isClusteringField(field)
    {
        return this.clusteringColumns.has(field);
    }

    isPrimaryField(field)
    {
        return this.partitionKeys.indexOf(field) > -1;
    }

    isRestricted(field)
    {
        return this.isClusteringField(field) || this.isPrimaryField(field);
    }

    // Setter and Getters
    get entityClass()
    {
        return this._entityClass;
    }

    set entityClass(value)
    {
        this._entityClass = value;
    }

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
