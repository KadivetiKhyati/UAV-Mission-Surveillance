const mongoose = require("mongoose");
const UAV = require("../models/UAV");

const router = express.Router();


/* =====================================================
   GET ALL UAVs
===================================================== */

router.get("/", async (req, res) => {

    try {

        const uavs = await UAV.find()
            .sort({ createdAt: 1 });

        res.status(200).json(uavs);

    } catch (error) {

        console.error("Error fetching UAVs:", error);

        res.status(500).json({
            message: "Failed to fetch UAV fleet"
        });
    }
});


/* =====================================================
   GET SINGLE UAV
===================================================== */

router.get("/:id", async (req, res) => {

    try {

        const uav = await UAV.findById(req.params.id);

        if (!uav) {

            return res.status(404).json({
                message: "UAV not found"
            });
        }

        res.status(200).json(uav);

    } catch (error) {

        console.error("Error fetching UAV:", error);

        res.status(400).json({
            message: "Invalid UAV ID"
        });
    }
});


/* =====================================================
   ADD NEW UAV
===================================================== */

router.post("/", async (req, res) => {

    try {

        const {
            uavId,
            name,
            type,
            battery,
            status
        } = req.body;


        // Required fields
        if (!uavId || !name || !type) {

            return res.status(400).json({
                message:
                    "UAV ID, name and type are required"
            });
        }


        // Check duplicate UAV ID
        const existingUAV = await UAV.findOne({
            uavId: uavId.trim()
        });

        if (existingUAV) {

            return res.status(409).json({
                message:
                    `UAV ID ${uavId} already exists`
            });
        }


        // Validate battery manually
        if (
            battery !== undefined &&
            (battery < 0 || battery > 100)
        ) {

            return res.status(400).json({
                message:
                    "Battery must be between 0 and 100"
            });
        }


        const uav = new UAV({
            uavId: uavId.trim(),
            name: name.trim(),
            type: type.trim(),
            battery:
                battery === undefined
                    ? 100
                    : battery,
            status:
                status || "Available"
        });


        const savedUAV = await uav.save();

        res.status(201).json(savedUAV);

    } catch (error) {

        console.error("Error creating UAV:", error);

        res.status(400).json({
            message:
                error.message ||
                "Failed to create UAV"
        });
    }
});


/* =====================================================
   UPDATE UAV
===================================================== */

router.put("/:id", async (req, res) => {

    try {

        const uav = await UAV.findById(
            req.params.id
        );

        if (!uav) {

            return res.status(404).json({
                message: "UAV not found"
            });
        }


        const {
            name,
            type,
            battery,
            status
        } = req.body;


        if (name !== undefined) {
            uav.name = name.trim();
        }

        if (type !== undefined) {
            uav.type = type.trim();
        }


        if (battery !== undefined) {

            if (
                battery < 0 ||
                battery > 100
            ) {

                return res.status(400).json({
                    message:
                        "Battery must be between 0 and 100"
                });
            }

            uav.battery = battery;
        }


        if (status !== undefined) {

            const validStatuses = [
                "Available",
                "On Mission",
                "Maintenance"
            ];

            if (
                !validStatuses.includes(status)
            ) {

                return res.status(400).json({
                    message:
                        "Invalid UAV status"
                });
            }

            uav.status = status;
        }


        const updatedUAV =
            await uav.save();

        res.status(200).json(updatedUAV);

    } catch (error) {

        console.error("Error updating UAV:", error);

        res.status(400).json({
            message:
                error.message ||
                "Failed to update UAV"
        });
    }
});


/* =====================================================
   DELETE UAV
===================================================== */

router.delete("/:id", async (req, res) => {

    try {

        const uav = await UAV.findById(
            req.params.id
        );

        if (!uav) {

            return res.status(404).json({
                message: "UAV not found"
            });
        }


        // Do not delete an active UAV
        if (uav.status === "On Mission") {

            return res.status(409).json({
                message:
                    "Cannot delete a UAV that is currently on a mission"
            });
        }


        await UAV.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message:
                "UAV deleted successfully"
        });

    } catch (error) {

        console.error("Error deleting UAV:", error);

        res.status(400).json({
            message:
                "Invalid UAV ID"
        });
    }
});


module.exports = mongoose.model("UAV", uavSchema);