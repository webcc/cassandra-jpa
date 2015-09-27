let util = require('util');
/** @module errors */
/**
 * Base JPAError
 * @private
 */
function JPAError(message, constructor)
{
    if (constructor)
    {
        this.name = constructor.name;
        this.stack = (new Error(message)).stack;
    }
    this.message = message || 'Error';
    this.info = 'JPA Error';
}
util.inherits(JPAError, Error);
function JPAInitError(message, constructor)
{
    if (constructor)
    {
        this.name = constructor.name;
        this.stack = (new Error(message)).stack;
    }
    this.message = message || 'Error';
    this.info = 'JPA Init Error';
}
util.inherits(JPAInitError, JPAError);
function JPARuntimeError(message, constructor)
{
    if (constructor)
    {
        this.name = constructor.name;
        this.stack = (new Error(message)).stack;
    }
    this.message = message || 'Error';
    this.info = 'JPA Runtime Error';
}
util.inherits(JPARuntimeError, JPAError);
exports.JPAError = JPAError;
exports.JPAInitError = JPAInitError;
exports.JPARuntimeError = JPARuntimeError;