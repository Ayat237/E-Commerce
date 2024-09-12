import { Router } from "express";
import * as controller from "./order.controller.js";
import {
  authenticatation,
  autherization,
  errorHandler,
  validation,
} from "../../Middlewares/index.js";
import { systemRoles } from "../../Utils/system-roles.utils.js";
import * as valid from "./order.schema.js";

const orderRouter = Router();

orderRouter.post(
  "/create",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  //errorHandler(validation(valid.createorderSchema)),
  errorHandler(controller.createOrder)
);

orderRouter.put(
  "/cancel/:orderId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  //errorHandler(validation(valid.createorderSchema)),
  errorHandler(controller.cancelOrder)
);

orderRouter.put(
  "/deliver/:orderId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  //errorHandler(validation(valid.createorderSchema)),
  errorHandler(controller.deliverOrder)
);

orderRouter.get(
  "/",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  //errorHandler(validation(valid.createorderSchema)),
  errorHandler(controller.listOrders)
);

orderRouter.post(
  "/stripePay/:orderId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  //errorHandler(validation(valid.createorderSchema)),
  errorHandler(controller.paymentWithStripe)
);

orderRouter.post(
  "/webhook",
  errorHandler(controller.stripWebHook)
);

orderRouter.post(
  "/refund/:orderId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.ADMIN)),
  //errorHandler(validation(valid.createorderSchema)),
  errorHandler(controller.refundPaymentData)
);

export { orderRouter };
