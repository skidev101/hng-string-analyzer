import { Router } from "express";
import {
  createString,
  deleteString,
  getString,
} from "../controllers/stringController";

const router = Router();
router.post("/", createString);
router.get("/:value", getString);
router.delete("/:value", deleteString);


export default router;