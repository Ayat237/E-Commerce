/**
 * coupon expired
 * max count
 * is enabled => false
 * from not come yet
 * no assigned user
 * coupon code error
 */

import { DateTime } from "luxon";
import { couponModel } from "../../../../DB/Models/index.js";
import { DiscountType } from "../../../Utils/enums.utils.js";

/**
 *
 * @param {*} couponCode
 * @param {*} userId
 * @returns { Message : string , Error : Boolean , coupon : object}
 */
export const couponValidation = async (couponCode, userId) => {
  //get coupon by couponCode
  const coupon = await couponModel.findOne({ couponCode });
  // if coupon not found return error message
  if (!coupon) {
    return { message: "Coupon not found", error: true };
  }
  // if coupon is expired return error message
  if (!coupon.isEnabled || DateTime.now() > DateTime.fromJSDate(coupon.till)) {
    return { message: "Coupon expired", error: true };
  }
  // if coupon max count reached return error message
  if (coupon.maxCount < coupon.usageCount) {
    return { message: "Coupon max count reached", error: true };
  }

  if (DateTime.now() < DateTime.fromJSDate(coupon.from)) {
    return {
      message: `Coupon is not available yet, it will start at ${coupon.from}`,
      error: true,
    };
  }

  // if coupon is assigned to user return error message
  const isUserAssigned = coupon.users.some(
    (u) => u.userId.toString() === userId.toString() && u.maxCount > u.usageCount);
    
  if (!isUserAssigned) {
    return { message: "Coupon is not assigned to you or you redeem all your tries", error: true };
  }
  return { message: "your coupon is valid", error: false, coupon };
};



export const applyCoupon = (subTotal, coupon)=>{
    let total = subTotal;
    const {couponAmount : discountAmount, couponType : discountType} = coupon;
    if(discountAmount && discountType){
        if(discountType === DiscountType.PERCENTAGE){
            total = subTotal - (subTotal * discountAmount / 100) 
        }else if(discountAmount === DiscountType.FIXED){
            if(discountAmount > subTotal)
            {
                return total;
            }
            total = subTotal - discountAmount;
        }
    }
    return total;
}