const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/database");
const routes = require("./src/routes");
const app = express();
const PORT = Number(process.env.PORT || 5000);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use("/api", routes);
async function startServer() { await sequelize.authenticate(); await sequelize.sync(); return app.listen(PORT, "127.0.0.1"); }
if (require.main === module) startServer().catch(e => { console.error(e); process.exit(1); });
module.exports = { app, startServer };
