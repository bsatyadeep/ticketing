import { ValidationError } from "express-validator";
import { CustomError } from './custom-error';
export class RequestValidationError extends CustomError{
    statusCode = 400;

    constructor(public errors: ValidationError[]){
        super('Error connecting to db');

        //Ony because we are extending a built in class
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    serializeErrors(){
        return this.errors.map(err =>{
            return {message: err.msg};
        })
    }
}