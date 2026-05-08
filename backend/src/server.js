import express from "express";
import cookieParser from "cookie-parser";
import path from "path";

import { ENV } from "./lib/env.js";
import authRoutes from "./routes/auth.route.js";

const __dirname = path.resolve();

const app = express();
const PORT = ENV.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);

if(ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend")));
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "index.html"));
    });
}

app.listen(PORT, () => console.log("Server running on port: " + PORT));