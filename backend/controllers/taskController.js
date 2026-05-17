const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @route  GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      // Admin sees all tasks in their projects
      const projects = await Project.find({ createdBy: req.user._id });
      const projectIds = projects.map((p) => p._id);
      tasks = await Task.find({ project: { $in: projectIds } })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Member sees only tasks assigned to them
      tasks = await Task.find({ assignedTo: req.user._id })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/tasks/dashboard
// @access Private
const getDashboardStats = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      const projects = await Project.find({ createdBy: req.user._id });
      const projectIds = projects.map((p) => p._id);
      tasks = await Task.find({ project: { $in: projectIds } });
    } else {
      tasks = await Task.find({ assignedTo: req.user._id });
    }

    const now = new Date();
    const stats = {
      total:     tasks.length,
      pending:   tasks.filter((t) => t.status === 'pending').length,
      inProgress:tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue:   tasks.filter((t) => t.status !== 'completed' && new Date(t.dueDate) < now).length,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/tasks/project/:projectId
// @access Private
const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/tasks
// @access Private/Admin
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { title, description, project, assignedTo, status, priority, dueDate } = req.body;

    // Verify project exists and belongs to admin
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });
    if (!proj.createdBy.equals(req.user._id))
      return res.status(403).json({ message: 'Not your project' });

    // Verify assignee is a member of the project
    const isMember = proj.members.some((m) => m.equals(assignedTo));
    if (!isMember)
      return res.status(400).json({ message: 'Assignee must be a project member' });

    const task = await Task.create({
      title, description, project, assignedTo,
      createdBy: req.user._id,
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate,
    });

    await task.populate([
      { path: 'project',    select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy',  select: 'name email' },
    ]);

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'admin') {
      // Admin can update everything
      const { title, description, assignedTo, status, priority, dueDate, project } = req.body;
      if (title)       task.title       = title;
      if (description !== undefined) task.description = description;
      if (assignedTo)  task.assignedTo  = assignedTo;
      if (status)      task.status      = status;
      if (priority)    task.priority    = priority;
      if (dueDate)     task.dueDate     = dueDate;
      if (project)     task.project     = project;
    } else {
      // Member can only update status of their own task
      if (!task.assignedTo.equals(req.user._id))
        return res.status(403).json({ message: 'Not your task' });
      if (req.body.status) task.status = req.body.status;
    }

    await task.save();
    await task.populate([
      { path: 'project',    select: 'name' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy',  select: 'name email' },
    ]);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/tasks/:id
// @access Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!task.createdBy.equals(req.user._id))
      return res.status(403).json({ message: 'Only task creator can delete' });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getTasks,
  getDashboardStats,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
};
