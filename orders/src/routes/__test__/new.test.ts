import request from "supertest";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";

it('has a route handler listening to /api/orders for post request', async () =>{
  const response = await request(app)
  .post('/api/orders')
  .send({
  });

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () =>{
  const response  = await request(app)
  .post('/api/orders')
  .send({});

  expect(response.status).toEqual(401);
});

it('returns an error if the ticketId not provided', async () =>{

  await request(app)
  .post('/api/orders')
  .set('Cookie',await global.signin())
  .send({
  }).expect(400);
});

it('returns an error if the ticket does not exists', async () =>{
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
  .post('/api/orders')
  .set('Cookie',await global.signin())
  .send({
    ticketId
  }).expect(404);
});

it('returns an error if the ticket is already reserved', async () =>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  const order = Order.build({
    userId: 'test',
    status: OrderStatus.Created,
    ticket: ticket,
    expiresAt: new Date()
  });

  await order.save();


  const response = await request(app)
  .post('/api/orders')
  .set('Cookie',await global.signin())
  .send({
    ticketId: ticket.id
  });

  expect(response.status).toEqual(400);
});

it('reserves a ticket', async () =>{

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  const response = await request(app)
  .post('/api/orders')
  .set('Cookie',await global.signin())
  .send({
    ticketId: ticket.id
  });

  expect(response.status).toEqual(201);
});

it('emits an order created event', async () => {

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  await request(app)
  .post('/api/orders')
  .set('Cookie',await global.signin())
  .send({
    ticketId: ticket.id
  }).expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

});