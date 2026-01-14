import {
  reviewStatus,
} from "../../src/Utils/index.js";
import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    reviewRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    content: {
      type: String,
    },
    reviewStatus: {
      type: String,
      enum: Object.values(reviewStatus),
      default: reviewStatus.PENDING,
    },
    ActionDoneBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

export const reviewModel =
  mongoose.models.reviewModel || model("review", reviewSchema);
