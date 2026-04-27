import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  rejectionReason: {
    type: DataTypes.STRING,
  },
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id',
    },
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  startTime: {
    type: DataTypes.DATE,
  },
  endTime: {
    type: DataTypes.DATE,
  },
  rotationDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
});

// Associations
User.hasMany(Content, { foreignKey: 'uploadedBy', as: 'uploadedContents' });
Content.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

User.hasMany(Content, { foreignKey: 'approvedBy', as: 'approvedContents' });
Content.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

export default Content;
