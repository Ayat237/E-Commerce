//modules
import { nanoid } from "nanoid";
import slugify from "slugify";
//middlewares
import { brandModel, categoryModel, productModel, subCategoryModel } from "../../../DB/Models/index.js";
//utils
import { ErrorClass } from "../../Utils/index.js";
import { cloudinaryConfig, uploadFile } from "../../Utils/index.js";

/**
 * @api {post} /category/create  -add a new category
 */
export const createCategory = async (req, res, next) => {
  // destructuring the request body
  const { name } = req.body;

  // Generating category slug
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });
  // Image
  if (!req.file) {
    return next(new ErrorClass("Image is required", 400, "Image is required"));
  }
  // upload the image to cloudinary
  const customId = nanoid(4);
  const { secure_url,public_id} = await uploadFile({
      file : req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/categories/${customId}`,
      }
  );
  // prepare category object
  const category = {
    name,
    slug,
    Image: {
      secure_url,
      public_id,
    },
    customId,
  };

  // Create a new category object
  const newCategory = await categoryModel.create(category);

  // Send the response
  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: newCategory,
  });
};


/**
 * @api {get} /category  -get category
 */
export const getCategory = async (req, res, next) => {
  const { id , name , slug } = req.query;

  const queryFilter = {};
  if(id) { queryFilter.id= id}
  if(name) { queryFilter.name= name}
  if(slug) { queryFilter.slug= slug}

  const  category = await categoryModel.findOne(queryFilter);

  if(!category) {
    return next(new ErrorClass("Category not found", 404, "Category not found"));
  };

  res.status(200).json({
    status: "success",
    message: "Category retrieved successfully",
    data: category,
  });
};


/**
 * @api {put} /category/update/:_id  -update category
 */
export const updateCategory = async (req, res, next) => {
  const { _id } = req.params

  //find the category 
  const category = await categoryModel.findById(_id);
  if(!category) {
    return next(new ErrorClass("Category not found", 404, "Category not found"));
  };
  // destructuring the request body
  const { name , public_id_new} = req.body;

  if(name) {
    // Generating category slug
    const slug = slugify(name, {
      replacement: "_",
      lower: true,
  });

   category.name = name;
   category.slug = slug;
  }

  //update Image
  if(req.file){
    const splitedPublicId = category.Image.public_id.split(`${category.customId}/`)[1]
    const { secure_url } = await uploadFile({
      file : req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/categories/${category.customId}`,
      publicId: splitedPublicId}
  );
    category.Image.secure_url = secure_url;
  }
 
  await category.save();
  // Send the response
  res.status(200).json({
    status: "success",
    message: "Category updated successfully",
    data: category,
  });
};


/**
 * @api {delete} /category/delete/:_id  -delete category
 */
export const deleteCategory = async (req, res, next) => {
  const { _id } = req.params

  //find the category 
  const category = await categoryModel.findByIdAndDelete(_id);
  if(!category) {
    return next(new ErrorClass("Category not found", 404, "Category not found"));
  };

  const categoryPath = `${process.env.UPLOADS_FOLDER}/categories/${category.customId}`;
  // delete image from cloudinary
  await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
  // delete folder
  await cloudinaryConfig().api.delete_folder(categoryPath);

  //delete relevant subcategories
  const deleteSubCategory = await subCategoryModel.deleteMany({
    categoryId: _id,
  })
  //delete relevant brands
  if(deleteSubCategory.deletedCount){
    const deleteBrand = await brandModel.deleteMany({
      categoryId : _id
    })//delete relevant brands
    if(deleteBrand.deletedCount){
      const deleteProduct = await productModel.deleteMany({
        categoryId : _id
      })//delete relevant products
    }
  }
  //TODO :  delete relevant products
  
  // Send the response
  res.status(200).json({
    status: "success",
    message: "Category deleted successfully",
  });
};


/**
 * @api {get} /subCategory/all -Get all categories paginated with its subcatgories subCategory
 */
export const getAllCategoriesWithSubCategories = async(req, res, next) => {
  const { page = 1, limit = 2 } = req.query;
  const skip = (page - 1) * limit;
  // Get relevant categories with pagination
  const categories = await categoryModel.find()
  .limit(limit)
  .skip(skip)
  .select('name')

  // Fetch all subcategories
  const subCategories = await subCategoryModel.find()
    .select("name categoryId")
    .populate("categoryId")

    // Map subcategories to their respective categories (return array of object )
  const categoryWithSubCategories = categories.map((category) => {
    const matchingSubCategories = subCategories.filter(subCategory =>
      subCategory.categoryId._id.toString() === category._id.toString());
    return {
      ...category.toObject(),
      subCategories: matchingSubCategories.map(subCategory => subCategory.toObject())
    };
  });

  return res.status(200).json({
      status: "success",
      message: "Categories and subcategories retrieved successfully",
      data: {
        categoryWithSubCategories
      },
  })
}