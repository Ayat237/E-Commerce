import jwt from "jsonwebtoken"
import { ErrorClass } from "../Utils/index.js"
import { userModel } from "../../DB/Models/user.model.js"

export const authenticatation =()=>{
    return async (req, res, next) => {
        const {token} = req.headers
        if(!token){
            return next(new ErrorClass("token error",400,"token is required"))
        }

        if(!token.startsWith("user")){
            return next(new ErrorClass("token error",400,"Token is not valid"))
        }

        const newToken = token.split("user_")[1]
        if(!newToken){
            return next(new ErrorClass("token error",400,"Token is not found"))
        }
        // verify token
        const decoded = jwt.verify(newToken,process.env.LOGIN_SECRET)
        // if decoded of token not contain on id 
        if(!decoded?.id){
            return next(new ErrorClass("token error",400,"invalid payload"))
        }

        const userExists = await userModel.findById(decoded.id)  
        if(!userExists ){
            return next(new ErrorClass("User not found",400,"User not found"))
        }

        // user data 
        req.authUser = userExists;
        
        next();
    }
}