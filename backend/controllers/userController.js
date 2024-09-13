const User = require('../models/User');

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('username bio profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




// Update User Profile
exports.updateUserProfile = async (req, res) => {
  const { username, bio, profilePicture } = req.body;
  try {
    // Ensure the user ID is available from the authentication middleware
    const user = await User.findByIdAndUpdate(
      req.userId, // Assuming req.userId is set by authMiddleware
      { username, bio, profilePicture },
      { new: true, runValidators: true } // Return updated document and validate
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
