import mongoose from "mongoose";
import { Order, OrderStatus } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@codeshive/common";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 500,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0
  });

  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString()
    },
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: order.version + 1
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener,data, order, msg };
};

it('updated the status of order', async () => {
  const { listener,data, order, msg } = await setup();

  await listener.onMessage(data, msg);

  const orderUpdated = await Order.findById(order.id);

  expect(orderUpdated!.status).toEqual(OrderStatus.Cancelled);

});

it('error when the orderId with version not found', async () => {
  const { listener,data, order, msg } = await setup();
  data.version = 0;

  expect(async () => {
    await listener.onMessage(data, msg);
  }).rejects.toThrow(Error);

});

it('ack the message', async () => {
  const { listener,data, order, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();

});