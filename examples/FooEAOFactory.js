"use strict";
let BaseEAOFactory = require("..").BaseEAOFactory;
let FooEAO = require('./FooEAO');
module.exports = class FooEAOFactory extends BaseEAOFactory
{
    constructor(config)
    {
        super(config);
        this.eao.fooEAO = this.getFooEAO();
    }
 
    getAllEAO()
    {
        return this.eao;
    }

    getFooEAO()
    {
        if (!this.eao.fooEAO)
        {
            this.eao.fooEAO = new FooEAO(this.config);
        }
        return this.eao.fooEAO;
    }
};
