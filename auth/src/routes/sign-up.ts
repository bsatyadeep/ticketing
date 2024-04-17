import express, { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/users';
import { BadRequestError, validateRequest } from '@codeshive/common';

const router: Router = express.Router();

router.post(
    '/api/users/signup', 
    [
        body('email')
            .isEmail()
            .withMessage('Provide a valid email'),
        body('password')
            .trim()
            .isLength({min:4, max: 20})
            .withMessage('Password must be between 4 and 20 charecters')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
    // const errors = validationResult(req);
    // const {email, password } = req.body;
    // if(!email || typeof email !== 'string'){
    //     res.status(400).send('Provide a valid email')
    // }

    //We don;t need to validate at individual route
    // if(!errors.isEmpty()){
    //     // return res.status(400).send(errors.array());
    //     //This is java script land
    //     // throw new Error('Invalid email or password');
    //     throw new RequestValidationError(errors.array());
    // }

    const {email, password } = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
        console.log(`Email: ${email} is already used`);

        // return res.send({});
        throw new BadRequestError('Email in use');
    }

    // console.log('Creating a user...');

    const user = User.build({email, password});
    await user.save();

    //Generate JWT
    // const userJwt = jwt.sign({
    //     id: user.id,
    //     email: user.email
    // }, process.env.JWT_PRIVATE_KEY as string);

    //Use from Kubernetes ENV
    // if(process.env.JWT_KEY){
    //     throw new Error('Invalid JWT Key');
    // }

    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!);

    //Store it on session object
    req.session = {
        jwt: userJwt
    };

    res.status(201).send(user);
});

export { router as signupRouter };