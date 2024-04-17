import nats, { Stan } from 'node-nats-streaming';
import * as dotenv from 'dotenv';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
const envFile = '.env.'+ process.env.NODE_ENV;
dotenv.config({ path: envFile});

const stan: Stan = nats.connect(`${process.env.EVENT_TOPIC}`,`${process.env.PUBLISHER_CLIENT}`,{
  url: `${process.env.NATS_URI}`
});

const data = {
  id: '123',
  title: 'concert',
  price: 20
};

stan.on('connect', async ()=> {
  console.table({
    service: 'publisher',
    status: 'Connected to NATS',
    nats_uri: process.env.NATS_URI,
    event_topic: process.env.EVENT_TOPIC
  });

  // await new EventPublisher(stan).publishEvent(`${process.env.EVENT_SUBJECT}`,data);
  const publisher = new TicketCreatedPublisher(stan);
  try{
    await publisher.publish(data);
  }catch(err){
    console.error(err);
  }
});