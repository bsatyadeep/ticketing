import { TicketUpdaedEvent } from "@codeshive/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from "mongoose";
import { Ticket } from "../../../models/ticket";

const setup = async () =>{
  // Create an instanceof the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 5,
    title: 'concert'
  });

  await ticket.save();

  // Create a fake data object
  const data: TicketUpdaedEvent['data'] = {
    id: ticket.id,
    price: 10,
    title: 'updated concert',
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { ticket, listener, data, msg };
}

it('finds, updates, and saves a ticket', async () => {
  const {ticket, listener, data, msg } = await setup();

  // Call the onMessage function wit hthe data object + mesage object
  await listener.onMessage(data, msg);

  // Write assertion to make a ticket was created
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.version).toEqual(data.version);
});

it('Acks the message', async () => {
  const {listener, data, msg } = await setup();

  // Call the onMessage function wit hthe data object + mesage object
  await listener.onMessage(data, msg);

  // Write assertion to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const {ticket, listener, data, msg } = await setup();

  data.version = 10;
  // Call the onMessage function wit hthe data object + mesage object
  expect(async () =>{
    await listener.onMessage(data, msg);
  }).rejects.toThrow(Error);

  // try{
  //   await listener.onMessage(data, msg);
  // }catch(err){
  //   console.error(err);
  // }

  // Write assertion to make a ticket was created
  expect(msg.ack).not.toHaveBeenCalled();
});