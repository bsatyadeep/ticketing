import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';

import { errorHandler, NotFoundError, currentUser } from '@codeshive/common';
import cookieSession from 'cookie-session';
import { createChargerRouter } from './routes/new';

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
const envFile = '.env.'+ process.env.NODE_ENV;
dotenv.config({ path: envFile});

const app = express();
app.set('trust proxy',true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); 

app.use(cookieSession({
  signed: false,
  // secure: true
  secure: process.env.NODE_ENV !== 'test'
}));
app.use(currentUser);
app.use(createChargerRouter);

app.all('*', async () =>{
    throw new NotFoundError()
});

app.use(errorHandler);

export { app };