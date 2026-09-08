import multer from "multer"

const storage = multer.diskStorage({
    destination : (req, file, cb)=>{
        cb(null, "uploads/")
    },
    filename : (req, file, cb)=>{
        const uniqeName = Date.now()+"_"+file.originalname
        cb(null, uniqeName)
    }
})

const upload = multer({
    storage
})

export default upload;