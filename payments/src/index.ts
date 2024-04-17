import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {

      if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be defined');
      }

      if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI must be defined');
      }

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

          new OrderCreatedListener(natsWrapper.client).listen();
          new OrderCancelledListener(natsWrapper.client).listen();

      }catch(err){
        console.error(err);
      }

      // const mongoConnection = `mongodb://${process.env.MONOGO_URI}:${process.env.MONOGO_DB_PORT}/${process.env.MONOGO_DB_NAME}`;
      const mongoConnection = process.env.MONGO_URI;
      await mongoose.connect(mongoConnection as string,{ retryWrites: true, w: 'majority' }).then(()=>{
        console.log('Connected to MongoDb');
      }).catch((err)=>{
        console.error(`Error conecting to mongo db: ${err}`);
      });

      return await mongoose.connect(mongoConnection);
  };

app.listen(process.env.CLIENT_APP_PORT, () =>{
    console.table({port: process.env.CLIENT_APP_PORT, 
      service: 'payments', 
      status: 'Running!',
      mongo_uri: process.env.MONGO_URI,
      nats_cluster_id: process.env.NATS_CLUSTER_ID,
      nats_clientid: process.env.NATS_CLIENTID,
      nats_uri: process.env.NATS_URI});
});
start();