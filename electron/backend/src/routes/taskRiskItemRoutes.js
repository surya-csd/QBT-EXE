const express = require("express");

const taskRiskItemController = require("../controllers/taskRiskItemController");

const router = express.Router();

router.get(
    "/assessment/:assessment_id",
    taskRiskItemController.getItemsByAssessmentId
);

router.post(
    "/",
    taskRiskItemController.createTaskRiskItem
);

router.get(
    "/:id",
    taskRiskItemController.getTaskRiskItemById
);

router.put(
    "/:id",
    taskRiskItemController.updateTaskRiskItem
);

router.delete(
    "/:id",
    taskRiskItemController.deleteTaskRiskItem
);

module.exports = router;