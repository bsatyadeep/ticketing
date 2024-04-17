import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Subjects } from "./subjects";
import { TicketUpdatedEvent } from "./tickets-updated-events";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: TicketUpdatedEvent['subject'] = Subjects.TicketUpdated;
  // subject: string = `${process.env.PAYMENT_SUBJECT}`;
  queueGroupName: string = `${process.env.PAYMENT_QUEUE_GROUP}`;
  
  onMessage(data: TicketUpdatedEvent['data'], msg: Message): void {
    console.log('Event data!', data);
    msg.ack();
  }
}