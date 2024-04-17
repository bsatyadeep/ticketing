import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';

it('return a 404 when purchasing an order that does not exists', async () => {
  await request(app)
  .post('/api/payments')
  .set('Cookie', await global.signin())
  .send({
    token: 'test',
    orderId: new mongoose.Types.ObjectId().toHexString()
  }).expect(404);

});

it('return a 401 when purchasing an order that does not belong to the user', async () => {

  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 500,
    status: OrderStatus.Created,
    userId: userId,
    version: 0
  });

  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie', await global.signin())
  .send({
    token: 'test',
    orderId: order.id
  }).expect(401);
});

it('return a 400 when purchasing a cancelled order', async () => {

  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 500,
    status: OrderStatus.Cancelled,
    userId: userId,
    version: 0
  });

  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie', await global.signin(userId))
  .send({
    token: 'test',
    orderId: order.id
  }).expect(400);  

});

// it('return a 204 with valid inputs', async () =>{
//   const userId = new mongoose.Types.ObjectId().toHexString();

//   const order = Order.build({
//     id: new mongoose.Types.ObjectId().toHexString(),
//     price: 500,
//     status: OrderStatus.Created,
//     userId: userId,
//     version: 0
//   });

//   await order.save();

//   await request(app)
//   .post('/api/payments')
//   .set('Cookie', await global.signin(userId))
//   .send({
//     token: 'tok_visa',
//     orderId: order.id
//   }).expect(201);

//   const chargesOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//   expect(chargesOptions.source).toEqual('tok_visa');
//   expect(chargesOptions.amount).toEqual(50000);
//   expect(chargesOptions.currency).toEqual('usd');
// });

it('payment saved successfully', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 500,
    status: OrderStatus.Created,
    userId: userId,
    version: 0
  });

  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie', await global.signin(userId))
  .send({
    token: 'test',
    orderId: order.id
  }).expect(201);  

  const payment = await Payment.findOne({orderId: order.id});
  expect(payment).toBeDefined();
  expect(payment).not.toBeNull();
  expect(payment!.orderId).toEqual(order.id);
});

it('published payment message', async () => {

  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 500,
    status: OrderStatus.Created,
    userId: userId,
    version: 0
  });

  await order.save();

  await request(app)
  .post('/api/payments')
  .set('Cookie', await global.signin(userId))
  .send({
    token: 'test',
    orderId: order.id
  }).expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});