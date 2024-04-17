import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "@codeshive/common";
import { natsWrapper } from "../../nats-wrapper";

it('has a route handler listening to /api/orders for get request', async () =>{
  const orderId = new mongoose.Types.ObjectId();
  const response = await request(app)
  .delete(`/api/orders/${orderId}`)
  .send({
  });

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () =>{
  const orderId = new mongoose.Types.ObjectId();
  const response  = await request(app)
  .delete(`/api/orders/${orderId}`)
  .send({});

  expect(response.status).toEqual(401);
});

it('makes an order as cancelled', async () =>{
  const user = await global.signin();

  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  });

  await ticket.save();

  // Make a request to build an order with ticket
  const { body: order } = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({
    ticketId: ticket.id
  }).expect(201);

  // Make request to dele the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const {body: orderCancelled } =  await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(200);

  expect(orderCancelled.status).toEqual(OrderStatus.Cancelled);
});

it('un authorized order as cancelled', async () =>{
  const user = await global.signin();

  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  });

  await ticket.save();

  // Make a request to build an order with ticket
  const { body: order } = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({
    ticketId: ticket.id
  }).expect(201);

  // Make request to dele the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', await global.signin())
    .send()
    .expect(401);

  const {body: orderCancelled } =  await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(200);
});

it('emits a order cancelled event', async () => {

  const user = await global.signin();

  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'test',
    price: 20
  });

  await ticket.save();

  // Make a request to build an order with ticket
  const { body: order } = await request(app)
  .post('/api/orders')
  .set('Cookie', user)
  .send({
    ticketId: ticket.id
  }).expect(201);

  // Make request to delete the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();    
});