const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createPost,
  getAllStockPosts,
  getStockPostById,
  deleteStockPost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
 
} = require('../controllers/postController');


router.post('/', authMiddleware, createPost);
router.get('/', getAllStockPosts);
router.get('/:postId', getStockPostById);
router.delete('/:postId', authMiddleware, deleteStockPost);


router.post('/:postId/like', authMiddleware, likePost); // Like a post
router.delete('/:postId/like', authMiddleware, unlikePost);

router.post('/:postId/comments', authMiddleware, addComment); // Add comment
router.delete('/:postId/comments/:commentId', authMiddleware, deleteComment); 




module.exports = router;
