"use strict";
let CassandraEntity = require("..").CassandraEntity;
let m = require("../index.js");
let Foo = require("./Foo");
let PersistenceUtils = require("../lib/PersistenceUtils");
module.exports = class FooEAO extends m.BaseEAO {
    constructor(config)
    {
        super(config);
        this.table = {
            name: "foo",
            fields: new Map([["id", "timeuuid"], ["name", "text"], ["created", "timeuuid"],
                ["entity", "text"], ["entities", "list<text>"], ["simpleObjects", "list<text>"],
                ["enabled", "boolean"]]),
            partitionKeys: ["id"],
            clusteringColumns: new Map(),
            secondaryIndexes: []
        };
        this.table.clusteringColumns.set("name", "ASC");
        this.table.secondaryIndexes.push("name");
        this.entityClass = Foo;
    }

    persist(entity, callback)
    {
        let row = this.toRow(entity);
        return this.persistRow(row, callback);
    }
    update(entity, criteria, callback)
    {
        let row = this.toRow(entity);
        return this.updateRowByCriteria(row, criteria, callback);
    }
    persistAll(entities, callback)
    {
        let rows = entities.map((entity)=>{
            return this.toRow(entity);
        });
        return this.persistAllRows(rows, callback);
    }

    remove(criteria, callback)
    {
        return this.removeRows(criteria, callback);
    }

    findOne(criteria, callback)
    {
        return this.findOneRow(criteria, callback);
    }

    findAll(criteria, callback)
    {
        return this.findAllRows(criteria, callback);
    }

    toRow(entity, callback)
    {
        let row = super.toRow(entity);
        row.created = PersistenceUtils.getTimeUuid(row.created);
        return row;
    }

    fromRow(row)
    {
        let entity = super.fromRow(row);
        entity.entity = new CassandraEntity(JSON.parse(row.entity));
        entity.entities = [];
        if(row.entities)
        {
            row.entities.forEach(function (element, index, array)
            {
                let e = new CassandraEntity(JSON.parse(element));
                entity.entities.push(e);
            });
        }
        return entity;
    }
};