
import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

export default () =>{
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
// const [errors, setErrors] = useState([]);
const SIGNUP_URL = process.env.NEXT_PUBLIC_SIGNUP_URL;

const { doRequest, errors } = useRequest({
  url:SIGNUP_URL,
  method: 'post',
  'body':{
    email,
    password
  },
  onSuccess: () => Router.push('/')
});


const onSubmit = async (event) => {
  event.preventDefault();
  // try{
  // const response = await axios.post(process.env.NEXT_PUBLIC_SIGNUP_URL,{
  //  email, password
  // });
  // }catch(err){
  //   setErrors(err.response.data.errors);
  // }
  await doRequest();

  // Router.push('/')
};

  return (<form onSubmit={onSubmit}>
    <h1>Sign Up</h1>
    <div className='form-group'>
      <label className='form-label'>Email Address</label>
      <input 
      className='form-control' 
      value= {email}
      onChange={e=>setEmail(e.target.value)}></input>
    </div>

    <div className='form-group'>
      <label className='form-label'>Password</label>
      <input 
      type='password' 
      className='form-control'
      value={password}
      onChange={e=>setPassword(e.target.value)}></input>
    </div>
    {/* {errors.length > 0 &&  <div className='alert alert-danger'>
    <h4>Ooops...</h4>
    <ul className='my-0'>
      {errors.map(err=> <li key={err.message}>{err.message}</li> )}
    </ul>
    </div>} */}

    {errors}
    <button 
    className='btn btn-primary'>Sign Up</button>
  </form>);
};