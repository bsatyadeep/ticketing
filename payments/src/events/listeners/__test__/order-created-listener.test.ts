import { OrderCreatedEvent, OrderStatus } from "@codeshive/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Order } from "../../../models/order";

const setup = async () =>{
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save the order
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 500
    },
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: new Date().toISOString()
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg};
};

it('replicates the order info', async () => {
  const { listener, data, msg} = await setup();

  listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order?.id).toEqual(data.id);
  expect(order?.price).toEqual(data.ticket.price);
});

it('ack the message', async () => {
  const { listener, data, msg} = await setup();

  await listener.onMessage(data,msg);

  expect(msg.ack).toHaveBeenCalled();
});