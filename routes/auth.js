import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const newUser = await new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    // generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    newUser.password = hashedPassword;

    // save new user to DB
    await newUser.save();
    res.status(200).send(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    // find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }

    // compare password with hashed password
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).send({ message: 'Invalid password' });
    }

    res.status(200).send({ message: 'User logged in successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
