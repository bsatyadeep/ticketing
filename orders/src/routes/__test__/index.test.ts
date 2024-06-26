import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it('has a route handler listening to /api/orders for get request', async () =>{
  const response = await request(app)
  .get('/api/orders')
  .send({
  });

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () =>{
  const response  = await request(app)
  .get('/api/orders')
  .send({});

  expect(response.status).toEqual(401);
});

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();
  return ticket;
}

it('fetches orders for a particular user', async () =>{
  // Create three tickets
  const ticket1 = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  const user1 = await global.signin();
  const user2 = await global.signin();

  // Create one Order as User #1
  await request(app)
  .post('/api/orders')
  .set('Cookie', user1)
  .send({
    ticketId: ticket1.id
  }).expect(201);


  // Create two orders as User #2
  const { body: order2 } = await request(app)
  .post('/api/orders')
  .set('Cookie', user2)
  .send({
    ticketId: ticket2.id
  }).expect(201);

  const { body: order3 } = await request(app)
  .post('/api/orders')
  .set('Cookie', user2)
  .send({
    ticketId: ticket3.id
  }).expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', user2)
    .send()
    .expect(200);

    // console.log(response.body);

  // Make sure we only git the orders for user #2

  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(order2.id);
  expect(response.body[1].id).toEqual(order3.id);
  expect(response.body[0].ticket.id).toEqual(ticket2.id);
});