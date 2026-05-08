import fs from "fs";
import path from "path";

import { ENV } from "./env.js";

const __dirname = path.resolve();
const userDbPath = path.join(__dirname, ENV.USER_DB);
if (!fs.existsSync(userDbPath)) {fs.writeFileSync(userDbPath, JSON.stringify([]), "utf-8");}

const getUsers = () => {
    const data = fs.readFileSync(userDbPath, "utf-8");
    return JSON.parse(data);
}
let usersArray = getUsers();

export const saveNewUser = (newUser) => {
    usersArray = getUsers();
    newUser.id = usersArray.length+1;
    
    usersArray.push(newUser);
    fs.writeFileSync(userDbPath, JSON.stringify(usersArray, null, 2));
};

export const checkEmailExists = (email) => {
    return usersArray.some(u => u.email === email);
}

export const getUser = (email) => {
    return usersArray.find(u => u.email === email);
}