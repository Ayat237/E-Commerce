//modules
import { nanoid } from "nanoid";
import slugify from "slugify";
//middlewares
import { brandModel, categoryModel, productModel, subCategoryModel } from "../../../DB/Models/index.js";
//utils
import { ApiFeatureWithFind, ErrorClass } from "../../Utils/index.js";
import { cloudinaryConfig, uploadFile } from "../../Utils/index.js";

/**
 * @api {post} /subCategory/create  -add a new subCategory
 */
export const createSubCategory = async(req, res, next) => {
    //1- chack categoryId 
    const { categoryId } = req.query;
    const category = await categoryModel.findById(categoryId);
    if (!category) {
        return next(new ErrorClass("Category not found", 404, "Category not found"));
    }
    //2- destruct subCategory name
    const { name } = req.body;
    //3- generate slug
    const slug = slugify(name, {
        replacement: "_",
        lower: true,
    });
    //4- upload image
    const { file } = req;
    if (!file) { 
        return next(new ErrorClass("Image is required", 400, "Image is required"));
    }
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadFile({
        file : file.path,
        folder: `${process.env.UPLOADS_FOLDER}/categories/${category.customId}/subCategories/${customId}`,
    });
    
    const subCategories = {
        name,
        slug,
        Image: {
            secure_url,
            public_id,
        },
        customId,
        categoryId: category._id,
    }

    const newSubCategory = await subCategoryModel.create(subCategories);
    res.status(201).json({
        status: "success",
        message: "Subcategory created successfully",
        data: newSubCategory,
    });
}


/**
 * @api {get} /subCategory? -get subCategory by slug or id or name 
 */

export const getSubCategory = async(req, res, next) => {
    const { id, slug, name } = req.query;
    let queryFilter = {};
    if (id) {
        queryFilter._id = id 
    } else if (slug) {
        queryFilter.slug = slug
    } else if (name) {
        queryFilter.name = name
    } else {
        return next(new ErrorClass("Id, slug or name required", 400, "Id, slug or name required"));
    }

    const subCategory = await subCategoryModel.findOne(queryFilter);
    if (!subCategory) {
        return next(new ErrorClass("Subcategory not found", 404, "Subcategory not found"));
    }
    return res.status(200).json({
        status: "success",
        message: "Subcategory found successfully",
        data: subCategory,
    });
}


/**
 * @api {update} /subCategory/update/:id -update subCategory
 */

export const updateSubCategory = async(req, res, next) => {
   const {_id} = req.params;

   const subCategory = await subCategoryModel.findById(_id).populate("categoryId");
   if (!subCategory) {
       return next(new ErrorClass("Subcategory not found", 404, "Subcategory not found"));
   }

   const { name } = req.body;
   if (name) {
    const slug = slugify(name, {
        replacement: "_",
        lower: true,
    });
    subCategory.name = name;
    subCategory.slug = slug;
   };

   if(req.file){
    const splitedPublicId = subCategory.Image.public_id.split(`${subCategory.customId}/`)[1]
    const categoryCustomId = subCategory.categoryId.customId
    const subCategoryCustomId = subCategory.customId;
    const { secure_url } = await uploadFile({
      file : req.file.path,
      folder: `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/subcategories/${subCategoryCustomId}`,
      publicId: splitedPublicId}
    );
    subCategory.Image.secure_url = secure_url;
   }
   await subCategory.save();
   // response 
   res.json({
       status: "success",
       message: "Subcategory updated successfully",
       data: subCategory,
   });
}

/**
 * @api {delete} /subCategory/delete/:id -delete subCategory
 */

export const deleteSubCategory = async(req, res, next) => {
    const {_id} = req.params;
 
    const subCategory = await subCategoryModel.findByIdAndDelete(_id).populate("categoryId");
    if (!subCategory) {
        return next(new ErrorClass("Subcategory not found", 404, "Subcategory not found"));
    }
    const categoryCustomId = subCategory.categoryId.customId
    const subCategoryCustomId = subCategory.customId;
    const categoryPath = `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/subcategories/${subCategoryCustomId}`;
    // delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(categoryPath);
    // delete folder
    await cloudinaryConfig().api.delete_folder(categoryPath);

    //TODO :  delete relevant brands
    const deleteBrand = await brandModel.deleteMany({
        subCategoryId: _id,
    }) 
    if(deleteBrand.deletedCount){
        const deleteProduct = await productModel.deleteMany({
            subCategoryId: _id,
        }) 
    }//delete relevant products

    return res.status(200).json({
        status: "success",
        message: "Subcategory deleted successfully",
    });
  
 }


 /**
 * @api {get} /subCategory/all -Get all subCategories paginated with its brands 
 */
export const getAllSubCategoriesWithBrands = async(req, res, next) => {

    const mongooseQuery = subCategoryModel.find();
    const apiFeature = new ApiFeatureWithFind(mongooseQuery,req.query)
    .pagination();
    const subCategories = await apiFeature.mongooseQuery;
    // Fetch all subcategories
    const brands = await brandModel.find()
      .select("name subCategoryId")
      .populate("subCategoryId")
      .lean();
  
      // Map subcategories to their respective categories (return array of object )
    const subCategoryWithBrands = subCategories.map((subCategory) => {
      const matchingBrands = brands.filter(brand =>
        brand.subCategoryId._id.toString() === subCategory._id.toString());
      return {
        ...subCategory.toObject(),
        brands: matchingBrands
      };
    });
  
    return res.status(200).json({
        status: "success",
        message: "Categories and subcategories retrieved successfully",
        subCategoryWithBrands
    })
  }