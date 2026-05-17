const express = require('express');
const { getAllUsers, getMembers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/',        protect, adminOnly, getAllUsers);
router.get('/members', protect, adminOnly, getMembers);

module.exports = router;
