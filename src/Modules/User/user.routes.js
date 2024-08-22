import { Router } from "express";
import * as controller from "./user.controller.js";
import {
  authenticatation,
  autherization,
  errorHandler,
} from "../../Middlewares/index.js";

const userRouter = Router();

userRouter.post("/signUp", errorHandler(controller.signUp));

userRouter.post("/login", errorHandler(controller.Login));

userRouter.put(
  "/update",
  errorHandler(authenticatation()),
  errorHandler(controller.updateAccount)
);

userRouter.patch(
  "/sendCode",
  errorHandler(authenticatation()),
  errorHandler(controller.forgetPassword)
);

userRouter.patch(
  "/resetPassword",
  errorHandler(authenticatation()),
  errorHandler(controller.resetPassword)
);

userRouter.get(
  "/profile",
  errorHandler(authenticatation()),
  errorHandler(controller.getProfile)
);

userRouter.patch(
  "/delete",
  errorHandler(authenticatation()),
  errorHandler(controller.deleteAccount)
);


userRouter.get(
  "/confirmEmail/:token",
  errorHandler(controller.isEmailConfirmed)
);

userRouter.get(
  "/refreshConfirmation/:rfToken",
  errorHandler(controller.refreshToken)
);

export { userRouter };
