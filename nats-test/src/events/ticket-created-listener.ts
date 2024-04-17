import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: TicketCreatedEvent['subject'] = Subjects.TicketCreated;
  // subject: string = `${process.env.PAYMENT_SUBJECT}`;
  queueGroupName: string = `${process.env.PAYMENT_QUEUE_GROUP}`;
  
  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log('Event data!', data);
    msg.ack();
  }
}