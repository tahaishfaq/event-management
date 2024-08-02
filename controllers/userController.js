require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  createTransferRecipient,
  initiateTransfer,
  chargeCard,
} = require("../utils/paystack");

const JWT_SECRET = process.env.JWT_SECRET;

exports.registerUser = async (req, res) => {
  const {
    fullname,
    dateOfBirth,
    email,
    phone_number,
    password,
    front_picture,
    back_picture,
    profile_picture
  } = req.body;

  if (!front_picture || !back_picture || !profile_picture) {
    return res
      .status(400)
      .json({ message: "All Pictures are required" });
  }

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullname,
      dateOfBirth,
      email,
      phone_number,
      password: hashedPassword,
      front_picture,
      back_picture,
      profile_picture
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
        select: "fullname email",
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
  const { card_number, card_expiry_month, card_expiry_year, card_cvv } =
    req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const amountToWithdraw = user.total_earnings * 100; // Paystack amount should be in kobo (NGN)

    if (amountToWithdraw <= 5000) {
      // Ensure amount is greater than NGN 50
      return res
        .status(400)
        .json({
          message: "Amount must be greater than NGN 50 to request a withdrawal",
        });
    }

    // Charge the card to get authorization code
    const chargeResponse = await chargeCard(user.email, amountToWithdraw, {
      card_number,
      card_expiry_month,
      card_expiry_year,
      card_cvv,
    });

    console.log(chargeResponse?.data);

    if (chargeResponse.data.status !== "success") {
      return res.status(400).json({ message: "Failed to charge card" });
    }

    const authorization_code =
      chargeResponse.data.authorization.authorization_code;

    // Create transfer recipient using the authorization code
    const recipientData = await createTransferRecipient(
      authorization_code,
      user.fullname
    );
    const recipient_code = recipientData.data.recipient_code;

    // Initiate transfer
    const transferData = await initiateTransfer(
      amountToWithdraw,
      recipient_code
    );

    if (transferData.status === "success") {
      // Update user's earnings
      user.total_earnings -= amount;
      await user.save();

      res
        .status(200)
        .json({
          message:
            "Withdrawal request successful. Amount transferred to your card.",
          amount: amountToWithdraw / 100,
        });
    } else {
      res.status(400).json({ message: "Transfer failed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
