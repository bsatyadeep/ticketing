import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';
import * as dotenv from 'dotenv';

const start = async () => {

  process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
  const envFile = '.env.'+ process.env.NODE_ENV;
  dotenv.config({ path: envFile});

    if(!process.env.NATS_CLUSTER_ID){
      throw new Error('NATS_CLUSTER_ID must be defined');
    }

    if(!process.env.NATS_CLIENTID){
      throw new Error('NATS_CLIENTID must be defined');
    }

    if(!process.env.NATS_URI){
      throw new Error('NATS_URI must be defined');
    }

    try{
      await natsWrapper.connect(
        process.env.NATS_CLUSTER_ID,
        process.env.NATS_CLIENTID,
        process.env.NATS_URI);

        natsWrapper.client.on('close', () => {
          console.log('NATS Connection closed!')
          process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

    }catch(err){
      console.error(err);
    }

    new OrderCreatedListener(natsWrapper.client).listen();
};
start();