import request from 'supertest';
import { App } from 'supertest/types';
import { app } from '../../app';

it('response with details of current user', async () =>{
  // const signupResponse = await request(app)
  // .post('/api/users/signup')
  // .send({
  //   email: 'test@test.com',
  //   password: 'test'
  // }).expect(201);


  // const cookie = signupResponse.get('Set-Cookie');

  const cookie = await signin();

  var response = await request(app)
  .get('/api/users/currentuser')
  .set('Cookie',cookie)
  .send({
    email: 'test@test.com',
    password: 'test'
  }).expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('response with null if not autthenticated', async () =>{

  // const cookie = await signin();

  var response = await request(app)
  .get('/api/users/currentuser')
  // .set('Cookie',cookie)
  .send({
    email: 'test@test.com',
    password: 'test'
  }).expect(200);

  expect(response.body.currentUser).toEqual(null);
});