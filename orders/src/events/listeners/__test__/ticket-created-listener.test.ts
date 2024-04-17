import { TicketCreatedEvent } from "@codeshive/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () =>{
  // Create an instanceof the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 5,
    title: 'concert',
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
}

  
it('created and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage function wit hthe data object + mesage object
  await listener.onMessage(data, msg);

  // Write assertion to make a ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
  expect(ticket?.version).toEqual(data.version);
});

it('Acks the message', async () => {
  const { listener, data, msg } = await setup();
  // Call the onMessage function wit hthe data object + mesage object
  await listener.onMessage(data, msg);

  // Write assertion to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});