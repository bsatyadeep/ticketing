import { Publisher, Subjects, TicketUpdaedEvent } from "@codeshive/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdaedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}