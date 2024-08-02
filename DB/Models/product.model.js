import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";
import slugify from "slugify";
import { Badges, calculatePrice, DiscountType } from "../../src/Utils/index.js";

const productSchema = new Schema(
  {
    // string section 
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      default : function () {
        return slugify(this.name, {
            lower: true ,
            replacement : "_"
        });
      }
    },
    overview : {
        type: String,
        trim: true
    },
    badges:{
        type : String,
        enum : Object.values(Badges)
    },
    specs :{
        type : Object
    },
    // number section 
    price : {
        type: Number,
        required: true,
        min : 50
    },
    appliedDiscount : {
        amount : {
            type : Number,
            min : 0,
            default : 0
        },
        type : {
            type : String,
            enum : Object.values(DiscountType),
            default : DiscountType.PERCENTAGE
        }
    },// saving price
    appliedPrice : { 
        type: Number,
        required: true,
        default : function() {
            return calculatePrice(this.price, this.appliedDiscount);
        }
    },// now > price or (price - discount)
    stock :{
        type: Number,
        required: true,
        min : 0
    },
    rating : {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    //Images
    images : {
        URLs:[{
            public_id : {
                type: String,
                required: true,
                unique : true
            },
            secure_url : {
                type: String,
                required: true
            }
        }],
        customId : {
            type: String,
            required: true,
            unique : true
        }
    },
    // IDs section 
    createdBy : {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: false, //TODO : make true when user added
    },
    categoryId : {
        type: Schema.Types.ObjectId,
        ref: "category",
        required: true,
    },
    subCategoryId : {
        type: Schema.Types.ObjectId,
        ref: "subCategory",
        required: true,
    },
    brandId :{
        type: Schema.Types.ObjectId,
        ref: "brand",
        required: true,
    }

},
  { timestamps: true }
);

// TODO:: mongoose.models.product -> to user model if exist not recreate model
export const productModel =
  mongoose.models.productModel || model("product", productSchema);
