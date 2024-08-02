const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  event_title: { type: String, required: true },
  event_video: { type: String, required: true },
  category: { type: String, required: true },
  event_date_and_time: { type: Date, required: true },
  event_address: { type: String, required: true },
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
  
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;



