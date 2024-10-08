import { DiscountType } from "./index.js";


export const calculatePrice = (price, discount)=>{
    let appliedPrice = price;

    if(discount.type === DiscountType.PERCENTAGE){
        appliedPrice = price - (price * discount.amount / 100) 
    }else if(discount.type === DiscountType.FIXED){
        appliedPrice = price - discount.amount;
    }

    return appliedPrice;
}