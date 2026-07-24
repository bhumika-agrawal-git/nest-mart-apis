import express from "express";
import { registerUser , loginUser , updateUser, getUsers, getProfile, getUserById,  deleteUser,} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from '../middlewares/uploadMiddleware.js'
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.put("/update", authMiddleware, updateUser);
router.put(
    "/profile",
    authMiddleware,
    upload.single("profile_image"),
    updateUser
);
router.get("/", authMiddleware, getUsers);
router.get("/profile/me", authMiddleware, getProfile);
router.get("/:id", authMiddleware, getUserById);
router.delete("/:id", authMiddleware,deleteUser);
export default router;