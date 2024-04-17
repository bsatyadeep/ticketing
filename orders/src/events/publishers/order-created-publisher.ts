import { Publisher, OrderCreatedEvent, Subjects } from "@codeshive/common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}