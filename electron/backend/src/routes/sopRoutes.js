const express = require("express");

const sopController = require("../controllers/sopController");

const router = express.Router();

router.get(
    "/assessment/:task_risk_assessment_id",
    sopController.getSopsByAssessmentId
);

router.post(
    "/",
    sopController.createSop
);

router.get(
    "/:id",
    sopController.getSopById
);

router.put(
    "/:id",
    sopController.updateSop
);

router.delete(
    "/:id",
    sopController.deleteSop
);

module.exports = router;