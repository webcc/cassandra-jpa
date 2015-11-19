"use strict";
let _ = require("underscore");
let err = require("./errors");
let Entity = require("./Entity");
let DefaultRowInterceptor = require("./DefaultRowInterceptor");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
let PersistenceUtils = require("./PersistenceUtils");
module.exports = class MetaModel {
    constructor(jpaConfig)
    {
        this.name = "base";
        this.fields = new Map([["id", "timeuuid"]]);
        this.partitionKeys = ["id"];
        this.clusteringColumns = new Map();
        this.secondaryIndexes = [];
        this.entityClass = null;
        this.rowInterceptor = new DefaultRowInterceptor();
        this.ttl = undefined;
        this.jpaConfig = jpaConfig;
        this.keySpace = this.jpaConfig.keySpace;
        if (typeof this.jpaConfig.ttl !== "undefined")
        {
            this.ttl = jpaConfig.ttl;
        }
        this.extraParams = new Map();
    }

    fromRow(row)
    {
        let entity = null;
        if (row === "undefined" || row === null)
        {
            throw new TypeError("invalid row: " + typeof this.entityClass);
        }
        Object.keys(row).forEach(key =>
        {
            let fieldType = this.fields.get(key);
            row[key] = this.rowInterceptor.toRow(fieldType, row[key], this.entityClass);
        });
        if(this.entityClass){
            entity = new this.entityClass(row);
            if(this.extraParams && this.extraParams instanceof Map)
            {
                this.extraParams.forEach((value, key, map) => {
                    if(row.hasOwnProperty(key)){
                        this.extraParams.set(key, row[key]);
                    }
                });
            }
        }
        else{
            entity = _.clone(row);
        }
        return entity;
    }

    toRow(entity)
    {
        let row = null;
        if (entity == undefined || entity === null || typeof entity !== "object")
        {
            throw new TypeError("entity row cannot be prepared, unexpected entity type: " + typeof entity);
        }
        if(this.entityClass)
        {
            if (PersistenceUtils.isImplementationOf(entity, this.entityClass)  === false)
            {
                throw new RangeError("row cannot be prepared, unexpected entity class: " + entity.constructor.name);
            }
            let entityClone = entity.clone();
            Object.keys(entityClone).forEach(propertyKey =>
            {
                let property = entityClone[propertyKey];
                if (this.fields.get(propertyKey.substring(1)))
                {
                    let type = this.fields.get(propertyKey.substring(1));
                    entityClone[propertyKey] = this.rowInterceptor.toRow(type, property, this.entityClass);
                }
            });
            row = PersistenceUtils.removeUnderScore(entityClone, this.entityClass);
            if(this.extraParams && this.extraParams instanceof Map)
            {
                this.extraParams.forEach((value, key, map) => {
                    row[key] = this.extraParams.get(key);
                });
            }
        }
        else{
            row = _.clone(entity);
        }
        return row;
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

    getRestrictedFields()
    {
        return _.union(this.partitionKeys, this.clusteringColumns.keys());
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
