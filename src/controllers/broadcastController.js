import { Op } from 'sequelize';
import Content from '../models/Content.js';
import User from '../models/User.js';

// @desc    Get live content for a specific teacher
// @route   GET /api/broadcast/live/:teacherId
// @access  Public
export const getLiveContent = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subject } = req.query;

    // Check if teacher exists
    const teacher = await User.findByPk(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(200).json({ message: 'No content available' });
    }

    const now = new Date();

    // Query for approved content for this teacher that is within the time window
    const where = {
      uploadedBy: teacherId,
      status: 'approved',
      startTime: { [Op.lte]: now },
      endTime: { [Op.gte]: now },
    };

    if (subject) {
      where.subject = subject.toLowerCase();
    }

    const contents = await Content.findAll({
      where,
      order: [['createdAt', 'ASC']]
    });

    if (contents.length === 0) {
      return res.status(200).json({ message: 'No content available' });
    }

    // Determine active content for each subject based on rotation
    res.json(calculateRotation(contents));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to determine active content for each subject based on rotation
const calculateRotation = (contents) => {
  // Group by subject
  const subjectsMap = {};
  contents.forEach((content) => {
    if (!subjectsMap[content.subject]) {
      subjectsMap[content.subject] = [];
    }
    subjectsMap[content.subject].push(content);
  });

  const activeContent = [];

  for (const sub in subjectsMap) {
    const items = subjectsMap[sub];
    
    const totalDuration = items.reduce((sum, item) => sum + (item.rotationDuration || 5), 0);
    
    const currentMinutes = Math.floor(Date.now() / (1000 * 60));
    let elapsedInCycle = currentMinutes % totalDuration;

    let selectedItem = items[0];
    let cumulativeTime = 0;

    for (const item of items) {
      cumulativeTime += (item.rotationDuration || 5);
      if (elapsedInCycle < cumulativeTime) {
        selectedItem = item;
        break;
      }
    }

    activeContent.push(selectedItem);
  }

  return activeContent;
};
