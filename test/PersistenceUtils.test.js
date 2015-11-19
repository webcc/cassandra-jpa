"use strict";

describe("cassandra-jpa::PersistenceUtils", function ()
{
    const assert = require("assert");
    const uuid = require('uuid');
    const m = require("..");
    describe("#toTimeUuid", function ()
    {
        let id;
        let cassandra = m.PersistenceUtils.getDriver();
        before(function ()
        {
            id = uuid.v1();
        });
        it("should convert from TimeUuid", function ()
        {
            assert(m.PersistenceUtils.toTimeUuid(id) instanceof cassandra.types.TimeUuid);
        });
        it("should convert from String of valid TimeUuid format", function ()
        {
            let idString = id.toString();
            assert(typeof idString === "string");
            assert(m.PersistenceUtils.toTimeUuid(idString) instanceof cassandra.types.TimeUuid);
        });
        it("should convert from Date", function ()
        {
            let idDate = new Date("12", "12", "12");
            assert(typeof idDate === "object" && idDate instanceof Date);
            assert(m.PersistenceUtils.toTimeUuid(idDate) instanceof cassandra.types.TimeUuid);
        });
        it("should throw RangeError when invalid String", function ()
        {
            let idString = "test";
            assert.throws(() =>
            {
                m.PersistenceUtils.toTimeUuid(idString)
            }, RangeError);
        });
        it("should throw RangeError when invalid object", function ()
        {
            let isNothingO = {};
            assert.throws(() =>
            {
                m.PersistenceUtils.toTimeUuid(isNothingO)
            }, RangeError);
        });
    });
    describe("#bindToJSON", function ()
    {
        let entity = {
            _id: "id",
            _name: "name",
            echo: function echo(s)
            {
                return s;
            }
        };
        it("should bind toJSON", function ()
        {
            let newEntity = m.PersistenceUtils.bindToJSON(entity);
            let o = JSON.parse(JSON.stringify(newEntity));
            assert(typeof newEntity.toJSON === "function");
            assert.equal(o.id, newEntity._id);
        });
    });
    describe("#isInstanceOf", function ()
    {
        it("should find instance of Class", function ()
        {
            class Foo {
                constructor(){
                    this.test = "tttt";
                }
            }
            let entity = new Foo();
            assert.equal(m.PersistenceUtils.isInstanceOf(entity, Foo), true);
        });
        it("should find instance of Entity Class", function ()
        {
            let entity = new m.tests.Foo();
            assert.equal(m.PersistenceUtils.isInstanceOf(entity, m.tests.Foo), true);
        });
        it("should find instance of FooFunc", function ()
        {
            let FooFunc = function(){
                this.test = "test";
            };
            let entity = new FooFunc();
            assert.equal(m.PersistenceUtils.isInstanceOf(entity, FooFunc), true);
        });

    });
});