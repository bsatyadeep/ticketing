import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledEvent, OrderStatus } from "@codeshive/common";

const setup = async () => {

  //Create and save ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: new mongoose.Types.ObjectId().toHexString()
  });

  ticket.set({
    orderId: new mongoose.Types.ObjectId().toHexString()
  });

  await ticket.save();

  // Create a listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      id: ticket.id
    },
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version
  };

  // Create a fake message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { ticket, listener, data, msg};
};

it('updates the ticket, published an event, and acks the message', async () => {
  const {ticket, listener, data, msg} = await setup();

  await listener.onMessage(data,msg);

  const updatedTicket = await Ticket.findById(data.ticket.id);

  expect(updatedTicket?.id).toEqual(data.ticket.id);
  expect(updatedTicket?.orderId).toEqual(undefined);
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('ticket not found, throws error', async () => {
  const {ticket, listener, data, msg} = await setup();

  data.ticket.id = new mongoose.Types.ObjectId().toHexString();

  expect(async () => {
    await listener.onMessage(data, msg);
  }).rejects.toThrow(Error);


  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});