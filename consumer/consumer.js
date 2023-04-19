const { Kafka, logLevel } = require('kafkajs')
const config = require('./config')

var CLIENTS = [];
const kafka = new Kafka({
  logLevel: logLevel.INFO,
  clientId: process.env.KAFKA_CLIENT_ID || config.kafka.CLIENTID,
  brokers: [process.env.KAFKA_BROKER] || config.kafka.BROKERS
})

const topic = process.env.KAFKA_TOPIC || config.kafka.TOPIC
const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || config.kafka.GROUPID
})

const initconsumer = async () => {

  console.log(`init consumer to KAFKA_BROKER ${process.env.KAFKA_BROKER} \n group_id ${process.env.KAFKA_GROUP_ID} \n clientId ${config.kafka.CLIENTID}-edams233 \n topic : ${topic}`);
  await consumer.connect()
  await consumer.subscribe({ topic, fromBeginning: true })

}

initconsumer();

const kafkaconsumer = async () => {

  await consumer.run({
    eachMessage: async ({ message }) => {

      console.log(`+++++++++ consumer received message: ${message.value}`)
      try {
        const jsonObj = JSON.parse(message.value.toString())

       
     
          let largeInvenotry = filterLargeOrderInfo(jsonObj)
          if (largeInvenotry) {
            console.log(
              '******* Alert!!!!! fruitInfo *********',
              largeInvenotry
            )
          }
  
        sendAll(JSON.stringify({ topic: topic, data: jsonObj }))
      } catch (error) {
        console.log('err=', error)
      }
    }
  })
}


//kafkaconsumer.catch(e => kafka.logger().error(`[example/consumer] ${e.message}`, { stack: e.stack }))
function sendAll(message) {
  console.log('sendAll : ');

  for (const value of CLIENTS) {
    console.log('FOR next ws client : ');
    value.send(message);
  }

}
function filterLargeOrderInfo(jsonObj) {
  let returnVal = null

  console.log(`eventId ${jsonObj.eventId} received!`)

  if (jsonObj.inventory >= 1000) {
    returnVal = jsonObj
  }

  return returnVal
}



const clientsUpdate = function (clients) {


  CLIENTS = clients;
  console.log("clientsUpdate invoked", CLIENTS.length)

}

module.exports = {
  kafkaconsumer: kafkaconsumer,

  clientsUpdate: clientsUpdate

};


const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.map(type => {
  process.on(type, async e => {
    try {
      console.log(`process.on ${type}`)
      console.error(e)
      await consumer.disconnect()
      process.exit(0)
    } catch (_) {
      process.exit(1)
    }
  })
})

signalTraps.map(type => {
  process.once(type, async () => {
    try {
      await consumer.disconnect()
    } finally {
      process.kill(process.pid, type)
    }
  })
})
