"use strict";

const err = require("./JPAErrors");
const typly = require("typly");
const driver = require('cassandra-driver');
const TimeUuid = driver.types.TimeUuid;

module.exports = class PersistenceUtils {

    static getDriver(){
        return driver;
    }

    static toTimeUuid(value)
    {
        typly.assertNotNull(value);
        if (typly.isObject(value))
        {
            if (PersistenceUtils.isInstanceOf(value, TimeUuid) )
            {
                return value;
            }
            if (typly.isDate(value))
            {
                return TimeUuid.fromDate(value);
            }
            else
            {
                throw new RangeError("Invalid object");
            }
        }
        else if (typly.isString(value))
        {
            if (typly.isUUID(value))
            {
                return TimeUuid.fromString(value);
            }
            else if (typly.isDateString(value) )
            {
                return TimeUuid.fromDate(new Date(value));
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

    static clone(entity)
    {
        return new entity.constructor(entity);
    }

    static bindToJSON(entity)
    {
        if (entity.toJSON !== "function")
        {
            entity.toJSON = function toJSON()
            {
                let obj = {};
                Object.keys(this).map(key =>
                {
                    if (key.charAt(0) === "_")
                    {
                        let newKey = key.substring(1);
                        let property = this[key];
                        if (property == null)
                        {
                            obj[newKey] = null;
                        }
                        else if (typeof property === "object")
                        {
                            obj[newKey] = property;
                        }
                        else if (property instanceof Map)
                        {
                            let arr = [];
                            for (let pair of property)
                            {
                                let o = [pair[0], pair[1]];
                                arr.push(o);
                            }
                            obj[newKey] = arr;
                        }
                        else if (Array.isArray(property))
                        {
                            obj[newKey] = this[key];
                        }
                        else if (property[Symbol.iterator] && typeof property === "object")
                        {
                            throw new RangeError("Unknown collection to toJSON for " + property);
                        }
                        else
                        {
                            obj[newKey] = this[key];
                        }
                    }
                    else
                    {
                        obj[key] = this[key];
                    }
                });
                return obj;
            };
        }
        return entity;
    }

    static removeUnderScore(entity)
    {
        let obj = Object.assign({}, entity);
        Object.keys(entity).map(key =>
        {
            if (key.charAt(0) === "_")
            {
                let newKey = key.substring(1);
                obj[newKey] = obj[key];
                delete obj[key];
            }
        });
        return obj;
    }

    static isInstanceOf(_object, _class)
    {
        if (typeof _object !== "object" || _object == undefined || _object === null)
        {
            throw TypeError("Not valid input for isInstanceOf");
        }
        //let hasInstance = _object[Symbol.hasInstance];

        let isImplementation = true;
        let targetPrototype = _class.prototype;
        if (_class.constructor)
        {
            targetPrototype = new _class();
        }
        let propNames = Object.getOwnPropertyNames(targetPrototype);
        if(propNames.length !== Object.getOwnPropertyNames(_object).length)
        {
            return false;
        }
        propNames.forEach(function (propName, idx, array)
        {
            if (!_object.hasOwnProperty(propName))
            {
                return false;
            }
        });
        return true;
    }
};