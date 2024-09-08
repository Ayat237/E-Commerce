import { couponType } from "../../src/Utils/index.js";
import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    couponAmount: {
      // value you will discount it
      type: Number,
      required: true,
    },
    couponType: {
      type: String,
      required: true,
      enum: Object.values(couponType),
    },
    from: {
      type: Date,
      required: true,
    },
    till: {
      type: Date,
      required: true,
    },
    users: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        maxCount: {
          type: Number,
          required: true,
          min: 1,
        },
        usageCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    isEnabled: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const couponModel =
  mongoose.models.couponModel || model("coupon", couponSchema);

// create coupon change logs model

const couponChangeLogSchema = new Schema(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "coupon",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    changes: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const couponChangeLogModel =
  mongoose.models.couponChangeLogModel ||
  model("couponChangeLog", couponChangeLogSchema);
