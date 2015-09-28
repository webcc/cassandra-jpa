"use strict";
let winston = require('winston');
let logger = module.exports = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: 'all'
        })
    ]
});