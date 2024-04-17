import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@codeshive/common"
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = QUEUE_GROUP_NAME;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
    
    // find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    //if no ticket, throw error
    if(!ticket){
      throw new Error('Ticket not Found');
    }

    // Mark the ticket as being reserved by setting its orderId
    ticket.set({
      orderId: data.id,
      status: OrderStatus.Created
    });

    // Save the ticket
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      orderId: ticket.orderId,
      userId: ticket.userId,
      version: ticket.version
    });

    // ack the message
    msg.ack();
  }
}