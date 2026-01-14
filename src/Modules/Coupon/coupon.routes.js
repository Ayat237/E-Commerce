import { Router } from "express";
import * as controller from "./coupon.controller.js";
import {
  authenticatation,
  autherization,
  errorHandler,
  validation,
} from "../../Middlewares/index.js";
import { systemRoles } from "../../Utils/system-roles.utils.js";
import * as valid from "./coupon.schema.js";

const couponRouter = Router();

couponRouter.post(
  "/create",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.ADMIN)),
  errorHandler(validation(valid.createCouponSchema)),
  errorHandler(controller.createCoupon)
);
couponRouter.get(
  "/",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.ADMIN)),
  errorHandler(controller.getAllCoupons)
);

couponRouter.get(
  "/:couponId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.ADMIN)),
  errorHandler(controller.getCouponById)
);

couponRouter.put(
  "/update/:couponId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.ADMIN)),
  errorHandler(validation(valid.updateCouponSchema)),
  errorHandler(controller.updateCoupon)
);

couponRouter.patch(
  "/enable/:couponId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.ADMIN)),
  errorHandler(validation(valid.disableEnableCouponSchema)),
  errorHandler(controller.disableEnableCoupon)
);
export { couponRouter };
