import { Router } from "express";
import * as taskController from "../controllers/taskController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.post("/", taskController.createTask);
router.get("/:projectId", taskController.getTasksByProject);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

export default router;
