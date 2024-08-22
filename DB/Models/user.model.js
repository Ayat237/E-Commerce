import { systemRoles } from "../../src/Utils/system-roles.utils.js";
import mongoose from "./global-setup.js";
import { Schema, model } from "mongoose";
import { hashSync } from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      // TODO:: hash password before storing it
    },
    phoneNumbers: {
      type: [String],
    },
    // addres: {
    //     type: String,
    //     required: true,
    //     trim: true,
    // },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 99,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    userType: {
      type: String,
      required: true,
      enum: Object.values(systemRoles),
      default: systemRoles.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isDeletedAsMarked: {
      type: Boolean,
      default: false,
    },
    code : String
  },
  { timestamps: true }
);
userSchema.pre("save", function (next) {
    if(this.isModified("password")){
        this.password = hashSync(this.password, +process.env.SALT_ROUND);   
    } 
    next();
});
export const userModel = mongoose.models.userModel || model("user", userSchema);
