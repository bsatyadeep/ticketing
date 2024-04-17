
import { useEffect } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

export default () =>{
const { doRequest } = useRequest({
  url: process.env.NEXT_PUBLIC_SIGNOUT_URL,
  method: 'post',
  'body':{},
  onSuccess: () => Router.push('/')
});

useEffect(()=>{
  doRequest();
}, []);

// const onSubmit = async (event) => {
//   event.preventDefault();
//   await doRequest();

//   // Router.push('/')
// };

  return (<div>
    Signing you out....
  </div>);
};