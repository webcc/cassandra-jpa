"use strict";

describe("cassandra-jpa::Entity", function ()
{
    const assert = require("assert");
    const m = require("..");
    it("should initiate Entity", function ()
    {
        let entity = new m.Entity();
        assert(entity instanceof m.Entity);
        assert(typeof entity.id === "string");
    });
    it("should initiate Foo", function ()
    {
        let foo = new m.tests.Foo({
            name: "test",
            created: new Date(),
            entity: new m.Entity(),
            entities: [new m.Entity(), new m.Entity()]
        });
        assert(foo instanceof m.tests.Foo);
        assert(typeof foo.id === "string");
        assert(foo.name === "test");
    });
});