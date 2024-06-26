import request from 'supertest';
import {app} from '../../app';

it('fails when a email that does not exists is supplied', async () =>{

  await request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com',
    password: 'test'
  }).expect(400);
});

it('fails when a incorrect password is supplied', async () =>{
  await request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: 'test'
  }).expect(201);

  await request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com',
    password: 'test1'
  }).expect(400);

});

it('responds with a cookie when a valid credential is supplied', async () =>{
  await request(app)
  .post('/api/users/signup')
  .send({
    email: 'test@test.com',
    password: 'test'
  }).expect(201);

  const response = await request(app)
  .post('/api/users/signin')
  .send({
    email: 'test@test.com',
    password: 'test'
  }).expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});