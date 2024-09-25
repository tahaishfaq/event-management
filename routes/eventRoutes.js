const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventConroller');
const authMiddleware = require('../middlewares/auth');

router.post('/create', authMiddleware, eventController.createEvent);
router.get('/viewAll', eventController.getEvents);
router.get('/view/:eventId', eventController.getEventById);
router.post('/book/:eventId', authMiddleware, eventController.bookEvent);
router.get('/verify-payment-callback', authMiddleware, eventController.verifyPaymentCallback);

router.delete('/delete', eventController.deleteAllEvents);

router.get('/get-my-events', authMiddleware, eventController.getMyEvents)

router.get('/guests/:eventId', authMiddleware, eventController.getEventGuests);


router.get('/getEventsByUserId/:userId', eventController.getEventsByUserId)


router.get('/members/:eventId', eventController.getJoinedMembers);




module.exports = router;
