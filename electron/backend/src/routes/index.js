const express = require("express");
const taraRoutes = require("./taraRoutes");
const taskRiskItemRoutes = require("./taskRiskItemRoutes");
const sopRoutes = require("./sopRoutes");
const masterRoutes = require("./masterRoutes")
const quotationRoutes = require("./quotationRoutes");
const billRoutes = require("./billRoutes");
const dashboardRoutes = require("./dashboardRoutes")

const router = express.Router();

router.use("/tara", taraRoutes);
router.use("/tara-items", taskRiskItemRoutes);
router.use("/sops", sopRoutes);
router.use("/master", masterRoutes)
router.use("/quotations", quotationRoutes);
router.use("/bills", billRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;