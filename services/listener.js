const { db_signals } = require("../config/mongodb");
const tradingCoins = require("../config/tradingCoins");
const trader = require("./trader");

let startListner = async () => {
    const pipeline = [];
    const changeStream = db_signals.watch(pipeline, {fullDocument : "updateLookup"});
    changeStream.on('change', (change) => {
        const data = change.fullDocument;
        if(data.coin in tradingCoins.binance) trader.binance.placeOrder(data);
    });
}

setTimeout(()=>{trader.binance.placeOrder({coin: "cardano", text: "Buy"})}, 10000)
module.exports = { startListner }