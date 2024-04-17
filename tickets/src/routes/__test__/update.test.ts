import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it('retrurns a 404 if the provided is does not exists', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
  .put(`/api/tickets/${id}`)
  .set('Cookie',await global.signin())
  .send({
    title: 'Test',
    price: 20
  }).expect(404);

});

it('retrurns a 401 if the user is not authenticated', async () => {

  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
  .put(`/api/tickets/${id}`)
  .send({
    title: 'Test',
    price: 20
  }).expect(401);
});


it('retrurns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', await global.signin())
  .send({
    title: 'Test',
    price: 20
  }).expect(201);

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', await global.signin())
  .send({
    title: 'Test',
    price: 20
  }).expect(401); 

});


it('retrurns a 400 if the user provides invalid title or price', async () => {
  const cookie = await global.signin();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'Test',
    price: 20
  }).expect(201);

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: '',
    price: 20
  }).expect(400); 

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    price: 20
  }).expect(400); 

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'Test',
    price: -20
  }).expect(400); 

  await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'Test'
  }).expect(400); 

});

it('updates the ticket provided valid inputs', async () => {
  const cookie = await global.signin();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'Test',
    price: 20
  }).expect(201);

  const updatedTicket = await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'Updated',
    price: 30
  }).expect(200); 

  expect(updatedTicket.body.title).toEqual('Updated')
  expect(updatedTicket.body.price).toEqual(30);

});

it('publishes an event', async () =>{

  const cookie = await global.signin();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'Test',
    price: 20
  }).expect(201);

  const updatedTicket = await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'Updated',
    price: 30
  }).expect(200); 

  expect(natsWrapper.client.publish).toHaveBeenCalled();

});

it('rejects updates if the tickets is reserved', async () =>{
  const cookie = await global.signin();
  const response = await request(app)
  .post('/api/tickets')
  .set('Cookie', cookie)
  .send({
    title: 'Test',
    price: 20
  }).expect(201);

  const ticket = await Ticket.findById(response.body.id);

  ticket?.set({
    orderId: new mongoose.Types.ObjectId().toHexString()
  });

  await ticket?.save();

  const updatedTicket = await request(app)
  .put(`/api/tickets/${response.body.id}`)
  .set('Cookie', cookie)
  .send({
    title: 'Updated',
    price: 30
  }).expect(400); 

});