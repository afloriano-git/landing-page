import express from "express";
import cookieParser from "cookie-parser";
import path from "path";

import { ENV } from "./lib/env.js";
import authRoutes from "./routes/auth.route.js";
import { protectRoute } from "./middleware/auth.middleware.js";

const __dirname = path.resolve();

const app = express();
const PORT = ENV.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../frontend/src")));

app.use("/api/auth", authRoutes);
app.get("/portfolio", protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/src/portfolio.html"));
});
app.get("/auth", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/src/auth.html"));
});

if(ENV.NODE_ENV === "production") {
        app.get("/", (req, res) => {
            const token = req.cookies.sessionToken;
        if(!token) return res.redirect("/auth");

        return res.redirect("/portfolio");
    });
    
}

app.listen(PORT, () => console.log("Server running on port: " + PORT));