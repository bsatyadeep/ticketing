import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";

it('has a route handler listening to /api/orders for get request', async () =>{
  const orderId = new mongoose.Types.ObjectId();
  const response = await request(app)
  .get(`/api/orders/${orderId}`)
  .send({
  });

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () =>{
  const orderId = new mongoose.Types.ObjectId();
  const response  = await request(app)
  .get(`/api/orders/${orderId}`)
  .send({});

  expect(response.status).toEqual(401);
});

it('fetches the order', async () =>{
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

  // Make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});


it('not authorised', async () =>{
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

  // Make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', await global.signin())
    .send()
    .expect(401);
});