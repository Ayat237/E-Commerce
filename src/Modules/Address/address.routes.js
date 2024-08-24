import { Router } from "express";
import * as controller from "./address.controller.js";
import {
  authenticatation,
  autherization,
  errorHandler,
} from "../../Middlewares/index.js";
import { systemRoles } from "../../Utils/system-roles.utils.js";

const addressRouter = Router();

addressRouter.post(
  "/add",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  errorHandler(controller.addAddress)
);

addressRouter.put(
  "/edit/:addressId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  errorHandler(controller.updateAddress)
);

addressRouter.put(
  "/delete/:addressId",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  errorHandler(controller.deleteAddress)
);

addressRouter.get(
  "/",
  errorHandler(authenticatation()),
  errorHandler(autherization(systemRoles.USER)),
  errorHandler(controller.getAddresses)
);
export { addressRouter };
