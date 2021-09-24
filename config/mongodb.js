const mongoose = require("mongoose");
const Mongoose = require('mongoose').Mongoose;

let mongoUrl = "mongodb+srv://thebankadmin:mavdut-diKwo9-gotfin@thebank.kftwa.mongodb.net/thebank?retryWrites=true&w=majority";

// DataBase Connection
var dataManager = new Mongoose({ useUnifiedTopology: true });
dataManager.connect(mongoUrl, { useNewUrlParser: true }).then(console.dir("Awesome Connection to TheBank DB")).catch(err=>console.error(err));

// Collection Objects
var db_coins = dataManager.model("tradingcoin", new mongoose.Schema({ strict: false }), "tradingcoin");
var db_signals = dataManager.model("signals", new mongoose.Schema({ strict: false }), "signals");
var db_orderBook = dataManager.model("orderbook", new mongoose.Schema({ strict: false }), "orderbook");

module.exports = { db_signals, db_orderBook, db_coins }