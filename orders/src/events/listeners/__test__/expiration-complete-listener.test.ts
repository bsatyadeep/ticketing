import mongoose from "mongoose";
import { Order, OrderStatus } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompletionListener } from "../expiration-complete-listener";
import { ExpirationCompleteEvent } from "@codeshive/common";

const setup = async () => {
  console.clear();
  // Create an instanceof the listener
  const listener = new ExpirationCompletionListener(natsWrapper.client);

  // Create and save the order
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 500,
    title: 'concert'
  });
  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    status: OrderStatus.Created,
    ticket: ticket
  });

  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };

    // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, order, msg, ticket, data };
};

it('updates the order status to cancelled', async () => {
  const {listener, order, msg, ticket, data} = await setup();
  await listener.onMessage(data,msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock)
  .mock.calls[0][1]);
  expect(eventData.id).toEqual(order.id);

});

it('incase the order is completed will ack the message', async () => {
  const {listener, order, msg, ticket, data} = await setup();
  order.status = OrderStatus.Complete;
  await listener.onMessage(data,msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('emit an ordercancelled event', async () =>{
  const {listener, order, msg, ticket, data} = await setup();
  await listener.onMessage(data,msg);
});

it('ack message', async () =>{
  const {listener, order, msg, ticket, data} = await setup();
  await listener.onMessage(data,msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('Order not found with orderId', async () => {
  const {listener, order, msg, ticket, data} = await setup();
  data.orderId = new mongoose.Types.ObjectId().toHexString();

  expect(async () =>{
    await listener.onMessage(data, msg);
  }).rejects.toThrow(Error);
});