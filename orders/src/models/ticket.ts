import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order, OrderStatus } from "./order";

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved() : Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {id: string, version: number}): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true,
    min: 0
  }
},{
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
      // delete ret.__v;
    }
  }
});

ticketSchema.set('versionKey','version');
ticketSchema.plugin(updateIfCurrentPlugin);
// ticketSchema.pre('save', function(done){
//   // @ts-ignore
//   this.$where = {
//     version: this.get('version') - 1
//   };

//   done();
// });

ticketSchema.statics.findByEvent = (event: {id: string, version: number}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

ticketSchema.statics.build = (attr: TicketAttrs) =>{
  // return new Ticket(attr);
  return new Ticket({
    _id: attr.id,
    title: attr.title,
    price: attr.price
  });
};
ticketSchema.methods.isReserved = async function() {
  // this === the ticket document that we just called 'isResered' on

  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in:[
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  });
  return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>(
  'Ticket', 
  ticketSchema);

export { Ticket, TicketDoc };