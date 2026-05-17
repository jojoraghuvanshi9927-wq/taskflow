const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, createProject, getProjectById,
  updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/',    protect, getProjects);
router.get('/:id', protect, getProjectById);

router.post(
  '/',
  protect, adminOnly,
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  createProject
);

router.put('/:id',    protect, adminOnly, updateProject);
router.delete('/:id', protect, adminOnly, deleteProject);

// Members
router.post('/:id/members',              protect, adminOnly, addMember);
router.delete('/:id/members/:userId',    protect, adminOnly, removeMember);

module.exports = router;
