import { productModel } from "../../../../DB/Models/index.js";

export const checkProductStoke = async (productId, quantity) => {
  return await productModel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });
};

export const calculateSubTotal = (products) => {
  let subTotal = 0;
  products.forEach((element) => {
    subTotal += element.price * element.quantity;
  });

  return subTotal;
};
