import {Request,Response,NextFunction} from 'express'
export function commonErrorMiddleware(err:any,req:Request,res:Response,next:NextFunction){
    return res.status(err.status??500).json({
        status:'fail',
        error:err.message??'Something went wrong'
    })
}