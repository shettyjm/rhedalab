const { Kafka,logLevel } = require('kafkajs')
const config = require('./config')
const messages = require('./input.json')
const fruits = messages.fruits;
const client = new Kafka({
  brokers: [process.env.KAFKA_BROKER] || config.kafka.BROKERS,
  clientId: config.kafka.CLIENTID,
  logLevel: logLevel.INFO
})

const topic = process.env.KAFKA_TOPIC || config.kafka.TOPIC

const producer = client.producer()

let i = 0

let counter = 0;

let eventLimit = process.env.eventlimit || 25 ;

console.log(" maximum event will be produced",eventLimit )

const sendMessage = async () => {

  console.log("producer send messages requested")
  await producer.connect()
  console.log("producer connected to the broker")
  
  var refreshId = setInterval(function() {


    
    if(counter >= eventLimit ){

      counter = 0 ;
      console.log("stopping current event gen run")
      clearInterval(refreshId);
    } else {

      console.log("run count",counter);
    }
    i = i >= fruits.length - 1 ? 0 : i + 1 ;
    counter++ ;
    const randmQty =  Math.floor(Math.random() * (99) + 1);
    
    fruits[i].qty = fruits[i].qty + randmQty;

    console.log("new qty --> fruits[i].qty  ", fruits[i].qty )

    payloads = {
      topic: topic,
      messages: [
        { key: 'fruit-alert', value: JSON.stringify(fruits[i]) }
      ]
    }
    console.log('payloads=', payloads, 'produced to the topic',topic)
    producer.send(payloads).then(console.log)
    .catch(e => console.error(`[example/producer] ${e.message}`, e))
   
  },1000)
}



module.exports = sendMessage;