import express from "express";
import {register,verifyToken,login,logout} from '../controllers/auth.js'

const router = express.Router();


// CREATE A USER
router.post("/register",register)
router.post("/login",login)
router.get("/profile", verifyToken)
router.post("/logout", logout)

export default router