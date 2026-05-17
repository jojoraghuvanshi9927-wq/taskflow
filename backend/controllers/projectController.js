const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @route  GET /api/projects
// @access Private
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      // Admin sees all projects they created
      projects = await Project.find({ createdBy: req.user._id })
        .populate('members', 'name email role')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Member sees projects they're added to
      projects = await Project.find({ members: req.user._id })
        .populate('members', 'name email role')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/projects
// @access Private/Admin
const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { name, description, members } = req.body;

    // Validate members exist
    if (members && members.length > 0) {
      const validUsers = await User.find({ _id: { $in: members } });
      if (validUsers.length !== members.length)
        return res.status(400).json({ message: 'One or more member IDs are invalid' });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    const populated = await project.populate([
      { path: 'members', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/projects/:id
// @access Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Access check
    const isMember = project.members.some((m) => m._id.equals(req.user._id));
    const isOwner  = project.createdBy._id.equals(req.user._id);
    if (!isMember && !isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/projects/:id
// @access Private/Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.createdBy.equals(req.user._id))
      return res.status(403).json({ message: 'Only project owner can update' });

    const { name, description, members } = req.body;
    if (name)        project.name        = name;
    if (description !== undefined) project.description = description;
    if (members)     project.members     = members;

    await project.save();
    await project.populate([
      { path: 'members', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/projects/:id
// @access Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.createdBy.equals(req.user._id))
      return res.status(403).json({ message: 'Only project owner can delete' });

    // Delete all tasks in this project too
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and its tasks deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/projects/:id/members
// @access Private/Admin
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.createdBy.equals(req.user._id))
      return res.status(403).json({ message: 'Only project owner can add members' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (project.members.includes(userId))
      return res.status(400).json({ message: 'User already a member' });

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/projects/:id/members/:userId
// @access Private/Admin
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.createdBy.equals(req.user._id))
      return res.status(403).json({ message: 'Only project owner can remove members' });

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('members', 'name email role');

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
