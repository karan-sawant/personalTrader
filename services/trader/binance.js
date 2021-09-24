const { default: axios } = require("axios");
const createHmac = require('crypto').createHmac;
const keys = require("../../config/keys");
const { db_orderBook } = require("../../config/mongodb");
const { config } = require("../../config/request");
const tradingCoins = require("../../config/tradingCoins");

let walletBallance = async (symbol="", side="") => {
    try {
        let _config = {...config};
        _config.method = "GET";
        _config.headers["Content-Type"]="application/json";
        _config.headers["X-MBX-APIKEY"]=keys.live.binance.api;
        let data = `timestamp=${new Date().getTime()}`;
        let signature = createHmac("sha256", keys.live.binance.secret).update(data).digest("hex");
        _config.url = `https://api.binance.com/api/v3/account?${data}&signature=${signature}`;
        let r = await axios.request(_config);
        r.data.balances.forEach(b=>{
            if(parseFloat(b.free) > 0) console.log(b);
        });
    } catch (error) {
        console.log(error)
    }
}

let cancelOrder = async symbol => {
    try {
        let _config = {...config};
        _config.method = "DELETE";
        _config.headers["Content-Type"]="application/json";
        _config.headers["X-MBX-APIKEY"]=keys.live.binance.api;
        let data = `symbol=${symbol}&timestamp=${new Date().getTime()}`;
        let signature = createHmac("sha256", keys.live.binance.secret).update(data).digest("hex");
        _config.url = `https://api.binance.com/api/v3/openOrders?${data}&signature=${signature}`;
        await axios.request(_config);
    } catch (error) {
        
    }
}

let executeOrder = async (symbol, side, type, timeInForce, quantity, price) => {
    try {
        let _config = {...config};
        _config.headers["Content-Type"]="application/json";
        _config.headers["X-MBX-APIKEY"]=keys.live.binance.api;
        let data = `symbol=${symbol}&side=${side}&type=${type}&timeInForce=${timeInForce}&quantity=${quantity}&price=${price}&timestamp=${new Date().getTime()}`; //&stopPrice=${stopPrice}
        let signature = HmacSHA256(data, keys.live.binance.secret);
        _config.url = `https://api.binance.com/api/v3/order/test?${data}&signature=${signature}`;
        let r = await axios.request(_config);
        return r.data;
    } catch (error) {
        
    }
}

let buyOrder = async coin =>{
    try {
        let _id = tradingCoins.binance[coin].id;
        let price = __tracker[_id].price > __tracker[_id].ask ? __tracker[_id].ask : __tracker[_id].price;
        let price_s = price.toString();
        let stop_price = parseFloat((price*0.99).toFixed(price_s.length - price_s.indexOf(".") -1));
        stop_price = price + 0.00100000;
        if(coin in __orderBook.binance){
            // Check the previous order.
            let quantity = Math.floor(__orderBook.binance[coin].total/price  );
            if(__orderBook.binance[coin].trade == "Sell"){
                // Only place a buy order if the previous trade is the Sell trade.
                // let execu = executeOrder(_id, "BUY", "LIMIT", "GTC", quantity, price, stop_price);
                __orderBook.binance[coin].quantity = quantity;
                __orderBook.binance[coin].trade = "Buy";
                __orderBook.binance[coin].total = __orderBook.binance[coin].total - (quantity*price) - (quantity*price*0.001);
                let update = {data: __orderBook.binance};
                update.data[coin] = {trade: "Buy", quantity: quantity, total: __orderBook.binance[coin].total}
                db_orderBook.updateOne({exchange: "binance"}, {$set: update}, {upsert: true, strict: false}).exec();
            }
        }else{
            let quantity = Math.floor(1000/price);
            // Execute the latest order.
            // let execu = executeOrder(_id, "BUY", "LIMIT", "GTC", quantity, price);
            __orderBook.binance[coin] = {};
            __orderBook.binance[coin].quantity = quantity;
            __orderBook.binance[coin].trade = "Buy";
            __orderBook.binance[coin].total = 1000-(quantity*price) - (quantity*price*0.001);
            let update = {data: __orderBook.binance};
            update.data[coin] = {trade: "Buy", quantity: quantity, total: __orderBook.binance[coin].total}
            db_orderBook.updateOne({exchange: "binance"}, {$set: update}, {upsert: true, strict: false}).exec();
        }
    } catch (error) {
        
    }
}

let sellOrder = async coin =>{
    try {
        let _id = tradingCoins.binance[coin].id;
        let price = __tracker[_id].price > __tracker[_id].ask ? __tracker[_id].ask : __tracker[_id].price;
        let stop_price = price*0.99;
        if(coin in __orderBook.binance){
            // Check the previous order.
            let quantity = __orderBook.binance[coin].quantity;
            if(__orderBook.binance[coin].trade == "Buy"){
                // Only place a buy order if the previous trade is the Buy trade.
                // let execu = executeOrder(_id, "SELL", "STOP_LOSS_LIMIT", "GTC", quantity, price);
                __orderBook.binance[coin].total += quantity*price - (quantity*price*0.001);
                let update = {data: __orderBook.binance};
                update.data[coin] = {trade: "Sell", total: __orderBook.binance[coin].total}
                db_orderBook.updateOne({exchange: "binance"}, {$set: update}, {upsert: true, strict: false}).exec();
            }
        }
    } catch (error) {
        
    }
}

let placeOrder = async data => {
    if(Object.keys(tradingCoins.binance).includes(data.coin)){
        // await cancelOrder(tradingCoins.binance[data.coin].id);
        // await walletBallance(tradingCoins.binance[data.coin].id, data.text);
        if(data.text=="Buy") buyOrder(data.coin);
        if(data.text=="Sell") sellOrder(data.coin);
    }
}

module.exports = { placeOrder, walletBallance }