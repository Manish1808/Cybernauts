const errorHandler = require("express-async-handler");
const eventModel = require("../models/event.model");

// @desc to get all the events
// @API GET /events
// @access PUBLIC
const getEvents = errorHandler(async (req, res) => {
  try {
    const events = await eventModel.find({}); // Fetch all events

    // Get the current date and time
    const now = new Date();

    // Helper to combine date and time
    const getEventEndDateTime = (event) => {
      const date = new Date(event.endDate);
      if (event.endTime) {
        const [hours, minutes] = event.endTime.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
      } else {
        // If no endTime, assume end of day to be safe, or keep as midnight? 
        // Logic suggests if date passed, it's done. 
        // If date is today and no time, maybe we assume end of day?
        // But schema says required. Let's stick to setting hours.
        date.setHours(23, 59, 59, 999);
      }
      return date;
    };

    // Filter events into upcoming (including ongoing) and completed
    const upcomingEvents = events.filter(
      (event) => getEventEndDateTime(event) >= now
    );
    const completedEvents = events.filter(
      (event) => getEventEndDateTime(event) < now
    );

    res.status(200).json({ upcomingEvents, completedEvents });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// @desc to get all the events
// @API GET /events/recent
// @access PUBLIC
const getRecentEvent = errorHandler(async (req, res) => {
  try {
    const currentDate = new Date();

    // Fetch events whose endDate is in the past
    const events = await eventModel
      .find({ endDate: { $lt: currentDate } })
      .sort({ endDate: -1 })
      .limit(1);

    if (events.length === 0) {
      return res.status(404).json({ message: "No recent events found" });
    }

    res.status(200).json(events[0]);
  } catch (error) {
    console.error("Error fetching recent event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// @desc to add a participant for an event
// @API PATCH /events/:id
// @access PUBLIC
const addParticipant = errorHandler(async (req, res) => {
  const eventId = req.params.id;
  const { name, email, phone, rollNo, branch, year } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error("Name and email are required");
  }

  // Check if user is already registered
  const event = await eventModel.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Check if email already exists in participants
  const existingParticipant = event.participants?.find(
    (p) => p.email.toLowerCase() === email.toLowerCase()
  );

  if (existingParticipant) {
    res.status(400);
    throw new Error("You are already registered for this event");
  }

  const participant = {
    name,
    email,
    phone: phone || "",
    rollNo: rollNo || "",
    branch: branch || "",
    year: year || "",
  };

  const updatedEvent = await eventModel.findByIdAndUpdate(
    eventId,
    { $push: { participants: participant } },
    { new: true }
  );

  res.status(200).json({ message: "Registration successful", participant });
});

module.exports = { getEvents, addParticipant, getRecentEvent };
