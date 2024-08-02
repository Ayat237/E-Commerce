import { Router } from "express";
import * as BC from "./brands.controller.js"
import { errorHandler, multerHost } from "../../Middlewares/index.js";
import extensions from "../../Utils/file-extenstions.utils.js";
import { brandModel } from "../../../DB/Models/index.js";
import { getDocumentByName } from "../../Middlewares/finders.middleware.js";
const brandRouter = Router();


brandRouter.post ("/create",
    multerHost({ allowedExtensions: extensions.Images }).single("logo"),
    getDocumentByName(brandModel),
    errorHandler(BC.createBrand)
)

brandRouter.get ("/",
    errorHandler(BC.getBrand)
)

brandRouter.put ("/update/:_id",
    multerHost({ allowedExtensions: extensions.Images }).single("logo"),
    getDocumentByName(brandModel),
    errorHandler(BC.updateBrand)
)

brandRouter.delete ("/delete/:_id",
    errorHandler(BC.deleteBrand)
)

brandRouter.get ("/all",
    errorHandler(BC.getAllBrandsWithProducts)
)

brandRouter.get ("/specific",
    errorHandler(BC.getSpecificBrands)
)


export { brandRouter };
