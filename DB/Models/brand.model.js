import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";
import { productModel } from "./product.model.js";

const brandSchema = new Schema(
  {
    // strings  section 
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: false, // TODO: Change to true after adding authentication
    },
    logo: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
        unique: true,
      },
    },
    customId: {
      type: String,
      required: true,
      unique: true,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "category",
        required: true,
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "subCategory",
        required: true,
    }
},
  { timestamps: true }
);

brandSchema.post("findOneAndDelete",async function(){
  const _id = this.getQuery()._id;
  const deleteProduct  = await productModel.deleteMany({
    brandId : _id,
  }) 
})

export const brandModel =
  mongoose.models.brandModel || model("brand", brandSchema);
