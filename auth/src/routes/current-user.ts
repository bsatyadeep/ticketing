import express, { Request, Response, Router } from 'express';
// import { currentUser } from '../middlewares/current-user';
import { currentUser } from '@codeshive/common';

const router: Router = express.Router();

router.get(
    '/api/users/currentuser', 
    currentUser,
    async (req: Request, res: Response) => {
    if(!req.session?.jwt){
        return res.send({currentUser: null});
    }

    //Move to middleware
   //  try{
   //   const payload = jwt.verify(
   //      req.session.jwt, 
   //      process.env.JWT_KEY!);
   //      return res.send({currentUser: payload});
   //   }catch(err){
   //      console.log(`Invalid credentials`);
   //      return res.send({currentUser: null});
   //   }
   
   res.send({currentUser: req.currentUser || null});
});

export { router as currentUserRouter };