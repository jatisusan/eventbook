import { Router } from "express";
import { loginHandler, logoutHandler, meHandler, registerHandler } from "../handlers/auth-handler.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/me", authMiddleware, meHandler);   
authRouter.post("/logout", logoutHandler);

export default authRouter;
