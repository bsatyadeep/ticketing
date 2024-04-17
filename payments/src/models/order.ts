import { OrderStatus } from "@codeshive/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";


interface OrderAttrs {
  id: string;
  status: OrderStatus;
  userId: string;
  price: number;
  version: number;
}

interface OrderDoc extends mongoose.Document {
  status: OrderStatus;
  userId: string;
  price: number;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
  status: {
    type: String,
    require: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },
  userId: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true
  }
},
{
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
      // delete ret.__v;
    }
  }
});

orderSchema.set('versionKey','version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attr:OrderAttrs) => {
  return new Order({
    _id: attr.id,
    status: attr.status,
    userId: attr.userId,
    version: attr.version,
    price: attr.price
  });
}

const Order = mongoose.model<OrderDoc, OrderModel>(
  'Order', 
  orderSchema);

export { Order, OrderStatus };