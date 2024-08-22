import { brandModel } from "./brand.model.js";
import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";
import { productModel } from "./product.model.js";
import { subCategoryModel } from "./sub-category.model.js";

const categorySchema = new Schema(
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
  },
  { timestamps: true }
);

categorySchema.post("findOneAndDelete",async function(  ){
  const _id = this.getQuery()._id;
  //delete relevant subcategories
  const deleteSubCategory = await subCategoryModel.deleteMany({
  })
    categoryId: _id,

  console.log("subcategory deleted successfully");
  if(deleteSubCategory.deletedCount){
    const deleteBrand = await brandModel.deleteMany({
      categoryId : _id
    })//delete relevant brands
    console.log("brands deleted successfully");
    if(deleteBrand.deletedCount){
      const deleteProduct = await productModel.deleteMany({
        categoryId : _id
      })//delete relevant products
      console.log("product deleted successfully");
    }
  }

})

// TODO:: mongoose.models.category -> to user model if exist not recreate model
export const categoryModel =
  mongoose.models.categoryModel || model("category", categorySchema);
