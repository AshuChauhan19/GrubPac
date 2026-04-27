import Content from '../models/Content.js';
import User from '../models/User.js';

// @desc    Upload content
// @route   POST /api/content/upload
// @access  Private/Teacher
export const uploadContent = async (req, res) => {
  try {
    const { title, description, subject, startTime, endTime, rotationDuration } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and Subject are mandatory' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const content = await Content.create({
      title,
      description,
      subject,
      filePath: req.file.filename, // Store only the filename
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user.id,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      rotationDuration: rotationDuration || 5,
    });

    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get teacher's own content status
// @route   GET /api/content/my-content
// @access  Private/Teacher
export const getMyContent = async (req, res) => {
  try {
    const contents = await Content.findAll({ 
      where: { uploadedBy: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all content for principal
// @route   GET /api/content/all
// @access  Private/Principal
export const getAllContent = async (req, res) => {
  try {
    const contents = await Content.findAll({
      include: [
        { model: User, as: 'uploader', attributes: ['name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending content for principal
// @route   GET /api/content/pending
// @access  Private/Principal
export const getPendingContent = async (req, res) => {
  try {
    const contents = await Content.findAll({ 
      where: { status: 'pending' },
      include: [
        { model: User, as: 'uploader', attributes: ['name', 'email'] }
      ]
    });
    res.json(contents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or Reject content
// @route   PUT /api/content/review/:id
// @access  Private/Principal
export const reviewContent = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const content = await Content.findByPk(req.params.id);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    content.status = status;
    content.rejectionReason = status === 'rejected' ? rejectionReason : null;
    content.approvedBy = status === 'approved' ? req.user.id : null;
    content.approvedAt = status === 'approved' ? new Date() : null;

    await content.save();

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
