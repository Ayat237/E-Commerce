import { Router } from "express";
import * as controller from "./cart.controller.js";
import {
  authenticatation,
  autherization,
  errorHandler,
} from "../../Middlewares/index.js";
import { systemRoles } from "../../Utils/system-roles.utils.js";

const cartRouter = Router();

cartRouter.post(
  "/add/:productId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  errorHandler(controller.addToCart)
);

cartRouter.put(
  "/remove/:productId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  errorHandler(controller.removeFromCart)
);

cartRouter.put(
  "/edit/:productId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  errorHandler(controller.updateCart)
);

cartRouter.get(
  "/",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  errorHandler(controller.getCart));
export { cartRouter };
