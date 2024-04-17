import express, {Request, Response} from "express"
import { Order, OrderStatus } from "../models/order";
import { NotAuthorizedError, NotFoundError, requiredAuth, validateRequest } from "@codeshive/common";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete('/api/orders/:orderId', 
requiredAuth,
validateRequest,
async (req: Request,res: Response) => {

const { orderId } = req.params;

  const order = await Order.findById(orderId).populate('ticket');

  if(!order){
    throw new NotFoundError();
  }

  if(order.userId != req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  order.status = OrderStatus.Cancelled;
  await order.save();

  try{
  // Todo: Publish an event saying this was cancelled
  await new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    userId: order.userId,
    ticket: {
      id: order.ticket.id
    },
    version: order.version
  });
}catch(err){
  console.log(err);
}

  res.status(204).send(order);
});

export { router as deleteOrderRouter };