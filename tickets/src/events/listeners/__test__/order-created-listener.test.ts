import { OrderCreatedEvent, OrderStatus } from "@codeshive/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose, { set } from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {

  //Create and save ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: new mongoose.Types.ObjectId().toHexString()
  });

  await ticket.save();

  // Create a listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    ticket: {
      id: ticket.id,
      price: ticket.price
    },
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version,
    expiresAt: new Date().toISOString()
  };

  // Create a fake message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { ticket, listener, data, msg};
};

it('reserve the ticket by saving the orderId', async () =>{
  const {listener, data, msg } = await setup();

  // Call the onMessage function wit hthe data object + mesage object
  await listener.onMessage(data, msg);

  // Write assertion to make a ticket was updated with orderId
  const updatedTicket = await Ticket.findById(data.ticket.id);
  expect(updatedTicket?.orderId).toEqual(data.id);
});

it('published reserved ticket with orderId event', async () =>{
  const {listener, data, msg } = await setup();

  // Call the onMessage function wit hthe data object + mesage object
  await listener.onMessage(data, msg);

  // Write assertion to make a ticket was published with orderId
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // console.log(natsWrapper.client.publish.mock.calls[0][1]);

  const ticketUpdatedData  = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});

it('Acks the message', async () =>{
  const {listener, data, msg } = await setup();

  // Call the onMessage function wit hthe data object + mesage object
  await listener.onMessage(data, msg);

  // Write assertion to make a ticket was updated
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the reserved ticket is not exists', async () =>{
  const {listener, data, msg } = await setup();

  data.ticket.id = new mongoose.Types.ObjectId().toHexString();
  // Call the onMessage function wit hthe data object + mesage object


  // Write assertion to make a ticket was not updated
  expect(async () => {
    await listener.onMessage(data, msg);
  }).rejects.toThrow(Error);

});