

const ws = require('ws')
const http = require('http')
const Parse = require('parse');
const fs = require('fs').promises;

const edaproducer = require("./producer");
var url = require('url');


const requestListener = function (req, res) {

    console.log("a new http  request");

    var q = url.parse(req.url, true);

    console.log(q);

    
      res.setHeader("Content-Type", "application/json");
        
       res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
      res.setHeader('Access-Control-Max-Age', 2592000); // 30 days
    if (q.pathname === '/testproducerep') {

        const tempid = new Date();
        
        res.writeHead(200);
        res.end(`{"message": "check for a handshake topic message in your ws socket client "+ ${tempid}}`);
    } else if (q.pathname === '/produce') {

        console.log("request to generate more events");
        edaproducer("hello").catch((err) => {
            console.error("error in producer: ", err)
        })
        res.writeHead(200);
        const message = "Requested to produce sample messages on "+process.env.KAFKA_TOPIC + " topic";
        res.end(`{"message": "${message}" }`);
    } else {

        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(`{"message": "try /produce to generate 25 messages toyour kafak topic"}`);
    }
};


const server = http.createServer(requestListener);

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`webSocket Server app listening on port ${port}`)
});