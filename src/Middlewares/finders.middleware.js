import { ErrorClass } from "../Utils/index.js";


export const getDocumentByName = (model) =>{
    return async(req,res,next)=>{
        const { name } = req.body;
        if(name){
            const documentExist = await model.findOne({name});
            if (documentExist) {
              return next(
                new ErrorClass(
                  `${name} is already exists`,
                  400,
                  `${name} with the same name already exists`,
                )
              );  
            }
        }
        next(); 
    }
}


export const idsExistChcek = (model, populateFields = [])=>{
  return async(req,res,next)=>{
    // Build the query dynamically based on the provided fields
    const query = {
      categoryId: req.query.categoryId,
      subCategoryId: req.query.subCategoryId,
      _id: req.query.brandId,
    }
    // Populate the required fields if provided
    const document = await model.findOne(query).populate(populateFields)
    console.log({document , populateFields , query});
    if(!document) {
        return next(new ErrorClass(`${model.modelName} is not found`, 400, "Invalid ids"));
    }
    
    req.document = document;
    next(); 
  }
}