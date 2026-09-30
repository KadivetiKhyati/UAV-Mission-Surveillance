const mongoose = require("mongoose");

const uavSchema = new mongoose.Schema(
    {
        uavId: {
            type: String,
            required: [true, "UAV ID is required"],
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: [true, "UAV name is required"],
            trim: true
        },

        type: {
            type: String,
            required: [true, "UAV type is required"],
            trim: true
        },

        battery: {
            type: Number,
            required: true,
            min: [0, "Battery cannot be below 0%"],
            max: [100, "Battery cannot exceed 100%"],
            default: 100
        },

        status: {
            type: String,
            enum: {
                values: [
                    "Available",
                    "On Mission",
                    "Maintenance"
                ],
                message: "Invalid UAV status"
            },
            default: "Available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("UAV", uavSchema);