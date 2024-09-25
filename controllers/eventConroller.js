// require('dotenv').config();
// const Event = require('../models/Event');
// const User = require('../models/User');
// const { initializePayment, verifyPayment } = require('../utils/paystack');

// exports.createEvent = async (req, res) => {
//     const { event_title, category, event_date_and_time, event_address, additional_info, ticket_price, event_description, event_max_capacity, event_video } = req.body;
//     const created_by = req.user.id;

//     try {
//         const newEvent = new Event({
//             event_title,
//             event_video,
//             category,
//             event_date_and_time,
//             event_address,
//             additional_info,
//             ticket_price,
//             event_description,
//             event_max_capacity,
//             created_by
//         });

//         await newEvent.save();
//         res.status(201).json({ message: 'Event created successfully', event: newEvent });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.getEvents = async (req, res) => {
//     try {
//         const events = await Event.find().populate('created_by').sort({ createdAt: -1 });
//         res.status(200).json(events);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.bookEvent = async (req, res) => {
//     const { eventId } = req.params;
//     const userId = req.user.id;
//     const callbackUrl = `${process.env.FRONTEND_URL}/verify-payment?eventId=${eventId}&userId=${userId}`;

//     try {
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const event = await Event.findById(eventId);

//         if (!event) {
//             return res.status(404).json({ message: 'Event not found' });
//         }

//         if (event.booked_tickets.length >= event.event_max_capacity) {
//             return res.status(400).json({ message: 'Event is fully booked' });
//         }

//         // Initialize payment
//         const paymentData = await initializePayment(event.ticket_price, user?.email, callbackUrl);
//         const { authorization_url, reference } = paymentData.data;

//         // Return the authorization URL and reference
//         res.status(200).json({ authorization_url, reference });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.verifyPaymentCallback = async (req, res) => {
//     const { reference, eventId, userId } = req.query;

//     try {
//         const event = await Event.findById(eventId);

//         if (!event) {
//             return res.status(404).json({ message: 'Event not found' });
//         }

//         const paymentData = await verifyPayment(reference);

//         if (paymentData.data.status === 'success') {
//             // If payment is successful, book the ticket
//             event.booked_tickets.push(userId);
//             await event.save();

//             const user = await User.findById(userId);
//             user.my_tickets.push(eventId);
//             await user.save();

//             const eventCreator = await User.findById(event.created_by);
//             const ticketPrice = event.ticket_price;
//             const platformCommission = ticketPrice * 0.20;
//             const earnings = ticketPrice - platformCommission;
//             eventCreator.total_earnings += earnings;
//             await eventCreator.save();

//             res.status(200).json({ message: 'Ticket booked successfully', event });
//         } else {
//             res.status(400).json({ message: 'Payment verification failed' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.getEventById = async (req, res) => {
//     const { eventId } = req.params;

//     try {
//         const event = await Event.findById(eventId).populate('created_by');

//         if (!event) {
//             return res.status(404).json({ message: 'Event not found' });
//         }

//         res.status(200).json(event);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// require("dotenv").config();
// const Event = require("../models/Event");
// const User = require("../models/User");
// const { initializePayment, verifyPayment } = require("../utils/paystack");

// // Create a new event
// exports.createEvent = async (req, res) => {
//   const {
//     event_title,
//     category,
//     event_date_and_time,
//     event_address,
//     additional_info,
//     ticket_price,
//     event_description,
//     event_max_capacity,
//     event_video,
//   } = req.body;

//   const created_by = req.user.id;

//   try {
//     const newEvent = new Event({
//       event_title,
//       event_video,
//       category,
//       event_date_and_time,
//       event_address: {
//         address: event_address.address,
//         longitude: event_address.longitude,
//         latitude: event_address.latitude,
//       },
//       additional_info,
//       ticket_price,
//       event_description,
//       event_max_capacity,
//       created_by,
//     });

//     await newEvent.save();
//     res
//       .status(201)
//       .json({ message: "Event created successfully", event: newEvent });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get all events
// exports.getEvents = async (req, res) => {
//   try {
//     const events = await Event.find()
//       .populate("created_by")
//       .sort({ createdAt: -1 });
//     res.status(200).json(events);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Book an event
// exports.bookEvent = async (req, res) => {
//   const { eventId } = req.params;
//   const userId = req.user.id;
//   const callbackUrl = `${process.env.FRONTEND_URL}/verify-payment?eventId=${eventId}&userId=${userId}`;

//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const event = await Event.findById(eventId);

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     if (event.event_max_capacity == 0) {
//       return res.status(400).json({ message: "Event is fully booked" });
//     }

//     // Initialize payment
//     const paymentData = await initializePayment(
//       event.ticket_price,
//       user?.email,
//       callbackUrl
//     );
//     const { authorization_url, reference } = paymentData.data;

//     // Return the authorization URL and reference
//     res.status(200).json({ authorization_url, reference });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Verify payment and book ticket
// exports.verifyPaymentCallback = async (req, res) => {
//   const { reference, eventId, userId } = req.query; // Get the reference, eventId, and userId from the query

//   try {
//     const event = await Event.findById(eventId)
//       .populate("created_by", "fullname email profile_picture") // Populate event creator's data
//       .populate("booked_tickets", "fullname email profile_picture"); // Populate booked users' data

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     const paymentData = await verifyPayment(reference); // Verify payment with Paystack

//     if (paymentData.data.status === "success") {
//       // Check if the event still has available tickets
//       // if (event.booked_tickets.length >= event.event_max_capacity) {
//       //   return res.status(400).json({ message: "Event is fully booked" });
//       // }

//       // Add the user to the event's booked tickets
//       event.booked_tickets.push(userId);
//       event.event_max_capacity -= 1;
//       await event.save();

//       // Add the event to the user's booked tickets
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }
//       user.my_tickets.push(event._id);
//       await user.save();

//       // Update event creator's total earnings after deducting platform commission
//       const eventCreator = await User.findById(event.created_by);
//       const ticketPrice = event.ticket_price;
//       const platformCommission = ticketPrice * 0.2;
//       const earnings = ticketPrice - platformCommission;

//       eventCreator.total_earnings += earnings;
//       await eventCreator.save();

//       // Populate the user's data in the event response and send the response back
//       const updatedEvent = await Event.findById(eventId)
//         .populate("created_by", "fullname email profile_picture")
//         .populate("booked_tickets", "fullname email profile_picture");

//       res.status(200).json({
//         message: "Ticket booked successfully",
//         event: updatedEvent,
//         user: user, // Include the user information in the response
//       });
//     } else {
//       res.status(400).json({ message: "Payment verification failed" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get event by ID
// exports.getEventById = async (req, res) => {
//   const { eventId } = req.params;

//   try {
//     const event = await Event.findById(eventId).populate("created_by");

//     if (!event) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     res.status(200).json(event);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete all events
// exports.deleteAllEvents = async (req, res) => {
//   try {
//     await Event.deleteMany({}); // This deletes all events from the collection
//     res
//       .status(200)
//       .json({ message: "All events have been deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getUserEvents = async (req, res) => {
//   const userId = req.user.id;

//   try {
//     // Find events created by the user
//     const createdEvents = await Event.find({ created_by: userId })
//       .sort({ createdAt: -1 })
//       .populate("created_by", "fullname email profile_picture");

//     // Find events where the user has booked tickets
//     const bookedEvents = await Event.find({ booked_tickets: userId })
//       .sort({ createdAt: -1 })
//       .populate("created_by", "fullname email profile_picture");

//     res.status(200).json({ createdEvents, bookedEvents });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

require("dotenv").config();
const Event = require("../models/Event");
const User = require("../models/User");
const { initializePayment, verifyPayment } = require("../utils/paystack");
const moment = require("moment");

// Create a new event with age and gender restrictions
exports.createEvent = async (req, res) => {
  const {
    event_title,
    category,
    event_date_and_time,
    event_address,
    additional_info,
    ticket_price,
    event_description,
    event_max_capacity,
    event_video,
    age_restriction, // New age restriction field
    gender_restriction, // New gender restriction field
  } = req.body;

  const created_by = req.user.id;

  try {
    const newEvent = new Event({
      event_title,
      event_video,
      category,
      event_date_and_time,
      event_address: {
        address: event_address.address,
        longitude: event_address.longitude,
        latitude: event_address.latitude,
      },
      additional_info,
      ticket_price,
      event_description,
      event_max_capacity,
      created_by,
      age_restriction,
      gender_restriction,
    });

    await newEvent.save();
    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("created_by")
      .populate("booked_tickets", "fullname email profile_picture")
      .sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate age
const calculateAge = (dateOfBirth) => {
  return moment().diff(moment(dateOfBirth), "years");
};

exports.bookEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  const callbackUrl = `${process.env.FRONTEND_URL}/verify-payment?eventId=${eventId}&userId=${userId}`;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.event_max_capacity === 0) {
      return res.status(400).json({ message: "Event is fully booked" });
    }

    // Check if the ticket price is 0 (free event)
    if (event.ticket_price === 0) {
      const bookingResponse = await bookTicketForUser(eventId, userId);
      return res.status(200).json(bookingResponse);
    }

    // Calculate the user's age
    const userAge = calculateAge(user.dateOfBirth);

    // Check age restriction
    let isAgeRestricted = false;
    if (event.age_restriction.includes("under_18") && userAge < 18) {
      isAgeRestricted = true;
    } else if (
      event.age_restriction.includes("20s") &&
      userAge >= 20 &&
      userAge < 30
    ) {
      isAgeRestricted = true;
    } else if (
      event.age_restriction.includes("30s") &&
      userAge >= 30 &&
      userAge < 40
    ) {
      isAgeRestricted = true;
    } else if (
      event.age_restriction.includes("40_and_above") &&
      userAge >= 40
    ) {
      isAgeRestricted = true;
    }

    if (isAgeRestricted) {
      return res
        .status(403)
        .json({
          message:
            "You are not allowed to book this event due to age restrictions.",
        });
    }

    // Check gender restriction
    if (event.gender_restriction.includes(user.gender)) {
      return res
        .status(403)
        .json({
          message:
            "You are not allowed to book this event due to gender restrictions.",
        });
    }

    // Initialize payment for events with a ticket price greater than 0
    const paymentData = await initializePayment(
      event.ticket_price,
      user?.email,
      callbackUrl
    );
    const { authorization_url, reference } = paymentData.data;

    // Return the authorization URL and reference
    res.status(200).json({ authorization_url, reference });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to book a ticket for a user
const bookTicketForUser = async (eventId, userId) => {
  try {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Add the user ID to the booked tickets
    if (!event.booked_tickets.includes(userId)) {
      event.booked_tickets.push(userId);
      event.event_max_capacity -= 1; // Decrease capacity
      await event.save();
    }

    // Add the event to the user's booked tickets
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.my_tickets.includes(eventId)) {
      user.my_tickets.push(eventId);
      await user.save();
    }

    return { success: true, message: "Ticket booked successfully" };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Verify payment and book ticket with age and gender restriction checks
exports.verifyPaymentCallback = async (req, res) => {
  const { reference, eventId, userId } = req.query;

  try {
    const event = await Event.findById(eventId)
      .populate("created_by", "fullname email profile_picture")
      .populate("booked_tickets", "fullname email profile_picture");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const paymentData = await verifyPayment(reference);

    if (paymentData.data.status === "success") {
      // Check if the event still has available tickets
      if (event.event_max_capacity === 0) {
        return res.status(400).json({ message: "Event is fully booked" });
      }

      // Add the user to the event's booked tickets
      event.booked_tickets.push(userId);
      event.event_max_capacity -= 1;
      await event.save();

      // Add the event to the user's booked tickets
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.my_tickets.push(event._id);
      await user.save();

      // Update event creator's total earnings after deducting platform commission
      const eventCreator = await User.findById(event.created_by);
      const ticketPrice = event.ticket_price;
      const platformCommission = ticketPrice * 0.2;
      const earnings = ticketPrice - platformCommission;

      eventCreator.total_earnings += earnings;
      await eventCreator.save();

      // Populate the user's data in the event response and send the response back
      const updatedEvent = await Event.findById(eventId)
        .populate("created_by", "fullname email profile_picture")
        .populate("booked_tickets", "fullname email profile_picture");

      res.status(200).json({
        message: "Ticket booked successfully",
        event: updatedEvent,
        user: user, // Include the user information in the response
      });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId).populate("created_by");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all events
exports.deleteAllEvents = async (req, res) => {
  try {
    await Event.deleteMany({});
    res
      .status(200)
      .json({ message: "All events have been deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyEvents = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find events created by the user
    const createdEvents = await Event.find({ created_by: userId })
      .sort({ createdAt: -1 })
      .populate("created_by", "fullname email profile_picture");

    // Find events where the user has booked tickets
    const bookedEvents = await Event.find({ booked_tickets: userId })
      .sort({ createdAt: -1 })
      .populate("created_by", "fullname email profile_picture");

    res.status(200).json({ createdEvents, bookedEvents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventGuests = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Find the event by its ID and populate the 'booked_tickets' field
    const event = await Event.findById(eventId).populate(
      "booked_tickets", // Assuming 'booked_tickets' contains user IDs
      "fullname email profile_picture gender phone_number" // Populate only the necessary fields
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Return the list of booked users (guests)
    res.status(200).json({
      message: "Guests retrieved successfully",
      guests: event.booked_tickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventsByUserId = async (req, res) => {
  const { userId } = req.params; // Get the user ID from route parameters

  try {
    // Find events created by the user
    const createdEvents = await Event.find({ created_by: userId })
      .sort({ createdAt: -1 })
      .populate("created_by", "fullname email profile_picture");

    // Find events where the user has booked tickets
    const bookedEvents = await Event.find({ booked_tickets: userId })
      .sort({ createdAt: -1 })
      .populate("created_by", "fullname email profile_picture");

    res.status(200).json({ createdEvents, bookedEvents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJoinedMembers = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId).populate(
      "booked_tickets",
      "fullname profile_picture"
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event.booked_tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
