import nats, { Message } from "node-nats-streaming";
import * as dotenv from 'dotenv';

console.clear();

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
const envFile = '.env.'+ process.env.NODE_ENV;
dotenv.config({ path: envFile});

const start = async () => {

  const stan = nats.connect('ticketing','123',{
    url: `${process.env.NATS_URI}`
  });

  stan.on("connect", async () => {
    console.table({
      service: 'listener',
      status: 'Connected to NATS Streaming Server',
      nats_uri: process.env.NATS_URI,
      event_topic: process.env.EVENT_TOPIC
    });

    const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable();

    try{
    const subscription = stan.subscribe('ticket-created',options);
    subscription.on("message", (msg: Message) => {
      const parsedData = JSON.parse(msg.getData().toString("utf-8"));
      console.log("EVENT RECEIVED WITH THE DATA BELOW :");
      console.table(parsedData);
      
      msg.ack();
    });
  }catch(err){
    console.log(err);
  }
  });
};

start();