require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  createTransferRecipient,
  initiateTransfer,
  chargeCard,
} = require("../utils/paystack");
const Withdrawal = require('../models/Withdrawal');
const JWT_SECRET = process.env.JWT_SECRET;

exports.registerUser = async (req, res) => {
  const {
    fullname,
    dateOfBirth,
    email,
    phone_number,
    password,
    profile_picture,
    gender,  // Include gender in the request body
  } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate the gender field
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullname,
      dateOfBirth,
      email,
      phone_number,
      password: hashedPassword,
      profile_picture,
      gender,  // Save gender in the user model
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const userWithoutPassword = await User.findOne({ email }).select(
      "-password"
    );
    res
      .status(200)
      .json({
        message: "User login successful",
        token,
        user: userWithoutPassword,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullname, dateOfBirth, phone_number, profile_picture } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullname) user.fullname = fullname;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (phone_number) user.phone_number = phone_number;
    if (profile_picture) user.profile_picture = profile_picture;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.attachBankAccount = async (req, res) => {
  const userId = req.user.id;
  const { bank_account_number, bank_code } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bank_account_number = bank_account_number;
    user.bank_code = bank_code;

    await user.save();

    res
      .status(200)
      .json({ message: "Bank account attached successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTickets = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate({
      path: "my_tickets",
      populate: {
        path: "created_by",
        select: "fullname email profile_picture",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.my_tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.requestWithdrawal = async (req, res) => {
//   const userId = req.user.id;

//   try {
//       const user = await User.findById(userId);

//       if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//       }

//       if (!user.bank_account_number || !user.bank_code) {
//           return res.status(400).json({ message: 'Bank account information is not attached' });
//       }

//       const amountToWithdraw = user.total_earnings;

//       if (amountToWithdraw <= 50) {
//           return res.status(400).json({ message: 'Earnings must be greater than 50 to request a withdrawal' });
//       }

//       // Create transfer recipient
//       const recipientData = await createTransferRecipient(user.bank_account_number, user.bank_code, user.fullname);
//       const recipient_code = recipientData.data.recipient_code;

//       // Initiate transfer
//       const transferData = await initiateTransfer(amountToWithdraw, recipient_code);

//       console.log(recipientData);

//       if (transferData.data.status === 'success') {
//           // Update user's earnings
//           user.total_earnings = 0;
//           await user.save();

//           res.status(200).json({ message: 'Withdrawal request successful. Amount transferred to your account.', amount: amountToWithdraw });
//       } else {
//           res.status(400).json({ message: 'Transfer failed' });
//       }
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// };

exports.requestWithdrawal = async (req, res) => {
  const userId = req.user.id;
  const { card_number, card_expiry_month, card_expiry_year, card_cvv } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const amountToWithdraw = user.total_earnings * 100; // Amount in kobo

    if (amountToWithdraw <= 5000) {
      return res.status(400).json({
        message: "Amount must be greater than NGN 50 to request a withdrawal",
      });
    }

    const chargeResponse = await chargeCard(user.email, amountToWithdraw, {
      card_number,
      card_expiry_month,
      card_expiry_year,
      card_cvv,
    });

    if (chargeResponse.data.status !== "success") {
      return res.status(400).json({ message: "Failed to charge card" });
    }

    const authorization_code = chargeResponse.data.authorization.authorization_code;
    const recipientData = await createTransferRecipient(authorization_code, user.fullname);
    const recipient_code = recipientData.data.recipient_code;

    const transferData = await initiateTransfer(amountToWithdraw, recipient_code);

    // Save withdrawal history
    const withdrawal = new Withdrawal({
      user: userId,
      amount: amountToWithdraw,
      status: transferData.status === "success" ? 'completed' : 'failed',
    });
    await withdrawal.save();

    if (transferData.status === "success") {
      user.total_earnings -= amountToWithdraw / 100; // Convert back to NGN
      await user.save();
      res.status(200).json({
        message: "Withdrawal request successful. Amount transferred to your card.",
        amount: amountToWithdraw / 100,
      });
    } else {
      res.status(400).json({ message: "Transfer failed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.followUser = async (req, res) => {
  const userId = req.user.id;
  const { followId } = req.params; // ID of the user to follow

  try {
    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    if (!followUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the followId to the following array if not already followed
    if (!user.following.includes(followId)) {
      user.following.push(followId);
      await user.save();
    }

    // Add the userId to the followers array of the followUser
    if (!followUser.followers.includes(userId)) {
      followUser.followers.push(userId);
      await followUser.save();
    }

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  const userId = req.user.id;
  const { followId } = req.params; // ID of the user to unfollow

  try {
    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    if (!followUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the followId from the following array
    user.following = user.following.filter(id => id.toString() !== followId);
    await user.save();

    // Remove the userId from the followers array of the followUser
    followUser.followers = followUser.followers.filter(id => id.toString() !== userId);
    await followUser.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getUserById = async (req, res) => {
  const { userId } = req.params; // Get the user ID from the request parameters

  try {
    // Find the user by ID and exclude the password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Fetch followers of a user
exports.getFollowers = async (req, res) => {
  const { userId } = req.params; 

  try {
    const user = await User.findById(userId).populate('followers', 'fullname profile_picture');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch users that a user is following
exports.getFollowing = async (req, res) => {
  const { userId } = req.params; 

  try {
    const user = await User.findById(userId).populate('following', 'fullname profile_picture');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWithdrawalHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const withdrawals = await Withdrawal.find({ user: userId }).sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};