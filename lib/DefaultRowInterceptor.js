"use strict";

const typly = require("typly");
const err = require("./JPAErrors");
const PersistenceUtils = require("./PersistenceUtils");

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
        this.fieldTypes.set("map<text,text>", DefaultRowInterceptor.toMapText);
        this.validate();
    }

    toRow(type, propertyValue, entityClass)
    {
        typly.assertString(type);
        if(entityClass){
            typly.assertObject(entityClass);
        }
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
        return propertyValue;
    }

    static toMapText(propertyValue, entityClass)
    {
        let newMap = new Map();
        propertyValue.forEach((value, key, map)=>
        {
            newMap.set(key, JSON.stringify(value));
        });
        return newMap;
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
        return PersistenceUtils.toTimeUuid(propertyValue).toString();
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