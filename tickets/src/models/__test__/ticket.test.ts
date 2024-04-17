import { Ticket } from "../ticket";

it('implements optimistic concurency control', async () => {
  // const user = await global.signin();
  // Create instance of a ticket
  const ticket = Ticket.build({
    title: 'Test',
    price: 20,
    userId: 'test'
  });

  // save the ticket to the database
  ticket.save();

  // fetch the ticket twice
  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);

  // make two separate changes to the ticket we fetched
  ticket1?.set({price: 10});
  ticket2?.set({price: 15});

  // save the first fetched ticket
  await ticket1?.save();

  // save the second fetched ticket and expect an error
  try{
    await ticket2?.save();
  }catch(err){
    return;
  }
  throw new Error('Should not reach at this point');

  // await ticket2?.save();

  // expect(async () => {
  //   await ticket2?.save();
  // }).toThrow('Versioning Error');

});

it('increaments the version number on multiple saves', async () => {

  const ticket1 = Ticket.build({
    title: 'Test',
    price: 20,
    userId: 'test'
  });

  await ticket1.save();
  expect(ticket1.version).toEqual(0);

  await ticket1.save();
  expect(ticket1.version).toEqual(1);
});