const { db_orderBook } = require("../config/mongodb");

let loadOrderBook = async () => {
    let orderBooks = await db_orderBook.find({}).select("-_id").exec();
    orderBooks.forEach(ob=>{
        ob = ob.toObject();
        __orderBook[ob.exchange] = ob.data;
    });
    if(!("binance" in __orderBook)){
        __orderBook.binance = {};
    }
    console.log(__orderBook.binance)
}

module.exports = { loadOrderBook }