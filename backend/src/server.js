import express from "express";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.route.js";

dotenv.config();

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);

if(process.env.NODE_ENV == "production") {
    app.use(express.static(path.join(__dirname, "../frontend")));
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "index.html"));
    });
}

app.listen(PORT, () => console.log("Server running on port: " + PORT));