import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

// update user
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      console.log(user);
      res.status(200).json('Account had been updated');
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json({
      message: "You are not authorized to update this user's account.",
    });
  }
});

// delete a user
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json('Account had been deleted');
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json({
      message: "You are not authorized to delete this user's account.",
    });
  }
});

// get a user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// follow a user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (user.followers.includes(currentUser._id)) {
        return res.status(403).json({
          message: 'You are already following this user.',
        });
      } else {
        await user.updateOne({
          $push: { followers: currentUser._id },
        });

        await currentUser.updateOne({
          $push: { following: user._id },
        });
        res.status(200).json('You are now following this user.');
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json({
      message: "You can't follow yourself.",
    });
  }
});

// unfollow a user
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user.followers.includes(currentUser._id)) {
        return res.status(403).json({
          message: 'You are not following this user.',
        });
      } else {
        await user.updateOne({
          $pull: { followers: currentUser._id },
        });

        await currentUser.updateOne({
          $pull: { following: user._id },
        });
        res.status(200).json('You are no longer following this user.');
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json({
      message: "You can't unfollow yourself.",
    });
  }
});

export default router;
