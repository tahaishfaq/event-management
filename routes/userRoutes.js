const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/update-profile', auth, userController.updateUserProfile);
router.put('/attach-bank-account', auth, userController.attachBankAccount);
router.get('/my-tickets', auth, userController.getMyTickets);
router.post('/withdraw', auth, userController.requestWithdrawal);

module.exports = router;
