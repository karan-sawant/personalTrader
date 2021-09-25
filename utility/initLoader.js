const { loadOrderBook } = require("../services/fetchOrderBook");
const { startListner } = require("../services/listener");
const tracker = require("../services/tracker");

let loadInitData = async () => {
    tracker.binance.initBinance();
    await loadOrderBook();
    startListner();
}

module.exports = { loadInitData }