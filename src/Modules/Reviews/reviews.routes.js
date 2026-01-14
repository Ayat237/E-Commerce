import { Router } from "express";
import * as controller from "./reviews.controller.js";
import {
  authenticatation,
  autherization,
  errorHandler,
  validation,
} from "../../Middlewares/index.js";
import { systemRoles } from "../../Utils/system-roles.utils.js";
const reviewRouter = Router();

reviewRouter.post(
  "/create",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  //errorHandler(validation(valid.createreviewSchema)),
  errorHandler(controller.createreview)
);

reviewRouter.get(
  "/:productId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  //errorHandler(validation(valid.createreviewSchema)),
  errorHandler(controller.getProductReviews)
);

reviewRouter.put(
  "/Approve_Reject/:reviewId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.ADMIN)),
  //errorHandler(validation(valid.createreviewSchema)),
  errorHandler(controller.approveOrRejectReview)
);

  

export { reviewRouter };
