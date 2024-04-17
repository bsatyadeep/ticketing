import { useEffect, useState } from 'react';
import StripeCheckout  from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';


const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: process.env.NEXT_PUBLIC_PAYMENT_URL,
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: (payment) => {
      // console.log(payment)
      Router.push('/orders')
    }
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const expiresIn = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(expiresIn / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  },[order]);

  if(timeLeft < 0){
    return (
      <div>Order Expired</div>
    );
  }
  

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      {/* {<h1>{ expiresIn / 10000} seconds until order expires</h1>} */}
      <br/>
      <StripeCheckout 
        // token={(token) => console.log(token)}
        // token={(id) => console.log(id)}
        token={(id) => doRequest({token: id})}
        stripeKey='pk_test_51P5kiYSI3DWOm2k4imsybKKfkuyXl00am4oEkGc9gbqArojHoOQcufITuRmSpppev0A01l4V0nGF21AChK2oMLza00FyZ9Hgsl'
        amount={order.ticket.price * 100}
        email={currentUser.email}/>
        {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`${process.env.NEXT_PUBLIC_ORDER_URL}/${orderId}`);

  return {order: data};
};

export default OrderShow;