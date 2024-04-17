import { Publisher, Subjects, TicketCreatedEvent } from "@codeshive/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;

}