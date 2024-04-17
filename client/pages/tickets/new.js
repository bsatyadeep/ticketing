import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const NetTicket= () => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: process.env.NEXT_PUBLIC_TICKET_URL,
    method: 'post',
    body: {
      title: title,
      price: price
    },
    onSuccess: (ticket) =>
      // console.log(ticket),
      Router.push('/'),
  });

  const onSubmit = (event) =>{
    event.preventDefault();
    doRequest();
  };

  const onBlur = () => {
    const priceEntered = parseFloat(price);
    if (isNaN(priceEntered)) {
      return;
    }

    setPrice(priceEntered.toFixed(2));
  };

  return (
  <div>
    <h1>Create a Ticket</h1>
    <form onSubmit={onSubmit}>
      <div className='form-group'>
        <label>Title</label>
        <input 
        className="form-control"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
         />
      </div>
      <div className='form-group'>
        <label>Price</label>
        <input 
        className="form-control"
        value={price}
        onBlur={onBlur}
        onChange={(e) => setPrice(e.target.value)}
         />
      </div>
      {errors}
      <button className="btn btn-primary">Submit</button>
    </form>
  </div>
  );
};

export default NetTicket;