"use strict";
let assert = require("assert");
let BaseEAO = require("../lib/BaseEAO");
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
    });
});