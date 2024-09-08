import { DateTime } from "luxon";
import { addressModel } from "../../../DB/Models/address.model.js";
import { cartModel } from "../../../DB/Models/cart.model.js";
import { orderModel } from "../../../DB/Models/order.model.js";
import { orderStatus, paymentMethods } from "../../Utils/enums.utils.js";
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { calculateSubTotal } from "../Cart/Utils/cart.utils.js";
import {
  applyCoupon,
  couponValidation,
} from "./Utils/coupon-validation.utils.js";
import { productModel } from "../../../DB/Models/product.model.js";
import { couponModel } from "../../../DB/Models/coupon.model.js";
import {
  ApiFeatureWithFind,
  ApiFeatureWithPlugin,
} from "../../Utils/Api_Feature.utils.js";

export const createOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const {
    address,
    addressId,
    contactNumber,
    shippingFee,
    VAT,
    paymentMethod,
    couponCode,
  } = req.body;

  const cart = await cartModel
    .findOne({ userId })
    .populate("products.productId");
  if (!cart || !cart.products.length) {
    return next(new ErrorClass("Cart is empty", 400, "Cart is empty"));
  }

  // check if any product is sold out
  const issoldOut = cart.products.find((p) => p.productId.stock < p.quantity);
  if (issoldOut) {
    return next(
      new ErrorClass(
        `Product ${issoldOut.productId.title}is sold out`,
        400,
        `${issoldOut.productId.name} is sold out`
      )
    );
  }
  // calculate new total price
  const subtotal = calculateSubTotal(cart.products);
  let total = subtotal + shippingFee + VAT;

  // apply coupon code if available
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, userId);

    if (isCouponValid.error) {
      return next(
        new ErrorClass(isCouponValid.message, 400, isCouponValid.message)
      );
    }
    coupon = isCouponValid.coupon;
    total = applyCoupon(subtotal, coupon);
  }

  if (!address && !addressId) {
    return next(
      new ErrorClass("Address is required", 400, "Address is required")
    );
  }

  // check if address exists and is valid
  if (addressId) {
    const addressInfo = await addressModel.findOne({ addressId });
    if (!addressInfo) {
      return next(
        new ErrorClass("Address not found", 404, "Address not found")
      );
    }
  }
  let orderstatus = orderStatus.PENDING;
  if (paymentMethod == paymentMethods.Cash) {
    orderstatus = orderStatus.PLACED;
  }

  const order = new orderModel({
    userId,
    contactNumber,
    address,
    addressId,
    shippingFee,
    VAT,
    total,
    subTotal: subtotal,
    paymentMethod,
    couponId: coupon?._id,
    orderStatus: orderstatus,
    products: cart.products,
    arrivalEstimateTime: DateTime.now()
      .plus({ days: 7 })
      .toFormat("yyyy-MM-dd"),
  });

  await order.save();

  //clear cart
  cart.products = [];
  await cart.save();
  // decrement stock of product => hooks

  // increment usageCount of coupon if coupon is available => hooks

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: order,
  });
};

/**
 * @api {PUT} /order/cancel/:orderId - cancel the order
 */

export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.authUser._id;
  const order = await orderModel.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [orderStatus.PENDING, orderStatus.PLACED, orderStatus.CONFIRMED],
    },
  });
  if (!order) {
    return next(new ErrorClass("Order not found", 404, "Order not found"));
  }

  //check if order i bought before 3 days ag0
  const orderDate = DateTime.fromJSDate(order.createdAt);
  const currentDate = DateTime.now();
  const timeDifference = Math.ceil(
    Number(currentDate.diff(orderDate, "days").toObject().days)
  );
  if (timeDifference > 3) {
    return next(
      new ErrorClass(
        "You cannot cancel the order. You have made this order more than 3 days ago.",
        400,
        "You cannot cancel the order"
      )
    );
  }

  order.orderStatus = orderStatus.CANCELLED;
  order.canceledAt = DateTime.now();
  order.canceledBy = userId;

  await orderModel.updateOne({ _id: order._id }, order, { new: true });

  for (const product of order.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: +product.quantity } },
      { new: true }
    );
    if (order.couponId) {
      const coupon = await couponModel.findById(order.couponId);
      let usageCounts = coupon.users.find(
        (u) => u.userId.toString() === order.userId.toString()
      ).usageCount;
      if (usageCounts <= 0) {
        return next(
          new ErrorClass("Coupon usage is zero", 400, "Coupon usage is zero")
        );
      }
      usageCounts--;
      await coupon.save();
    }
  }

  res.status(200).json({
    status: "success",
    message: "Order canceled successfully",
    data: order,
  });
};

/**
 * @api {PUT} /order/deliver/:orderId - deliver the order
 */

export const deliverOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.authUser._id;
  const order = await orderModel.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [orderStatus.PLACED, orderStatus.CONFIRMED],
    },
  });
  if (!order) {
    return next(new ErrorClass("Order not found", 404, "Order not found"));
  }

  order.orderStatus = orderStatus.DELIVERED;
  order.deliverdAt = DateTime.now();
  order.deliverdBy = userId;

  await orderModel.updateOne({ _id: order._id }, order, { new: true });

  res.status(200).json({
    status: "success",
    message: "Order delivered successfully",
    data: order,
  });
};

/**
 * @api {GET} /order/my - get my orders
 */

export const listOrders = async (req, res, next) => {
  const userId = req.authUser._id;

  const populateArray = [
    {
      path: "products.productId",
      select: " title overview appliedPrice stock rating ",
      model: "product",
    },
  ];

  const mongooseQuery = orderModel.find().populate(populateArray);

  const apiFeature = new ApiFeatureWithFind(
    mongooseQuery,
    req.query
  ).pagination();

  const orders = await apiFeature.mongooseQuery;

  res.status(200).json({
    status: "success",
    message: "Orders retrieved successfully",
    data: orders,
  });
};
