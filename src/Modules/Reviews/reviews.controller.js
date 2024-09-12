/**
 * @api { POST } /reviews/create  - Create a new review
 */

import {
  orderModel,
  productModel,
  reviewModel,
} from "../../../DB/Models/index.js";
import { ErrorClass, orderStatus, reviewStatus } from "../../Utils/index.js";

export const createreview = async (req, res, next) => {
  // Destructuring the request body
  const userId = req.authUser._id;
  const { productId, content, reviewRating } = req.body;

  // check if user already reviewed on this
  const isAlreadyReviewed = await reviewModel.findOne({
    userId,
    productId,
  });
  if (isAlreadyReviewed) {
    return next(new ErrorClass("You have already reviewed this product", 400));
  }

  //check if product already exist
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ErrorClass("Product not found", 404));
  }

  //check if the user bought this product
  const isBought = await orderModel.findOne({
    userId,
    "products.productId": product._id,
    orderStatus: orderStatus.DELIVERED,
  });
  if (!isBought) {
    return next(new ErrorClass("You haven't purchased this product", 400));
  }

  // create a new review
  const newReview = new reviewModel({
    userId,
    productId,
    content,
    reviewRating,
  });
  await newReview.save();

  res.status(201).json({
    message: "Review created successfully",
    review: newReview,
  });
};

/**
 * @api { GET } /reviews/list/:productId  - Get all reviews for a specific product
 */

export const getProductReviews = async (req, res, next) => {
  const { productId } = req.params;
  const product = await productModel.findById(productId);
  if (!product) {
    return next(new ErrorClass("Product not found", 404));
  }
  const reviews = await reviewModel.find({ productId }).populate([
    {
      path: "userId",
      select: "username email -_id",
    },
    {
      path: "productId",
      select: "title rating -_id",
    },
  ]);
  res.json({
    status: "success",
    message: "Reviews retrieved successfully",
    data: reviews,
  });
};

export const approveOrRejectReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { Approved, Rejected } = req.body;
  if (Approved && Rejected) {
    return next(
      new ErrorClass("Only one of Approved or Rejected field can be true", 400)
    );
  }
  const review = await reviewModel.findByIdAndUpdate(
    reviewId,
    {
      reviewStatus: Approved
        ? reviewStatus.APPROVED
        : Rejected
        ? reviewStatus.REJECTED
        : reviewStatus.PENDING,
    },
    { new: true }
  );
  
  if (!review) {
    return next(new ErrorClass("Review not found", 404));
  }
  res.json({
    status: "success",
    message: `Review ${review.reviewStatus} successfully`,
    data: review,
  });
};
