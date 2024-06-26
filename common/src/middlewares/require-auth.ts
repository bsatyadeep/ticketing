import {NextFunction, Request, Response} from  'express';
import { NotAuthorizedError } from '../errors/not_authorized-error';

export const requiredAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) =>{
  if(!req.currentUser){
    throw new NotAuthorizedError();
  }

  next();
};