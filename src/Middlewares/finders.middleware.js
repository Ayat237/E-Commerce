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