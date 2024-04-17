import express,{ Request, Response, Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/users';
import { BadRequestError, validateRequest } from '@codeshive/common';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin',
[
    body('email')
    .isEmail()
    .withMessage('Email most be valid'),
    body('password')
    .trim()
    .notEmpty()
    .withMessage('You most supply a password')
], 
validateRequest,
async (req: Request, res: Response) => {
    //We don;t need to validate at individual route
    // const errors = validationResult(req);
    // if(!errors.isEmpty()){
    //     throw new RequestValidationError(errors.array());
    // }

    const {email, password } = req.body;
    const existingUser = await User.findOne({email});
    if(!existingUser){
        throw new BadRequestError('Invalid email and password');
    }

    const passwordsMatch = await Password.compare(
        existingUser.password, 
        password);
    if(!passwordsMatch){
        throw new BadRequestError('Invalid password');
    }

    //Generate JWT

    const userJwt = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
    }, process.env.JWT_KEY!);

    //Store it on session object
    req.session = {
        jwt: userJwt
    };

    res.status(200).send(existingUser);
});

export { router as signinRouter };