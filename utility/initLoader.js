const { loadOrderBook } = require("../services/fetchOrderBook");
const { startListner } = require("../services/listener");

let loadInitData = async () => {
    await loadOrderBook();
    startListner();
}

module.exports = { loadInitData }