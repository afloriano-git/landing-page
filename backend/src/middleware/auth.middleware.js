import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";

import { getUserWithId } from "../lib/usersdb.js";

export const protectRoute = async (req, res, next) => {
    try {

        console.log("cookies:", req.cookies);
        console.log("headers cookie:", req.headers.cookie);

        const token = req.cookies.sessionToken;
        if(!token) return res.status(401).json({message:"Unauthorized - No token provided"});

        const decodedToken = jwt.verify(token, ENV.JWT_SECRET);
        if(!decodedToken) return res.status(401).json({message:"Unauthorized - Invalid token provided"});

        const user = await getUserWithId(decodedToken.userId);
        if(!user) return res.status(404).json({message:"User not found"});

        req.user = {
            id: user.id,
            fullName: user.fullName,
            email: user.email
        };
        next()
    } catch (error) {
        console.log("Error in protectRoute middleware:", error);
        res.status(500).json({message:"Server error: " + error.message});
    }
}