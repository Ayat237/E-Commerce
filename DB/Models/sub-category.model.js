import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";

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
    categoryId : {
        type: Schema.Types.ObjectId,
        ref: "category",
        required: true
    }
  },
  { timestamps: true }
);

// TODO:: mongoose.models.category -> to user model if exist not recreate model
export const subCategoryModel =
  mongoose.models.subCategoryModel || model("subCategory", subCategorySchema);
