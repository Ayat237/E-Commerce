import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";
import { productModel } from "./product.model.js";
import { brandModel } from "./brand.model.js";

const subCategorySchema = new Schema(
  {
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
    Image: {
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
  },
  { timestamps: true }
);

subCategorySchema.post("findOneAndDelete",async function(){
  const _id = this.getQuery()._id;

  const deleteBrand = await brandModel.deleteMany({
    subCategoryId: _id,
  });

  if (deleteBrand.deletedCount) {
    const deleteProduct = await productModel.deleteMany({
      subCategoryId: _id,
    });
  } //delete relevant products
});


export const subCategoryModel =
  mongoose.models.subCategoryModel || model("subCategory", subCategorySchema);
