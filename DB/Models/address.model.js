import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";

const addressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: Number,
      required: true,
    },
    buildingNumber: {
      type: Number,
      required: true,
    },
    floorNumber: {
      type: Number,
      required: true,
    },
    addressLabel: String,
    isDefault: {
      type: Boolean,
      default: false,
    },
    isMarkedAsDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const addressModel = mongoose.models.addressModel || model("address", addressSchema);
