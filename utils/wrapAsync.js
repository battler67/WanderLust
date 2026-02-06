module.exports = (fn) =>{
    return  (req,res,next) =>{
        fn(req,res,next).catch(next);//error is handled by next wrapper funtcion
    }
}