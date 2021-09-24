const { loadInitData } = require("./utility/initLoader");

global.__sockets = {};
global.__tracker = {};
global.__orderBook = {};
loadInitData();