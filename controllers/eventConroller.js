require('dotenv').config();
const Event = require('../models/Event');
const User = require('../models/User');
const { initializePayment, verifyPayment } = require('../utils/paystack');

exports.createEvent = async (req, res) => {
    const { event_title, category, event_date_and_time, event_address, additional_info, ticket_price, event_description, event_max_capacity, event_video } = req.body;
    const created_by = req.user.id;

    try {
        const newEvent = new Event({
            event_title,
            event_video,
            category,
            event_date_and_time,
            event_address,
            additional_info,
            ticket_price,
            event_description,
            event_max_capacity,
            created_by
        });

        await newEvent.save();
        res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('created_by');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.bookEvent = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;
    const callbackUrl = `${process.env.FRONTEND_URL}/verify-payment?eventId=${eventId}&userId=${userId}`;
    
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.booked_tickets.length >= event.event_max_capacity) {
            return res.status(400).json({ message: 'Event is fully booked' });
        }

        // Initialize payment
        const paymentData = await initializePayment(event.ticket_price, user?.email, callbackUrl);
        const { authorization_url, reference } = paymentData.data;

        // Return the authorization URL and reference
        res.status(200).json({ authorization_url, reference });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyPaymentCallback = async (req, res) => {
    const { reference, eventId, userId } = req.query;

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const paymentData = await verifyPayment(reference);

        if (paymentData.data.status === 'success') {
            // If payment is successful, book the ticket
            event.booked_tickets.push(userId);
            await event.save();

            const user = await User.findById(userId);
            user.my_tickets.push(eventId);
            await user.save();

            const eventCreator = await User.findById(event.created_by);
            const ticketPrice = event.ticket_price;
            const platformCommission = ticketPrice * 0.20;
            const earnings = ticketPrice - platformCommission;
            eventCreator.total_earnings += earnings;
            await eventCreator.save();

            res.status(200).json({ message: 'Ticket booked successfully', event });
        } else {
            res.status(400).json({ message: 'Payment verification failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getEventById = async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findById(eventId).populate('created_by');
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



