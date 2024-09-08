import { couponType, orderStatus, paymentMethods } from "../../src/Utils/index.js";
import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";
import { productModel } from "./product.model.js";
import { couponModel } from "./coupon.model.js";

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "product",
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    fromCart: {
      type: Boolean,
      default: true,
    },
    address: String,
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "address",
    },
    contactNumber: {
      type: String,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
    VAT: {
      type: Number,
      default: 0,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "coupon",
    },
    total: {
        type: Number,
        required: true,
    },
    arrivalEstimateTime: {
        type: Date,
        required : true
    },
    paymentMethod: {
        type: String,
        enum: Object.values(paymentMethods),
        required: true,
    },
    orderStatus: {
        type: String,
        required: true,
        enum: Object.values(orderStatus),
    },
    deliverdBy :{
        type: Schema.Types.ObjectId,
        ref: "user",
        required: false,
    },
    canceledBy :{
        type: Schema.Types.ObjectId,
        ref: "user",
        required: false,
    },
    deliverdAt:Date,
    canceledAt:Date,
    },
  { timestamps: true }
);

orderSchema.post("save",async function (){
    for (const product of this.products) {
         await productModel.updateOne(
          {_id : product.productId},
          { $inc: { stock: -product.quantity } },
          { new: true }
        );
        if(this.couponId){
            const coupon = await couponModel.findById(this.couponId);
            coupon.users.find(u => u.userId.toString() === this.userId.toString()).usageCount++;
            await coupon.save();

        }        
    }
})
export const orderModel =
  mongoose.models.orderModel || model("order", orderSchema);
