import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";

import { getUserWithId } from "../lib/usersdb.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.sessionToken;
        if(!token) return res.redirect("/auth");

        const decodedToken = jwt.verify(token, ENV.JWT_SECRET);
        if(!decodedToken) {
            res.clearCookie("sessionToken");
            return res.redirect("/auth");
        };

        const user = await getUserWithId(decodedToken.userId);
        if(!user) return res.status(404).json({message:"User not found"});

        req.user = {
            id: user.id,
            fullName: user.fullName,
            email: user.email
        };
        next()
    } catch (error) {
        console.log("Error in protectRoute:", error);
        res.clearCookie("sessionToken");
        return res.redirect("/auth");
    }
}