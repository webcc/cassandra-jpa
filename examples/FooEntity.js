"use strict";
let CassandraEntity = require("..").CassandraEntity;
module.exports = class Foo extends CassandraEntity {
    constructor(config)
    {
        super(config);
    }

    initDefaults()
    {
        super.initDefaults();
        this.name = "foo";
        this.created = new Date();
        this.entity = new CassandraEntity();
        this.entities = [];
        this.simpleObjects = ["a", "b"];
        this.enabled = true;
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