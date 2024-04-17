import { OrderStatus, PaymentCreatedEvent } from "@codeshive/common";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper"
import { PaymentCreatedListener } from "../payment-created-listener"
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const setup = async () =>{
  const listener = new PaymentCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 5,
    title: 'new moview'
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    ticket: ticket,
    expiresAt: new Date()
  });

  await order.save();
  
  const data: PaymentCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    orderId: order.id,
    stripeId: order.id
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };


  return { listener,order, data, msg };
}

it('Order status updated', async () => {
  const { listener,order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);

  expect(msg.ack).toHaveBeenCalled();
});