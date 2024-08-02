import { Router } from "express";
// controllers
import * as PC from "./products.controller.js";
// middlewares
import { errorHandler, multerHost } from "../../Middlewares/index.js";
import { getDocumentByName,idsExistChcek } from "../../Middlewares/finders.middleware.js";
// utils
import extensions from "../../Utils/file-extenstions.utils.js";
// models
import { brandModel, productModel } from "../../../DB/Models/index.js";

const productRouter = Router();

productRouter.post(
  "/create",
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  idsExistChcek(
    brandModel,
    [
      { path: "categoryId", select: "customId" },
      { path: "subCategoryId", select: "customId" },
    ]
  ),
  errorHandler(PC.createProduct)
);

productRouter.put(
  "/update/:productId",
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  errorHandler(PC.updateProduct)
);

productRouter.get("/list", errorHandler(PC.getAllProduct));

productRouter.delete(
  "/delete/:productId",
  errorHandler(PC.deleteProduct)
);


export { productRouter };
