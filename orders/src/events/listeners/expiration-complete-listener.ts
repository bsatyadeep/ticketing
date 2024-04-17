import { ExpirationCompleteEvent, Listener, OrderStatus, Subjects } from "@codeshive/common";
import { Message } from "node-nats-streaming";
import { EXP_QUEUE_GROUP_NAME } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class ExpirationCompletionListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName: string = EXP_QUEUE_GROUP_NAME;
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message): Promise<void> {
    
    const order = await Order.findById(data.orderId).populate('ticket');
    
    
    if(!order){
      throw new Error(`Order not found with orderId: ${data.orderId}`);
    }

    if(order.status === OrderStatus.Complete){
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled
    });

    await order.save();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id
      },
      userId: order.userId,
      version: order.version
    });

    msg.ack();
  }
}