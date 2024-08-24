import { calculateSubTotal } from "../../src/Modules/Cart/Utils/cart.utils.js";
import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";

const  cartSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products:[{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default:1,
            min: 1
        },
        price: {
            type: Number,
            required: true,
        }
    }],
    subTotal:{
        type: Number,
        default: 0
    }
},{
    timestamps: true,
    versionKey: false
})

cartSchema.pre('save', function(next){
    this.subTotal = calculateSubTotal(this.products);
    console.log("calculating subTotal", this.subTotal);
    
    next();
})

cartSchema.post('save',async function(document){
    if (document.products.length === 0) {
        console.log("deleting cart as no products in cart with id : ",document._id);
        
        await cartModel.deleteOne({ userId:document.userId });
      }
})
export const cartModel = mongoose.models.cartModel || model("cart", cartSchema);
