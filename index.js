import express from "express";
import { config } from "dotenv";
import { globaleResponse } from "./src/Middlewares/index.js";
import db_connection from "./DB/connection.js";
import * as router from "./src/Modules/index.js";
import { ErrorClass } from "./src/Utils/error-class.utils.js";

config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/categories", router.categoryRouter);
app.use("/products", router.productRouter);
app.use("/subCategories", router.subCategoryRouter);
app.use("/brands", router.brandRouter);
app.use("/user", router.userRouter);
app.use("/address", router.addressRouter);


app.use('/*', (req, res,next) =>{
    return next(new ErrorClass(`Invalid URL : ${req.originalUrl}`,404))
})
app.use(globaleResponse);

db_connection();

app.listen(port, () => console.log(`app listening on port ${port}!`));
