import request from 'supertest';
import { app } from '../../app';

const createTicket = async () => {
  return await request(app).post('/api/tickets')
  .set('Cookie', await global.signin())
  .send({
    title: 'Test',
    price: 20
  }).expect(201);

}

it('retrun list of tickets', async () => {

  await createTicket();
  await createTicket();
  await createTicket();

  const tickets = await request(app)
  .get(`/api/tickets`)
  .send()
  .expect(200);

  expect(tickets.body.length).toEqual(3);
});