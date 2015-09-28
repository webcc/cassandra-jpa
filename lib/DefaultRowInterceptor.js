"use strict";
let err = require("./errors");
let TimeUuid = require('cassandra-driver').types.TimeUuid;
module.exports = class DefaultRowInterceptor {
    constructor()
    {
        this.fieldTypes = new Map();
        this.fieldTypes.set("uuid", DefaultRowInterceptor.toUuid);
        this.fieldTypes.set("timeuuid", DefaultRowInterceptor.toUuid);
        this.fieldTypes.set("text", DefaultRowInterceptor.toText);
        this.fieldTypes.set("varchar", DefaultRowInterceptor.toText);
        this.fieldTypes.set("map<text,bigint>", DefaultRowInterceptor.toMapText);
        this.fieldTypes.set("list<text>", DefaultRowInterceptor.toListText);
        this.fieldTypes.set("list<timeuuid>", DefaultRowInterceptor.toListTimeUuid);
        this.validate();
    }

    toRow(type, propertyValue, entityClass)
    {
        type = type.replace(/\s+/g, '').toLowerCase();
        let row = null;
        if (propertyValue === null)
        {
            return null;
        }
        // if(typeof type === "undefined" || type === null )
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

    static toMapText(propertyValue, entityClass)
    {
        let row = new Map();
        if (propertyValue instanceof Map === false)
        {
            throw new TypeError("Expecting Map type");
        }
        propertyValue.forEach((value, key, map) =>
        {
            if (typeof value === "object" && value instanceof entityClass)
            {
                row.set(key, JSON.stringify(value));
            }
            else
            {
                row.set(key, value);
            }
        });
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

    static toListText(propertyValue, entityClass)
    {
        if (Array.isArray(propertyValue))
        {
            let properties = [];
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
            return properties;
        }
    }

    static toUuid(propertyValue)
    {
        if (typeof propertyValue == "object")
        {
            if (propertyValue instanceof Date)
            {
                return TimeUuid.fromDate(propertyValue);
            }
            else if (typeof propertyValue === "string" && propertyValue.length > 0)
            {
                let isDate = Date.parse(s);
                if (isDate)
                {
                    propertyValue = TimeUuid.fromDate(propertyValue);
                }
                else
                {
                    propertyValue = TimeUuid.fromString(propertyValue);
                }
            }
            else if (typeof propertyValue === "object")
            {
                let isDate = Date.parse(propertyValue);
                if (isDate)
                {
                    propertyValue = TimeUuid.fromDate(s);
                }
            }
        }
        else if (typeof propertyValue === "string")
        {
            return TimeUuid.fromString(propertyValue);
        }
        else
        {
            throw new TypeError("Invalid property type");
        }
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

