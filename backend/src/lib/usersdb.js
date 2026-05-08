import fs from "fs";
import path from "path";

import { ENV } from "./env.js";

const __dirname = path.resolve();
const userDbPath = path.join(__dirname, ENV.USER_DB);
fs.mkdirSync(path.dirname(userDbPath), { recursive: true });
if (!fs.existsSync(userDbPath)) {fs.writeFileSync(userDbPath, JSON.stringify([]), "utf-8");}

const getUsers = () => {
    const data = fs.readFileSync(userDbPath, "utf-8");
    return JSON.parse(data);
}
let usersArray = getUsers();

export const saveNewUser = (newUser) => {
    usersArray = getUsers();
    usersArray.push(newUser);
    fs.writeFileSync(userDbPath, JSON.stringify(usersArray, null, 2));
};

export const checkEmailExists = (_email) => {
    return usersArray.some(u => u.email === _email);
}

export const getUserWithEmail = (_email) => {
    return usersArray.find(u => u.email === _email);
}

export const getUserWithId = (_id) => {
    return usersArray.find(u => u.id === _id);
}