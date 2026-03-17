import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import clearanceRoutes from "./routes/clearance.routes.js";
import clearanceActionRoutes from "./routes/clearance-actions.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import userAdminRoutes from "./routes/user-admin.routes.js";
import branchAdminRoutes from "./routes/branch-admin.routes.js";
import driverRoutes from "./routes/driver.routes.js";
import pushRoutes from "./routes/push.routes.js";
import adminLiveRoutes from "./routes/admin-live.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/admin-users", userAdminRoutes);
app.use("/users", userRoutes);
app.use("/clearance", clearanceRoutes);
app.use("/clearance-actions", clearanceActionRoutes);
app.use("/reports", reportRoutes);
app.use("/branches", branchRoutes);
app.use("/admin-branches", branchAdminRoutes);
app.use("/agents", agentRoutes);
app.use("/driver", driverRoutes);
app.use("/push", pushRoutes);
app.use("/api/admin/live", adminLiveRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

export default app;
