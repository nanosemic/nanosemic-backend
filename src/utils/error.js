export const errorHandler = (statusCode,message,success)=>{
    const error = new Error ();
    error.statusCode = statusCode;
    error.success = success;
    error.message = message;
    // console.log(error)
    return error;

}