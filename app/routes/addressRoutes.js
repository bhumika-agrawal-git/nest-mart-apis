import express from "express";
import {
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware)
router.post("/",  addAddress);

router.get("/",  getAddresses);

router.get("/:id", getAddressById);

router.put("/:id", updateAddress);

router.delete(
  "/:id",
  authMiddleware,
  deleteAddress
);

router.patch("/default/:id",  setDefaultAddress);

export default router;