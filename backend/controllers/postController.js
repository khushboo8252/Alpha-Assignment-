const Post = require('../models/Post');
const User = require('../models/User'); // Ensure User model is required

// Create Post
exports.createPost = async (req, res) => {
  const { stockSymbol, title, description, tags } = req.body;

  try {
    // Create a new post with the authenticated user's ID
    const newPost = new Post({
      stockSymbol,
      title,
      description,
      tags,
      createdBy: req.user.id,  // Attach authenticated user's ID
    });

    await newPost.save();

    res.status(201).json({ success: true, postId: newPost._id, message: 'Post created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Posts with Filters and Sorting


exports.getAllStockPosts = async (req, res) => {
  const { stockSymbol, tags } = req.query; // Extract stockSymbol and tags from query parameters
  const query = {};

  // If a stockSymbol is provided, add it to the query filter
  if (stockSymbol) {
    query.stockSymbol = stockSymbol;
  }

  // Handle tags: Ensure it's an array before using `includes`
  const tagArray = tags ? tags.split(',') : [];
  
  if (tagArray.length > 0) {
    query.tags = { $in: tagArray }; // Match posts that have any of the provided tags
  }

  try {
    // Fetch posts that match the query
    const posts = await Post.find(query);
    res.json(posts); // Send the posts as a response
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Get Stock Post by ID
exports.getStockPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('createdBy', 'username')  // Populate creator's username
      .populate('comments.user', 'username') // Populate user info in comments
      .exec();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      postId: post._id,
      stockSymbol: post.stockSymbol,
      title: post.title,
      description: post.description,
      likesCount: post.likesCount,
      comments: post.comments.map(comment => ({
        commentId: comment._id,
        userId: comment.user._id,
        username: comment.user.username,
        comment: comment.comment,
        createdAt: comment.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Stock Post
exports.deleteStockPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// controllers/postController.js


// Add a comment to a post
exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  try {
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add the comment
    post.comments.push({ user: userId, comment });
    await post.save();

    res.status(201).json({
      success: true,
      commentId: post.comments[post.comments.length - 1]._id,
      message: 'Comment added successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    // Find the post and remove the comment
    const post = await Post.findOneAndUpdate(
      { _id: postId, 'comments._id': commentId },
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Like a post
exports.likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    // Add user to the likes array and increment likesCount
    post.likes.push(userId);
    post.likesCount += 1;
    await post.save();

    res.json({ success: true, message: 'Post liked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has liked the post
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post not liked by user' });
    }

    // Remove user from the likes array and decrement likesCount
    post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    post.likesCount -= 1;
    await post.save();

    res.json({ success: true, message: 'Post unliked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



