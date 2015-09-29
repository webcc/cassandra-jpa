"use strict";
let assert = require("assert");
let m = require("..");
describe("cassandra-persistence", function ()
{
    describe("#Criterion", function ()
    {
        it("should initiate Criterion", function ()
        {
            let criterion = new m.Criterion("name", "Foo");
            assert(criterion instanceof m.Criterion);
            assert.equal(criterion.key, "name");
            assert.equal(criterion.value, "Foo");
            assert.equal(criterion.type, m.CriterionType.EQUAL);
        });
        it("should initiate Criterion", function ()
        {
            assert.throws(() =>
            {
                let criterion = new m.Criterion("name", "Foo", "test");
            }, RangeError);
        });
    });
});