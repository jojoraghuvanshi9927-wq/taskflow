const express = require('express');
const { body } = require('express-validator');
const {
  getTasks, getDashboardStats, getTasksByProject,
  createTask, updateTask, deleteTask,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/',                          protect, getTasks);
router.get('/dashboard',                 protect, getDashboardStats);
router.get('/project/:projectId',        protect, getTasksByProject);

router.post(
  '/',
  protect, adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('project').notEmpty().withMessage('Project is required'),
    body('assignedTo').notEmpty().withMessage('Assignee is required'),
    body('dueDate').notEmpty().withMessage('Due date is required'),
  ],
  createTask
);

router.put('/:id',    protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
