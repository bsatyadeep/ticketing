import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request  from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
  var signin: () => Promise<string[]>;
}

jest.mock("../nats-wrapper");

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'changeit';

  const mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});


global.signin = async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  //Build a JWT payload.
  const payload = {
    id: id,
    email: 'test@test.com'
  };

  //Create the JWT token
 const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build Session Object
  const session = {jwt: token};

  //urn that session into JSON
  const sessionJson = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJson).toString('base64');

  // return the string
  return [`session=${base64}`];
};