import mongoose from 'mongoose';
import { Password } from '../services/password'
//An interface that describes the properties
// that are required to create a new user
interface UserAttrs{
    email: string;
    password: string;
}

// An interface that describes  the properties
// that a user model has
interface UserModel extends mongoose.Model<UserDoc>{
    build(attrs: UserAttrs):UserDoc;
}

//An interface that describes the properties
// that a User document has
interface UserDoc extends mongoose.Document{
    email: string;
    password: string;
    // createdAt: string;
    // updatedAt: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
},{
    toJSON: {
        transform(doc, ret){
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

userSchema.pre('save', async function (done) {
    if(this.isModified('password')){
        const hashed = await Password.toHash(this.get('password') as string);
        // console.log(`Stored Password: ${this.get('password')}, Hashed Password: ${hashed}`);
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs) =>{
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };