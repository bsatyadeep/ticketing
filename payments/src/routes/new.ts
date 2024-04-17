import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requiredAuth, validateRequest } from '@codeshive/common';
import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const route = express.Router();

route.post('/api/payments',
requiredAuth,[
  body('token').not().isEmpty().withMessage('Token is required'),
  body('orderId').not().isEmpty().withMessage('orderId is required')
],
validateRequest,
async (req: Request, res: Response) => {

  const {token, orderId} = req.body;

  const order = await Order.findById(orderId);
  if(!order){
    throw new NotFoundError();
  }

  if(order.userId !== req.currentUser!.id){
    throw new NotAuthorizedError();
  }

  if(order.status === OrderStatus.Cancelled){
    throw new BadRequestError('Cannt pay for an cancelled order');
  }

  // Add Stripe Charges
  // const stripeResponse = await stripe.charges.create({
  //   currency: 'usd',
  //   amount: order.price * 100,
  //   source: token
  // });

  const payment = Payment.build({
    orderId: order.id,
    // stripeId: stripeResponse.id
    stripeId: order.id
  });

  await payment.save();

  await new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: order.id,
    stripeId: order.id
  });
  
  res.status(201).send(payment);
});

export { route as createChargerRouter };