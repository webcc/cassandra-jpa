"use strict";
let uuid = require('uuid');
let PersistenceUtils = require("./PersistenceUtils");

module.exports = class Entity {
    constructor(config)
    {
        this.initDefaults();
        this.init(config);
    }

    initDefaults()
    {
        this._id = uuid.v1();
    }


    set id(value)
    {

        if (typeof value !== "string")
        {
            throw new TypeError("Invalid id type " + value);
        }
        this._id = value;
    }

    get id()
    {
        return this._id;
    }

    toJSON()
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
                else if (PersistenceUtils.isImplementationOf(property, Entity))
                {
                    obj[newKey] = property;
                }
                else if(property instanceof Map)
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
        });
        return obj;
    }

    clone()
    {
        return new this.constructor(this);
    }

    init(config)
    {
        if (typeof config === "object" && config !== null)
        {
            Object.keys(this).forEach(key =>
            {
                key = key.substring(1);
                let configProperty = config[key];
                if (typeof configProperty !== "undefined" && configProperty !== null)
                {
                    this[key] = configProperty;
                }
            });
        }
    }
};