import express, { Request, Response } from 'express';
import { Ticket } from "../models/ticket";
import { NotFoundError } from '@codeshive/common';

const route = express.Router();

route.get('/api/tickets/:id', 
async (req: Request,res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if(!ticket){
    throw new NotFoundError();
  }
  
  res.send(ticket);
});

export { route as showTicketRouter };