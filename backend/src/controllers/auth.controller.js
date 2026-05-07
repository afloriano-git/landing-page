import bcrypt from "bcryptjs";

import User from "../model/User.js";

import { checkEmailExists } from "../lib/usersdb.js";
import { saveNewUser } from "../lib/usersdb.js";

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {
        // COMPROBATIONS FOR EACH USER SIGN UP
        if(!fullName || !email || !password) {return res.status(400).json({message:"All fields are required"});}
        if(password.length < 6) {return res.status(400).json({message:"Password must be at least 6 characters"})};

        // CHECK EMAIL VALID REGEX
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {return res.status(400).json({message:"Invalid email format"});}

        // CHECK IF EMAIL ALREADY EXISTS IN DB
        const userExists = checkEmailExists(email);
        if(userExists) {return res.status(400).json({message:"Email already exists"});}

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User(fullName, email, hashedPassword)
        if(!newUser) {return res.status(400).json({message:"Invalid user data"});}

        saveNewUser(newUser);
        res.status(200).json({message:"Succesfull"});
        
        
    } catch(error) {
        console.log(error);
        res.status(500).json({message:"Server error"});
    }
}