import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const brandSchema = new Schema(
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

// TODO:: mongoose.models.brand -> to user model if exist not recreate model
export const brandModel =
  mongoose.models.brandModel || model("brand", brandSchema);
