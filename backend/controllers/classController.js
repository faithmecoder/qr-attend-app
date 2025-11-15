// backend/controllers/classController.js
import Class from "../models/Class.js";

/**
 * CREATE CLASS
 */
export const createClass = async (req, res) => {
  try {
    const {
      classId,
      className,
      geofenceEnabled,
      latitude,
      longitude,
      geofenceRadius,
    } = req.body;

    if (!classId || !className) {
      return res
        .status(400)
        .json({ message: "Class ID and Class Name are required." });
    }

    const existingClass = await Class.findOne({ classId });

    if (existingClass) {
      return res.status(200).json({
        message: "Class already exists.",
        newClass: existingClass,
      });
    }

    const newClass = new Class({
      classId,
      className,
      geofenceEnabled,
      latitude: geofenceEnabled ? latitude : null,
      longitude: geofenceEnabled ? longitude : null,
      geofenceRadius: geofenceEnabled ? geofenceRadius : null,
    });

    await newClass.save();

    res.status(201).json({
      message: "Class created successfully.",
      newClass,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating class." });
  }
};

/**
 * GET ALL CLASSES
 */
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ className: 1 });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET CLASS BY ID
 */
export const getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.status(200).json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE CLASS
 */
export const updateClass = async (req, res) => {
  try {
    const { className, geofenceEnabled, latitude, longitude, geofenceRadius } =
      req.body;

    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    cls.className = className ?? cls.className;

    cls.geofenceEnabled =
      typeof geofenceEnabled === "boolean"
        ? geofenceEnabled
        : cls.geofenceEnabled;

    if (cls.geofenceEnabled) {
      cls.latitude = latitude;
      cls.longitude = longitude;
      cls.geofenceRadius = geofenceRadius;
    } else {
      cls.latitude = null;
      cls.longitude = null;
      cls.geofenceRadius = null;
    }

    await cls.save();

    res.status(200).json({
      message: "Class updated successfully",
      updatedClass: cls,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE CLASS
 */
export const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    await cls.deleteOne();

    res.status(200).json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
