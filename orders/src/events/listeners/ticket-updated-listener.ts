import { Listener, NotFoundError, Subjects, TicketUpdaedEvent } from "@codeshive/common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdaedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName: string = QUEUE_GROUP_NAME;
  async onMessage(data: TicketUpdaedEvent['data'], msg: Message): Promise<void> {
    
    // const ticket = await Ticket.findById(data.id);
    // const ticket = await Ticket.findOne({
    //   id: data.id,
    //   version: data.version - 1
    // });

    const ticket = await Ticket.findByEvent(data);
    if(!ticket){
      throw new Error('Ticket not Found');
    }

    ticket.set({
      title: data.title,
      price: data.price
      // version: data.version
    });

    await ticket.save();

    msg.ack();
  }
}