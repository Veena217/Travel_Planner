import multer from "multer"
import path from "path"
import { extname } from "path/posix"
//storage configuration

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./uploads/")
    },
    filename:function(req,file,cb){
        cb(null, Date.now() + path.extname(file.originalname)); //unique file name

        

    },

})

//file filter to accept only image

const fileFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith("image/")){
        cb(null,true)
    }else{
        cb(new Error("Only images are allowed"),false)
    }
}

//Initialize multer instance

const upload=multer({storage,fileFilter})

export default upload