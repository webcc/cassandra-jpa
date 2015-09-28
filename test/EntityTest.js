"use strict";
let assert = require("assert");
let Foo = require("../examples/Foo");
let m =  require("..");
describe("cassandra-persistence", function ()
{
    describe("#Entity", function ()
    {
        it("should initiate Entity", function ()
        {
            let entity = new m.Entity();
            let S = Object.getOwnPropertySymbols(entity)[0];
            assert(entity instanceof m.Entity);
            assert(S.toString() === "Symbol(JPAEntity)");
            assert(typeof entity.id === "string");
        });
        it("should initiate Foo", function ()
        {
            let foo = new Foo({
                name: "test",
                created: new Date(),
                entity: new m.Entity(),
                entities: [new m.Entity(), new m.Entity()]
            });
            assert(foo instanceof Foo);
            assert(typeof foo.id === "string");
            assert(foo.name === "test");
        });
    });
});