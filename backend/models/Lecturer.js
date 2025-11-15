import mongoose from "mongoose";

const LecturerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "lecturer",
      enum: ["lecturer", "student"],
    },

    // NEW FIELD: Lecturer can turn geofencing ON/OFF
    geofencingEnabled: {
      type: Boolean,
      default: true, // geofencing ON by default
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Lecturer = mongoose.model("Lecturer", LecturerSchema);
export default Lecturer;
