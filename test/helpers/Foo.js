"use strict";
const Entity = require("../../lib/Entity");
module.exports = class Foo extends Entity {
    constructor(config)
    {
        super(config);
    }

    initDefaults()
    {
        super.initDefaults();
        this.name = "foo";
        this.created = new Date();
        this.entity = new Entity();
        this.entities = [];
        this.simpleObjects = ["a", "b"];
        this.myMap = new Map();
        this.myMap.set("test", 2);
        this.enabled = true;
    }

    set myMap(x)
    {
        if(Array.isArray(x))
        {
            this._myMap = new Map(x);
        }
        else
        {
            this._myMap = x;
        }
    }

    get myMap()
    {
        return this._myMap;
    }

    set simpleObjects(x)
    {
        this._simpleObjects = x;
    }

    get simpleObjects()
    {
        return this._simpleObjects;
    }

    set entities(x)
    {
        this._entities = x;
    }

    get entities()
    {
        return this._entities;
    }

    set entity(x)
    {
        this._entity = x;
    }

    get entity()
    {
        return this._entity;
    }

    set created(x)
    {
        this._created = x;
    }

    get created()
    {
        return this._created;
    }

    set name(x)
    {
        this._name = x;
    }

    get name()
    {
        return this._name;
    }

    set enabled(x)
    {
        this._enabled = x;
    }

    get enabled()
    {
        return this._enabled;
    }

    set obj(x)
    {
        this._obj = x;
    }

    get obj()
    {
        return this._obj;
    }
};