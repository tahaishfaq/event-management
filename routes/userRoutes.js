const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.put("/update-profile", auth, userController.updateUserProfile);

router.put("/attach-bank-account", auth, userController.attachBankAccount);

router.get("/my-tickets", auth, userController.getMyTickets);

router.post("/withdraw", auth, userController.requestWithdrawal);

router.post("/follow/:followId", auth, userController.followUser);

router.post("/unfollow/:followId", auth, userController.unfollowUser);

router.get("/profile/:userId", userController.getUserById);

router.get('/get-followers/:userId',  userController.getFollowers);

router.get('/get-following/:userId',  userController.getFollowing);

router.get('/withdrawals-history', auth, userController.getWithdrawalHistory);

module.exports = router;
