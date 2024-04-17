import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {

      if(!process.env.JWT_KEY){
        throw new Error('JWT_KEY must be defined');
      }
      if(!process.env.MONGO_URI){
        throw new Error('MONGO_URI must be defined');
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
      service: 'auth', 
      status: 'Running!',
      mongo_uri: process.env.MONGO_URI});
});
start();