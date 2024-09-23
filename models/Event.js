const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    event_title: { type: String, required: true },
    event_video: { type: String, required: true },
    category: { type: String, required: true },
    event_date_and_time: { type: Date, required: true },
    event_address: {
      address: { type: String, required: true },
      longitude: { type: Number, required: false },
      latitude: { type: Number, required: false },
    },
    additional_info: { type: String, required: false },
    ticket_price: { type: Number, required: true },
    event_description: { type: String, required: true },
    event_max_capacity: { type: Number, required: true },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booked_tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    age_restriction: {
      type: [String],
      enum: ["under_18", "20s", "30s", "40_and_above"],
      default: [],
    },

    gender_restriction: {
      type: [String],
      enum: ["male", "female", "other"],
      default: [],
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
