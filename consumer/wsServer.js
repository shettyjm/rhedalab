

const ws = require('ws')
const http = require('http')
const Parse = require('parse');

const fs = require('fs').promises;



const consumer = require("./consumer");

var url = require('url');


let wsClientConnetion;
// list of users
var CLIENTS = [];
var id = 1;
const requestListener = function (req, res) {

    console.log("a new http  request");

    var q = url.parse(req.url, true);

    console.log(q);

  
    if (q.pathname === '/testws') {

        const tempid = new Date();
        if (wsClientConnetion != undefined) {
            console.log("wsClientConnetion is not empty.. sending a web sokcet response")
            wsClientConnetion.send(JSON.stringify({ topic: 'handshake', data: 'testws invoked ' + tempid }));
        }
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(`{"message": "check for a handshake topic message in your ws socket client "+ ${tempid}}`);
    }else {


        fs.readFile(__dirname + "/test.html") .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        }).catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
    }
};


const server = http.createServer(requestListener);

const wss1 = new ws.Server({ noServer: true });

wss1.on('connection', function connection(ws, request, client) {

    id = Math.random();
    console.log('wesocket connection is established : ' + id);
    CLIENTS[id] = ws;
    CLIENTS.push(ws);

    ws.on('error', console.error);

    ws.on('close', function () {
        console.log('user ' + id + ' left chat');
        delete CLIENTS[id];
        consumer.clientsUpdate(CLIENTS);
    });

    wsClientConnetion = ws;
    ws.send(JSON.stringify({ topic: 'handshake', data: 'sdf487rgiuh7' }));

    console.log("consumer.clientsUpdate", consumer.clientsUpdate)
    consumer.clientsUpdate(CLIENTS);

    // ...
});


server.on('upgrade', function upgrade(request, socket, head) {
    var q = url.parse(request.url, true);

    console.log(q);

    if (q.pathname === '/foo') {

        consumer.kafkaconsumer().catch((err) => {
            console.error("error in consumer: ", err)
        })

        wss1.handleUpgrade(request, socket, head, function done(ws) {
            wss1.emit('connection', ws, request);
       });
    } 
    
    // else if (q.pathname === '/bar') {
    //     wss2.handleUpgrade(request, socket, head, function done(ws) {
    //         wss2.emit('connection', ws, request);
    //     });
    else {
        socket.destroy();
    }
});
const port = 3000
server.listen(port, () => {
    console.log(`webSocket Server app listening on port ${port}`)
});