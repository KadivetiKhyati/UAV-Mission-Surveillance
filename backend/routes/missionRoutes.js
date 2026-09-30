const express = require("express");
const Mission = require("../models/Mission");
const UAV = require("../models/UAV");

const router = express.Router();

const VALID_MISSION_TYPES = [
    "Surveillance",
    "Reconnaissance",
    "Patrol",
    "Training"
];

const VALID_STATUSES = [
    "Planned",
    "Active",
    "Completed",
    "Aborted"
];


/* =====================================================
   GET ALL MISSIONS
===================================================== */

router.get("/", async (req, res) => {
    try {

        const missions = await Mission.find()
            .sort({ createdAt: -1 });

        res.status(200).json(missions);

    } catch (error) {

        console.error(
            "Error fetching missions:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch missions"
        });
    }
});


/* =====================================================
   GET SINGLE MISSION
===================================================== */

router.get("/:id", async (req, res) => {
    try {

        const mission = await Mission.findById(
            req.params.id
        );

        if (!mission) {
            return res.status(404).json({
                message: "Mission not found"
            });
        }

        res.status(200).json(mission);

    } catch (error) {

        console.error(
            "Error fetching mission:",
            error
        );

        res.status(400).json({
            message: "Invalid mission ID"
        });
    }
});


/* =====================================================
   CREATE MISSION
===================================================== */

router.post("/", async (req, res) => {
    try {

        const {
            missionId,
            missionName,
            assignedUAV,
            missionType,
            status
        } = req.body;


        // Required fields
        if (
            !missionId ||
            !missionName ||
            !assignedUAV ||
            !missionType
        ) {
            return res.status(400).json({
                message:
                    "Mission ID, name, UAV and mission type are required"
            });
        }


        // Validate mission type
        if (
            !VALID_MISSION_TYPES.includes(
                missionType
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid mission type"
            });
        }


        // Validate status
        const missionStatus =
            status || "Planned";

        if (
            !VALID_STATUSES.includes(
                missionStatus
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid mission status"
            });
        }


        // Check duplicate mission ID
        const existingMission =
            await Mission.findOne({
                missionId: missionId.trim()
            });

        if (existingMission) {
            return res.status(409).json({
                message:
                    `Mission ID ${missionId} already exists`
            });
        }


        // Find assigned UAV
        const uav = await UAV.findOne({
            uavId: assignedUAV.trim()
        });

        if (!uav) {
            return res.status(404).json({
                message:
                    `UAV ${assignedUAV} not found`
            });
        }


        // Active mission requires available UAV
        if (
            missionStatus === "Active" &&
            uav.status !== "Available"
        ) {
            return res.status(409).json({
                message:
                    `${uav.name} is not available for an active mission`
            });
        }


        // Create mission
        const mission = new Mission({
            missionId: missionId.trim(),
            missionName: missionName.trim(),
            assignedUAV: assignedUAV.trim(),
            missionType,
            status: missionStatus
        });

        const savedMission =
            await mission.save();


        // Synchronize UAV status
        if (missionStatus === "Active") {

            await UAV.findOneAndUpdate(
                {
                    uavId:
                        assignedUAV.trim()
                },
                {
                    status:
                        "On Mission"
                }
            );
        }


        res.status(201).json(
            savedMission
        );

    } catch (error) {

        console.error(
            "Error creating mission:",
            error
        );

        res.status(400).json({
            message:
                error.message ||
                "Failed to create mission"
        });
    }
});


/* =====================================================
   UPDATE MISSION STATUS
===================================================== */

router.put("/:id", async (req, res) => {
    try {

        const mission =
            await Mission.findById(
                req.params.id
            );

        if (!mission) {
            return res.status(404).json({
                message: "Mission not found"
            });
        }


        const newStatus =
            req.body.status;


        // Validate status
        if (
            !VALID_STATUSES.includes(
                newStatus
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid mission status"
            });
        }


        // Prevent duplicate status update
        if (
            mission.status === newStatus
        ) {
            return res.status(400).json({
                message:
                    `Mission is already ${newStatus}`
            });
        }


        // Find assigned UAV
        const uav = await UAV.findOne({
            uavId:
                mission.assignedUAV
        });

        if (!uav) {
            return res.status(404).json({
                message:
                    `Assigned UAV ${mission.assignedUAV} not found`
            });
        }


        /* ---------------------------------------------
           PLANNED → ACTIVE
        --------------------------------------------- */

        if (newStatus === "Active") {

            if (
                mission.status !== "Planned"
            ) {
                return res.status(400).json({
                    message:
                        "Only planned missions can be activated"
                });
            }

            if (
                uav.status !== "Available"
            ) {
                return res.status(409).json({
                    message:
                        `${uav.name} is not available`
                });
            }

            mission.status = "Active";

            await mission.save();

            await UAV.findOneAndUpdate(
                {
                    uavId:
                        mission.assignedUAV
                },
                {
                    status:
                        "On Mission"
                }
            );
        }


        /* ---------------------------------------------
           ACTIVE → COMPLETED
        --------------------------------------------- */

        else if (newStatus === "Completed") {

            if (
                mission.status !== "Active"
            ) {
                return res.status(400).json({
                    message:
                        "Only active missions can be completed"
                });
            }

            mission.status = "Completed";

            await mission.save();

            await UAV.findOneAndUpdate(
                {
                    uavId:
                        mission.assignedUAV
                },
                {
                    status:
                        "Available"
                }
            );
        }


        /* ---------------------------------------------
           PLANNED / ACTIVE → ABORTED
        --------------------------------------------- */

        else if (newStatus === "Aborted") {

            if (
                mission.status !== "Planned" &&
                mission.status !== "Active"
            ) {
                return res.status(400).json({
                    message:
                        "Completed missions cannot be aborted"
                });
            }

            mission.status = "Aborted";

            await mission.save();

            await UAV.findOneAndUpdate(
                {
                    uavId:
                        mission.assignedUAV
                },
                {
                    status:
                        "Available"
                }
            );
        }


        res.status(200).json(
            mission
        );

    } catch (error) {

        console.error(
            "Error updating mission:",
            error
        );

        res.status(400).json({
            message:
                error.message ||
                "Failed to update mission"
        });
    }
});


/* =====================================================
   DELETE MISSION
===================================================== */

router.delete("/:id", async (req, res) => {
    try {

        const mission =
            await Mission.findById(
                req.params.id
            );

        if (!mission) {
            return res.status(404).json({
                message:
                    "Mission not found"
            });
        }


        // Protect active missions
        if (
            mission.status === "Active"
        ) {
            return res.status(409).json({
                message:
                    "Active missions cannot be deleted"
            });
        }


        await Mission.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message:
                "Mission deleted successfully"
        });

    } catch (error) {

        console.error(
            "Error deleting mission:",
            error
        );

        res.status(400).json({
            message:
                "Invalid mission ID"
        });
    }
});


module.exports = router;