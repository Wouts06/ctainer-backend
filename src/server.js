import "dotenv/config";   // ✅ MUST be first

import app from "./app.js";
import driverLiveRoutes from "./routes/driver-live.routes.js";

const PORT = process.env.PORT || 4000;

console.log("JWT_SECRET AT STARTUP:", process.env.JWT_SECRET);

app.use("/driver/live", driverLiveRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
