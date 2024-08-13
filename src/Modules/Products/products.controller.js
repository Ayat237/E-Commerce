//modules
import { nanoid } from "nanoid";
import slugify from "slugify";
//middlewares
import { brandModel, productModel } from "../../../DB/Models/index.js";
//utils
import { ApiFeatureWithPlugin, calculatePrice, cloudinaryConfig, ErrorClass } from "../../Utils/index.js";
import { uploadFile } from "../../Utils/index.js";
  
/**
 * @api {post} /product/create  -add a new product
 */
export const createProduct = async (req, res, next) => {
  // Destructuring the request body
  const { name, overview, specs, price, discountAmount, discountType, stock } =
    req.body;

  // check req.files
  if (!req.files.length) {
    return next(new ErrorClass("Image is required", 400, "Image is required"));
  }

  //Ids check
  const brandDocumnet = req.document;
  console.log({brandDocumnet});

  /**
   * specs section
   * @example   {sizes : [50, 100], color:["red", "green"]}
   * stored in db  as object
   */

  //images section
  const URLs = [];
  const categoryCustomId = brandDocumnet.categoryId.customId;
  const subCategoryCustomId = brandDocumnet.subCategoryId.customId;
  const brandCustomId = brandDocumnet.customId;
  const customId = nanoid(4);
  const folder = `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/subcategories/${subCategoryCustomId}/brands/${brandCustomId}/products/${customId}`;

  for (const file of req.files) {
    // upload each file to cloudinary
    const { secure_url, public_id } = await uploadFile({
      file: file.path,
      folder,
    });
    // push all files to cloudinary
    URLs.push({ public_id, secure_url });
  }

  // create product document
  const product = {
    name,
    overview,
    specs: JSON.parse(specs),
    price,
    appliedDiscount: {
      amount: discountAmount,
      type: discountType,
    },
    //appliedPrice,
    stock,
    images: {
      URLs,
      customId,
    },
    brandId: brandDocumnet._id,
    categoryId: brandDocumnet.categoryId._id,
    subCategoryId: brandDocumnet.subCategoryId._id,
  };

  // save product to db
  const newProduct = await productModel.create(product);
  // send response
  return res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: newProduct,
  });
};

/**
 * @api {put} /product/update/:id  -update product
 */
export const updateProduct = async (req, res, next) => {
  // Destructuring the request params
  const { productId } = req.params;

  // find the product
  const product = await productModel.findById(productId).populate([
    {
      path: "categoryId",
    },
    {
      path: "subCategoryId",
    },
    {
      path: "brandId",
    },
  ]);
  if (!product) {
    return next(new ErrorClass("Product not found", 404, "Product not found"));
  }
  // distructing  the req body
  const {
    name,
    stock,
    overview,
    badge,
    price,
    discountAmount,
    discountType,
    specs,
  } = req.body;

  if (name) {
    const slug = slugify(name, {
      lower: true,
      replacement: "_",
    });
    product.name = name;
    product.slug = slug;
  }

  if (stock) {
    product.stock = stock;
  }
  if (overview) {
    product.overview = overview;
  }
  if (badge) {
    product.badge = badge;
  }
  if (price || discountAmount || discountType) {
    const newPrice = price || product.price;
    const discount = {};
    discount.amount = discountAmount || product.appliedDiscount.amount;
    discount.type = discountType || product.appliedDiscount.type;

    product.appliedPrice = calculatePrice(newPrice, discount);
    product.appliedDiscount = discount;
    product.price = newPrice;
  }

  /**
   * specs = {sizes : ['S','M','L'], color:["red", "green"], height: "10cm"}
   * cases =>- add new key
   *         - increase existing key
   *         - remove existing key
   */
  if (specs) {
    product.specs = JSON.parse(specs);
  }

  // update image
  if (req.files) {
    const categoryCustomId = product.categoryId.customId;
    const subCategoryCustomId = product.subCategoryId.customId;
    const brandCustomId = product.brandId.customId;
    const productCustomId = product.images.customId;
    const folder = `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/subcategories/${subCategoryCustomId}/brands/${brandCustomId}/products/${productCustomId}`;

    for (const file of req.files) {
      let splitedPublicId = null;
      //const splitedPublicId = product.images.URLs.public_id.split(`${product.CustomId}/`)[1]
      // Iterate through product.images.URLs to find the matching public_id
      for (const URLobj of product.images.URLs) {
        if (URLobj.public_id.includes(`${productCustomId}/`)) {
          splitedPublicId = URLobj.public_id.split(`${productCustomId}/`)[1];
          break; // Exit the loop once the matching public_id is found
        }
      }
      // upload each file to cloudinary
      const { secure_url, public_id } = await uploadFile({
        file: file.path,
        folder,
        publicId: splitedPublicId,
      });
      // Update the secure_url in the existing product.images.URLs array
      const imageIndex = product.images.URLs.findIndex(
        (img) => img.public_id === public_id
      );
      if (imageIndex !== -1) {
        product.images.URLs[imageIndex].secure_url = secure_url;
      } else {
        // If the public_id is not found, push new URL object
        product.images.URLs.push({ public_id, secure_url });
      }
    }
  }

  // save updated product to db
  await product.save();

  // send response
  return res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: product,
  });
};

/**
 * @api {get} /product/list/  -get product
 */
export const getAllProduct = async (req, res, next) => {
  const mongooseQuery = productModel;
  const apiFeature = new ApiFeatureWithPlugin(mongooseQuery,req.query)
  .pagination()
  .sort()
  .filters();

  const products =  await apiFeature.mongooseQuery;
  return res.status(200).json({
    status: "success",
    message: "Product retrieved successfully",
    data: await products,
  });
};


/**
 * @api {delete} /product/delete/:id  -get product
 */

export const deleteProduct = async (req, res, next) => {
    const { productId } = req.params;

    // find the product
    const product = await productModel.findByIdAndDelete(productId).populate(
        [{
            path: "categoryId",
            select: "customId"
        },{
            path: "subCategoryId",
            select: "customId"
        },{
            path: "brandId",
            select: "customId"
        }]);
    if (!product) {
        return next(new ErrorClass("Product not found", 404, "Product not found"));
    }
    const categoryCustomId = product.categoryId.customId;
    const subCategoryCustomId = product.subCategoryId.customId;
    const brandCustomId = product.brandId.customId;
    const productCustomId = product.images.customId;
    const productPath = `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/subcategories/${subCategoryCustomId}/brands/${brandCustomId}/products/${productCustomId}`;

    console.log(productPath);
    // delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(productPath);
    // delete folder
    await cloudinaryConfig().api.delete_folder(productPath);

    // send response
    return res.status(200).json({
        status: "success",
        message: "Product deleted successfully",
    });
};