const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema(
    {
        missionId: {
            type: String,
            required: [true, "Mission ID is required"],
            unique: true,
            trim: true
        },

        missionName: {
            type: String,
            required: [true, "Mission name is required"],
            trim: true
        },

        assignedUAV: {
            type: String,
            required: [true, "Assigned UAV is required"],
            trim: true
        },

        missionType: {
            type: String,
            enum: {
                values: [
                    "Surveillance",
                    "Reconnaissance",
                    "Patrol",
                    "Training"
                ],
                message: "Invalid mission type"
            },
            required: [true, "Mission type is required"]
        },

        status: {
            type: String,
            enum: {
                values: [
                    "Planned",
                    "Active",
                    "Completed",
                    "Aborted"
                ],
                message: "Invalid mission status"
            },
            default: "Planned"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Mission",
    missionSchema
);