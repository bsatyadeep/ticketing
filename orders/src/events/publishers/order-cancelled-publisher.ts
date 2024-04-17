import { OrderCancelledEvent, Publisher, Subjects } from "@codeshive/common";


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}