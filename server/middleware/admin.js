const User = require('../models/User');

const admin = async (req, res, next) => {
    try {
        // Get user from auth middleware
        const userId = req.user.id;
        
        // Find user and check if admin
        const user = await User.findById(userId);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ message: 'Server error in admin verification' });
    }
};

module.exports = admin;
