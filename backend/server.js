const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const uavRoutes = require("./routes/uavRoutes");
const missionRoutes = require("./routes/missionRoutes");

app.use("/api/uavs", uavRoutes);
app.use("/api/missions", missionRoutes);

// Test routes
app.get("/test", (req, res) => {
    res.send("API TEST WORKS");
});

app.get("/", (req, res) => {
    res.send("UAV Mission Surveillance Backend is running!");
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});