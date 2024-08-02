//modules
import { nanoid } from "nanoid";
import slugify from "slugify";
//middlewares
import { brandModel, categoryModel, productModel, subCategoryModel } from "../../../DB/Models/index.js";
//utils
import { ErrorClass } from "../../Utils/index.js";
import { cloudinaryConfig, uploadFile } from "../../Utils/index.js";

/**
 * @api {post} /brands/create -create new brand
 */
export const createBrand = async (req, res, next) => {
    const { categoryId , subCategoryId} = req.query;

    const SubCategory = await subCategoryModel.findById({
        _id: subCategoryId,
        categoryId: categoryId
    }).populate("categoryId");

    if (!SubCategory) {
        return next(new ErrorClass("Sub-category not found", 404, "Sub-category not found"));
    }
    // Destructuring request body
    const { name } = req.body;
    const slug = slugify(name,{
        replacement: "_",
        lower: true,
    });

    const { file } = req;
    if (!file) { 
        return next(new ErrorClass("Image is required", 400, "Image is required"));
    }
    const categoryCustomId = SubCategory.categoryId.customId
    const subCategoryCustomId = SubCategory.customId;
    const customId = nanoid(4);
    const { secure_url, public_id } = await uploadFile({
        file : file.path,
        folder: `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/subCategories/${subCategoryCustomId}/brands/${customId}`,
    });

    const brand ={
        name,
        slug,
        logo: {
            secure_url,
            public_id
        },
        categoryId: SubCategory.categoryId._id ,
        subCategoryId: SubCategory._id ,
        customId
    };
    
    // Create and save the new brand in the database
    const newBrand = await brandModel.create(brand);
    
    // Send the response
    res.status(201).json({
        status: "success",
        message: "Brand created successfully",
        data: newBrand
    });
}


/**
 * @api {get} /brands? -get brands by slug or id or name 
 */
export const getBrand = async(req, res, next) => {
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

    const brand = await brandModel.findOne(queryFilter);
    if (!brand) {
        return next(new ErrorClass("brand not found", 404, "brand not found"));
    }
    return res.status(200).json({
        status: "success",
        message: "brand found successfully",
        data: brand,
    });
}


/**
 * @api {put} /brands/update/:_id -update brand
 */
export const updateBrand = async(req, res, next) => {
    const { _id } = req.params;
    const brand = await brandModel.findById(_id).populate([{
        path: "categoryId",
    },{
        path: "subCategoryId",
    }]);
    if (!brand) {
        return next(new ErrorClass("brand not found", 404, "brand not found"));
    }

    const { name}= req.body;
    if(name){
        const slug = slugify(name,{
            replacement: "_",
            lower: true,
        });
        brand.name = name;
        brand.slug = slug;
    }

    if(req.file){
        const splitedPublicId = brand.logo.public_id.split(`${brand.customId}/`)[1]
        const categoryCustomId = brand.categoryId.customId
        const subCategoryCustomId = brand.subCategoryId.customId
        const brandCustomId = brand.customId;
        const { secure_url } = await uploadFile({
          file : req.file.path,
          folder: `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/subcategories/${subCategoryCustomId}/brands/${brandCustomId}`,
          publicId: splitedPublicId}
        );
        brand.logo.secure_url = secure_url;
    }
    await brand.save();

    // send response 
    return res.status(200).json({
        status: "success",
        message: "brand updated successfully",
        data: brand,
    });

}


/**
 * @api {delete} /brands/delete/:_id -delete brand
 */
export const deleteBrand = async(req, res, next) => {
    const { _id } = req.params;
    const brand = await brandModel.findByIdAndDelete(_id).populate([{
        path: "categoryId",
    },{
        path: "subCategoryId",
    }]);

    if (!brand) {
        return next(new ErrorClass("brand not found", 404, "brand not found"));
    }

    const categoryCustomId = brand.categoryId.customId
    const subCategoryCustomId = brand.subCategoryId.customId
    const brandCustomId = brand.customId;
    const brandPath = `${process.env.UPLOADS_FOLDER}/categories/${categoryCustomId}/subcategories/${subCategoryCustomId}/brands/${brandCustomId}`;
    // delete image from cloudinary
    await cloudinaryConfig().api.delete_resources_by_prefix(brandPath);
    // delete folder
    await cloudinaryConfig().api.delete_folder(brandPath);


    //TODO :  delete relevant products
    const deleteProduct  = await productModel.deleteMany({
        brandId : _id,
    }) 

    // send response
    return res.status(200).json({
        status: "success",
        message: "brand deleted successfully",
    });
}


/**
 * @api {get} /brands/all -Get all brands with its products 
 */
export const getAllBrandsWithProducts = async(req, res, next) => {
    const { page = 1, limit = 2 } = req.query;
    const skip = (page - 1) * limit;
    // Get relevant categories with pagination
    const brands = await brandModel.find()
    .limit(limit)
    .skip(skip)
    .select('name')
  
    // Fetch all subcategories
    const products = await productModel.find()
      .select("name brandId")
      .populate("brandId")
  
      // Map subcategories to their respective categories (return array of object )
    const brandsWithProducts = brands.map((brand) => {
      const matchingProducts = products.filter(product =>
        product.brandId._id.toString() === brand._id.toString());
      return {
        ...brand.toObject(),
        products: matchingProducts.map(product => product.toObject())
      };
    });
  
    return res.status(200).json({
        status: "success",
        message: "Categories and subcategories retrieved successfully",
        brandsWithProducts
    })
}


/**
 * @api {get} /brands/specific -Get brands for specific subCategory or category or name
 */
export const getSpecificBrands = async(req, res, next) => {
    const { name, categoryId, subCategoryId } = req.query;

    let brands = {};
    if(name){
        brands = await brandModel.find({
            name: name,
        })
    }else if(categoryId){
        brands = await brandModel.find({
            categoryId: categoryId
        })
    }else if(subCategoryId){
        brands = await brandModel.find({
            subCategoryId: subCategoryId
        })
    }

    if (!brands) {
        return next(new ErrorClass("Brands not found", 404, "Brands not found"));
    }

    // send response
    return res.status(200).json({
        status: "success",
        message: "Brands found successfully",
        brands,
    });
}