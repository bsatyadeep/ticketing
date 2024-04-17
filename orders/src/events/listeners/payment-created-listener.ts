import { Listener, NotFoundError, OrderStatus, PaymentCreatedEvent, Subjects } from "@codeshive/common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName: string = QUEUE_GROUP_NAME;
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {

    const order = await Order.findById(data.orderId);

    if(!order){
      throw new Error(`Order not found with orderId: ${data.orderId}`);
    }

    order.set({
      status: OrderStatus.Complete
    });

    await order.save();

    msg.ack();
  }
}