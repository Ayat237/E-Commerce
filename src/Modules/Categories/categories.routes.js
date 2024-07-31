import { Router } from "express";
import * as CC from "./categories.controller.js";
import { errorHandler, multerHost} from "../../Middlewares/index.js";
import extensions from "../../Utils/file-extenstions.utils.js";
import { getDocumentByName } from "../../Middlewares/finders.middleware.js";
import { categoryModel } from "../../../DB/Models/index.js";
 const categoryRouter = Router();
 
categoryRouter.post ("/create",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(categoryModel),
  errorHandler(CC.createCategory)
)

categoryRouter.get ("/",
  errorHandler(CC.getCategory)
)

categoryRouter.put ("/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(categoryModel),
  errorHandler(CC.updateCategory)
)

categoryRouter.delete ("/delete/:_id",
  getDocumentByName(categoryModel),
  errorHandler(CC.deleteCategory)
)

export { categoryRouter };
