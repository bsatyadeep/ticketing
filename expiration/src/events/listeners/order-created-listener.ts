import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@codeshive/common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = QUEUE_GROUP_NAME;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {

    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`Waiting this many milliseconds to process the job: ${delay}`)
    await expirationQueue.add({
      orderId: data.id
    }, {
      delay: delay
    });

    msg.ack();
  }
}