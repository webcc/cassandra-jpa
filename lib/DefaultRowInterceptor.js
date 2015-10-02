"use strict";
let typly = require("typly").instance();
let err = require("./errors");
let PersistenceUtils = require("./PersistenceUtils");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
module.exports = class DefaultRowInterceptor {
    constructor()
    {
        this.fieldTypes = new Map();
        this.fieldTypes.set("uuid", DefaultRowInterceptor.toUuid);
        this.fieldTypes.set("timeuuid", DefaultRowInterceptor.toUuid);
        this.fieldTypes.set("text", DefaultRowInterceptor.toText);
        this.fieldTypes.set("varchar", DefaultRowInterceptor.toText);
        this.fieldTypes.set("list<text>", DefaultRowInterceptor.toListText);
        this.fieldTypes.set("list<timeuuid>", DefaultRowInterceptor.toListTimeUuid);
        this.validate();
    }

    toRow(type, propertyValue, entityClass)
    {
        typly.assertString(type);
        typly.assertObject(entityClass);
        type = type.replace(/\s+/g, '').toLowerCase();
        let row = null;
        if (propertyValue === null)
        {
            return null;
        }
        if (this.fieldTypes.has(type))
        {
            let func = this.fieldTypes.get(type);
            if (typeof func === "function")
            {
                //TODO: improve: parse complex types and pass extra param
                row = func.call(this, propertyValue, entityClass);
            }
        }
        else
        {
            row = propertyValue;
        }
        return row;
    }

    static toListTimeUuid(propertyValue, entityClass)
    {
        if (Array.isArray(propertyValue))
        {
            let properties = [];
            propertyValue.forEach((pro) =>
            {
                properties.push(DefaultRowInterceptor.toUuid(pro, entityClass));
            });
            return properties;
        }
    }

    static toListText(propertyValue)
    {
        let properties = [];
        if (Array.isArray(propertyValue))
        {
            propertyValue.forEach((pro) =>
            {
                if (typeof pro === "object")
                {
                    properties.push(JSON.stringify(pro));
                }
                else
                {
                    properties.push(pro);
                }
            });
        }
        return properties;
    }

    static toUuid(propertyValue)
    {
        return PersistenceUtils.toTimeUuid(propertyValue);
    }

    static toText(propertyValue, entityClass)
    {
        if (typeof propertyValue === "object")
        {
            return JSON.stringify(propertyValue);
        }
        else
        {
            return propertyValue;
        }
    }

    validate()
    {
        this.fieldTypes.forEach((value, key, map) =>
        {
            if (typeof key !== "string" || typeof value !== "function")
            {
                throw new TypeError("Invalid Cassandra JPA interceptors for " + key);
            }
        });
    }
};