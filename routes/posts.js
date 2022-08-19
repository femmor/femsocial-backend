import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// create a post
router.post('/create', async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const post = await newPost.save();
    res.status(200).json(post);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// update a post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      res.status(200).json('Post updated');
    } else {
      res.status(401).json({ message: 'You can only update your own post' });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json('Post deleted');
    } else {
      res.status(401).json({ message: 'You can only delete your own post' });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// like / dislike a post
router.put('/like/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.body.userId)) {
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });
      res.status(200).json('Post disliked');
    } else {
      await post.updateOne({
        $push: {
          likes: req.body.userId,
        },
      });
      res.status(200).json('Post liked');
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// get a post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// get timeline posts - Call all posts of followings and posts of user
router.get('/timeline/all', async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    const userPosts = await Post.find({
      userId: currentUser._id,
    });
    const friendPosts = await Promise.all(
      currentUser.following.map(friendId => {
        return Post.find({
          userId: friendId,
        });
      })
    );

    res.status(200).json(userPosts.concat(...friendPosts));

    /**
       *
       * Another methods to get all posts of followings and posts of user
       *
       * // const posts = await Post.find({
        //   $or: [
        //     { userId: req.params.id },
        //     { userId: { $in: req.body.followings } },
        //   ],
        // }).sort({ createdAt: -1 });
       */
  } catch (error) {
    return res.status(500).json(error);
  }
});

export default router;
