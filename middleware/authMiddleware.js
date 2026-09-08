
import jwt from "jsonwebtoken"



const authMiddleware = (req, res, next)=>{
    try{

    const authHeader = req.headers.authorization

    
  
    if(!authHeader){
    return res.status(401).json({
        status : "error",
        message : "Access Denied. Token not found."
        })
    }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Invalid Authorization Header."
            });
        }

    const token = authHeader.split(" ")[1]

    if (!token) {
    return res.status(401).json({
        status: "error",
        message: "Token not found."
    });
}

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    )

   
    req.user = decoded


    next()

    }catch (e) {
        console.log(e)
    return res.status(401).json({
        status: "error",
        message: "Invalid or Expired Token"
    });
}
}
export default authMiddleware;