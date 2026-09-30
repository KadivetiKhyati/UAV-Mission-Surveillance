const express = require("express");
const UAV = require("../models/UAV");

const router = express.Router();

// Get all UAVs
router.get("/", async (req, res) => {
    try {
        const uavs = await UAV.find();
        res.json(uavs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new UAV
router.post("/", async (req, res) => {
    try {
        const uav = new UAV(req.body);
        const savedUAV = await uav.save();

        res.status(201).json(savedUAV);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;