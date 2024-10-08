import { ErrorClass } from "../Utils/index.js";

export const autherization = (allowedRules) => {
    return  (req, res, next) => {
        // whose logged in user
        const auth = req.authUser; 

        // if the user is not authenticated
        if(!auth || !allowedRules.includes(auth.userType)) {
            return next (new ErrorClass(
                "Autherzation Error" ,
                401,
                "you are not allowed to acces to this role"))
        }
        next();
    }
}