"use strict";
let err = require("./errors");
let t = require("typly").instance();
let TimeUuid = require('cassandra-driver').types.TimeUuid;
module.exports = class PersistenceUtils {
    static toTimeUuid(value)
    {
        t.assertNotNull(value);
        if (t.isObject(value))
        {
            if (value instanceof TimeUuid)
            {
                return value;
            }
            if (t.isDate(value))
            {
                return TimeUuid.fromDate(value);
            }
            else
            {
                throw new RangeError("Invalid object");
            }
        }
        else if (t.isString(value))
        {
            if (t.isUUID(value))
            {
                return TimeUuid.fromString(value);
            }
            else
            {
                throw new RangeError("Invalid UUID format " + value);
            }
        }
        else
        {
            throw new TypeError("Invalid type");
        }
    }
    static removeUnderScore(entity, entityClass)
    {
        let obj = {};
        Object.keys(entity).map(key =>
        {
            if (key.charAt(0) === "_")
            {
                let newKey = key.substring(1);
                let property = entity[key];
                if (property == null)
                {
                    obj[newKey] = null;
                }
                else if (property instanceof entityClass)
                {
                    obj[newKey] = PersistenceUtils.removeUnderScore(property);
                }
                else if(Array.isArray(property))
                {
                    let arr = [];
                    for(let p in property)
                    {
                        arr.push(PersistenceUtils.removeUnderScore(p));
                    }
                    obj[newKey] = arr;
                }
                else
                {
                    obj[newKey] = entity[key];
                }
            }
            else
            {
                return entity;
            }
        });
        return obj;
    }
};