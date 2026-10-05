const {
  getDashboardData,
} = require("../services/dashboardService");

const getDashboard = async (req, res) => {
  try {
    const data = await getDashboardData();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("=================================");
    console.error("DASHBOARD ERROR:");
    console.error(error);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR SQL:", error.sql);
    console.error("=================================");

    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};