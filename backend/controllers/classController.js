// backend/controllers/classController.js
import Class from "../models/Class.js";

export const createClass = async (req, res) => {
  try {
    const { classId, className, geofenceEnabled, latitude, longitude, geofenceRadius } = req.body;
    if (!classId || !className) return res.status(400).json({ message: "Class ID and Name required" });

    const existing = await Class.findOne({ classId });
    if (existing) return res.status(200).json({ message: "Class already exists", newClass: existing });

    const newClass = new Class({
      classId,
      className,
      geofenceEnabled: !!geofenceEnabled,
      latitude: geofenceEnabled ? latitude : null,
      longitude: geofenceEnabled ? longitude : null,
      geofenceRadius: geofenceEnabled ? geofenceRadius : null,
    });

    await newClass.save();
    res.status(201).json({ message: "Class created", newClass });
  } catch (err) {
    console.error("createClass error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ className: 1 });
    res.status(200).json(classes);
  } catch (err) {
    console.error("getAllClasses error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getClassById = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.status(200).json(cls);
  } catch (err) {
    console.error("getClassById error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { className, geofenceEnabled, latitude, longitude, geofenceRadius } = req.body;
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    cls.className = className ?? cls.className;
    cls.geofenceEnabled = typeof geofenceEnabled === "boolean" ? geofenceEnabled : cls.geofenceEnabled;

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
    res.status(200).json({ message: "Class updated", updatedClass: cls });
  } catch (err) {
    console.error("updateClass error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    await cls.deleteOne();
    res.status(200).json({ message: "Class deleted" });
  } catch (err) {
    console.error("deleteClass error:", err);
    res.status(500).json({ message: err.message });
  }
};
