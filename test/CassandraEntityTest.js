"use strict";
let assert = require("assert");
let BaseEAO = require("../lib/EntityManager");
let Foo = require("../examples/Foo");
let m =  require("..");
describe("cassandra-persistence", function ()
{
    describe("#CassandraEntity", function ()
    {
        it("should initiate CassandraEntity", function ()
        {
            let entity = new m.CassandraEntity();
            let S = Object.getOwnPropertySymbols(entity)[0];
            assert(entity instanceof m.CassandraEntity);
            assert(S.toString() === "Symbol(CassandraEntity)");
            assert(typeof entity.id === "string");
        });
        it("should initiate Foo", function ()
        {
            let foo = new Foo({
                name: "test",
                created: new Date(),
                entity: new m.CassandraEntity(),
                entities: [new m.CassandraEntity(), new m.CassandraEntity()]
            });
            assert(foo instanceof Foo);
            assert(typeof foo.id === "string");
            assert(foo.name === "test");
        });
    });
});