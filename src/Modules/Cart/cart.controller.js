import { cartModel, productModel } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";
import { checkProductStoke } from "./Utils/cart.utils.js";

/**
 * @api { POST } /cart/Add -Add to cart
 */
export const addToCart = async (req, res, next) => {
  const { quantity } = req.body;
  const userId = req.authUser._id;
  const { productId } = req.params;
  const product = await checkProductStoke(productId, quantity);
  if (!product) {
    return next(
      new ErrorClass(
        "Product not available or out of stock",
        404,
        "Product not available or out of stock"
      )
    );
  }

  const cart = await cartModel.findOne({ userId });
  //if cart not found
  if (!cart) {
    const newCart = new cartModel({
      userId,
      products: [
        {
          productId: product._id,
          quantity,
          price: product.appliedPrice,
        },
      ]
    });

    await newCart.save();

    return res.status(201).json({
      status: "success",
      message: "Product added to cart successfully",
      data: newCart,
    });
  }
  //if cart is already exist
  const productInCart = cart.products.find(
    (item) => item.productId.toString() === productId
  );
  if (productInCart) {
    return next(new ErrorClass("product is already in cart", 400));
  } else {
    cart.products.push({
      productId: product._id,
      quantity,
      price: product.appliedPrice,
    });
  }
  await cart.save();

  return res.status(201).json({
    status: "success",
    message: "Product added to cart successfully",
    data: cart,
  });
};

/**
 * @api { PUT } /cart/update -Update  quantity
 */
export const updateCart = async (req, res, next) => {
  const { quantity } = req.body;
  const userId = req.authUser._id;
  const { productId } = req.params;

  const cart = await cartModel.findOne({
    userId,
    "products.productId": productId,
  });
  if (!cart) {
    return next(new ErrorClass("Product not found in cart", 404));
  }

  const product = await checkProductStoke(productId, quantity);
  if (!product) {
    return next(
      new ErrorClass(
        "Product not available or out of stock",
        404,
        "Product not available or out of stock"
      )
    );
  }
  const productIndex = cart.products.findIndex(
    (p) => p.productId.toString() == product._id.toString()
  );
  console.log({ productIndex });

  cart.products[productIndex].quantity = quantity;

  await cart.save();
  return res.status(200).json({
    status: "success",
    message: "Cart updated successfully",
    data: cart,
  });
};
/**
 * @api { GET } /cart -get carts products
 */
export const getCart = async (req, res, next) => {
  const userId = req.authUser._id;

  const cart = await cartModel
    .findOne({ userId })
    .populate([{ path: "products.productId", select: "name overview specs -_id" }]);

  return res.status(200).json({
    status: "success",
    message: "Cart products retrieved successfully",
    data: cart,
  });
};

/**
 * @api { PUT } /cart/remove -Remove from cart
 */
export const removeFromCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;

  const cart = await cartModel.findOne({
    userId,
    "products.productId": productId,
  });
  if (!cart) {
    return next(new ErrorClass("Product not found in cart", 404));
  }
  cart.products = cart.products.filter(
    (product) => product.productId != productId
  );

  await cart.save();
  return res.status(200).json({
    status: "success",
    message: "Product removed from cart successfully",
  });
};
