import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    overview : {
        type: String,
        trim: true
    },
    badges:{
        type : String,
        enum : ['new','sale','best seller'],
        default : 'new'
    },
    specs :{
        type : Object
    },
    price : {
        type: Number,
        required: true
    },
    appliedDiscount : {
        amount : {
            type : Number,
            default : 0
        },
        type : {
            type : String,
            enum : ['percentage','fixed'],
            default : 'percentage'
        }
    },
    appliedPrice : {
        type: Number,
        required: true
    },
    stock :{
        type: Number,
        required: true
    },
    rating : {
        type: Number,
        default: 0
    },
    Images : {
        URLs:[{
            secure_url : {
                type: String,
                required: true
            },
            public_id : {
                type: String,
                required: true
            }
        }
      ]
    },
    createdBy : {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
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
