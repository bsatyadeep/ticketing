import nats, { Stan } from "node-nats-streaming";
import * as dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from "./events/ticket-created-listener";
import { TicketUpdatedListener } from "./events/tickets-updated-listener";

console.clear();

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
const envFile = '.env.'+ process.env.NODE_ENV;
dotenv.config({ path: envFile});

// const start = async () => {

  // const stan: Stan = nats.connect(`${process.env.EVENT_TOPIC}`,`${process.env.LISTENER_CLIENT}`,{
    const stan: Stan = nats.connect(`${process.env.EVENT_TOPIC}`,`${randomBytes(4).toString('hex')}`,{
    url: `${process.env.NATS_URI}`
  });

  stan.on("connect",async () => {
    console.table({
      service: 'listener',
      status: 'Connected to NATS Streaming Server',
      nats_uri: process.env.NATS_URI,
      event_topic: process.env.EVENT_TOPIC
    });

    stan.on("close", () => {
      console.log("Nats connection closed!");
      process.exit();
    });

    // const options = stan
    //   .subscriptionOptions()
    //   .setManualAckMode(true)
    //   .setDeliverAllAvailable()
    //   .setDurableName(process.env.EVENT_DURABLE_QUEUE_NAME!);

    // const subscription = stan.subscribe(
    //   `${process.env.EVENT_SUBJECT}`,
    //   `${process.env.EVENT_QUEUE_GROUP}`,
    //   options);

    // subscription.on("message", async (msg: Message) => {
    //   const data = msg.getData();
    //   if(typeof data === 'string'){
    //     const parsedData = JSON.parse(data);
    //     console.log(`Event ${msg.getSubject()} Received!`);
    //     console.table({
    //       subject: msg.getSubject(),
    //       sequence: msg.getSequence()
    //     });
    //     console.table(parsedData);
    //     msg.ack();
    //   }
    // });

    new TicketCreatedListener(stan).listen();
    new TicketUpdatedListener(stan).listen();
  });
// };

// start();
process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());