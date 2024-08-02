import { Router } from "express";
import * as SCC from "./sub-categories.controller.js"
import extensions from "../../Utils/file-extenstions.utils.js";
import { getDocumentByName } from "../../Middlewares/finders.middleware.js";
import { errorHandler, multerHost } from "../../Middlewares/index.js";
import { subCategoryModel } from "../../../DB/Models/sub-category.model.js";

const subCategoryRouter = Router();

subCategoryRouter.post ("/create",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(subCategoryModel),
    errorHandler(SCC.createSubCategory)
)
subCategoryRouter.get ("/",
    errorHandler(SCC.getSubCategory)
);

subCategoryRouter.put ("/update/:_id",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(subCategoryModel),
    errorHandler(SCC.updateSubCategory)
)

subCategoryRouter.delete ("/delete/:_id",
    errorHandler(SCC.deleteSubCategory)
)

subCategoryRouter.get ("/all",
    errorHandler(SCC.getAllSubCategoriesWithBrands)
);
export { subCategoryRouter };
 