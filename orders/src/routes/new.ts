import mongoose from "mongoose";
import express, {Request, Response} from "express";
import { BadRequestError, NotFoundError, requiredAuth, validateRequest } from '@codeshive/common';
import { body } from 'express-validator';
import { Ticket } from "../models/ticket";
import { Order, OrderStatus } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

// const EXPIRATION_WINDOW_SECONDS = 15 * 60;
const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const router = express.Router();

router.post('/api/orders', 
requiredAuth, 
[
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('TicketId most be provided')
],
validateRequest,
async (req: Request,res: Response) => {
  const { ticketId } = req.body;

  // Find the ticket the user is trying to order in the database
  const ticket = await Ticket.findById(ticketId);
  if(!ticket){
    throw new NotFoundError();
  }

  //Make sure that this ticket is not reserved
  // Run the query look at all orders. find an order where the ticket
  // is the ticket we just found *and* the orders status is *not* cancelled.
  // if we find an order from that means the ticket *is* reserved

  // const existingOrder = await Order.findOne({
  //   ticket: ticket,
  //   status: {
  //     $in:[
  //       OrderStatus.Created,
  //       OrderStatus.AwaitingPayment,
  //       OrderStatus.Complete
  //     ]
  //   }
  // });
  // if(existingOrder){
  //   throw new BadRequestError('Ticket is already reserved');
  // }

  const isReerved = await ticket.isReserved();
  if(isReerved){
    throw new BadRequestError('Ticket is already reserved');
  }

  // calculate an expiration date for this order
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  // Build the order and save it to the database
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket: ticket
  });

  await order.save();
  try{
  // Publish an event saying that an order was created
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price
      },
      version: order.version
    });
  }catch(err){
    console.error(err);
  }
  res.status(201).send(order);
  });

export { router as newOrderRouter };