import bcrypt from "bcryptjs";

import User from "../model/User.js";

import { saveNewUser, checkEmailExists, getUserWithEmail } from "../lib/usersdb.js";
import { generateToken } from "../lib/token.generator.js";

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

        // GENERATES A HASHED PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User(fullName, email.toLowerCase(), hashedPassword);
        if(!newUser) {return res.status(400).json({message:"Invalid user data"});}

        // SAVES THE NEW USER INTO THE DATABASE
        await saveNewUser(newUser);
        // CALLS TOKEN GENRATION FUNCIONALITY
        generateToken(newUser.id, res);

        res.status(200).json({
            id: newUser.id,
            fullName: newUser.fullName,
            email:newUser.email
        });       
        
    } catch(error) {
        console.log(error);
        res.status(500).json({message:"Server error: " + error.message});
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = getUserWithEmail(email);
        if(!user) {return res.status(400).json({message:"Invalid credentials"})};
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {return res.status(400).json({message:"Invalid credentials"})};

        generateToken(user.id, res);

        res.status(200).json({
            id: user.id,
            fullName: user.fullName,
            email:user.email
        });

    } catch(error) {
        console.log(error);
        res.status(500).json({message:"Server error: " + error.message});
    }
}

export const logout = async (_, res) => {
    res.cookie("sessionToken", "", {maxAge: 0})
    res.status(200).json({message:"Succesfully logged out"});
}