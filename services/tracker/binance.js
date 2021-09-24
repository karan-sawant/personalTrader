const WebSocket = require("ws");

let initBinance = () =>{
    __sockets.binance = new WebSocket("wss://stream.binance.com:9443/ws");

    let refreshStream = () => {
        __sockets.binance = new WebSocket("wss://stream.binance.com:9443/ws");
    }
    // Re-subscribing to the stream after 20 hours as the stream expires after 24 hours.
    setInterval(refreshStream, 72000000);

    __sockets.binance.on('message', function incoming(data) {
        data = JSON.parse(data);
        if(Array.isArray(data)){
            data.forEach(d=>{
                __tracker[d.s] = {"price": d.c, "bid": d.b, "ask": d.a};
            });
        }
    });
    __sockets.binance.on("open", function open(){
        __sockets.binance.send(JSON.stringify({
            "method": "SUBSCRIBE",
            "params":
            [
            "!ticker@arr"
            ],
            "id": new Date().getTime()
        }));
    })
}

module.exports = { initBinance }