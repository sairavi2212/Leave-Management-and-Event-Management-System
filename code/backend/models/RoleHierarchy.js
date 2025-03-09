import mongoose from 'mongoose';

const RoleHierarchySchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        unique: true
    },
    parentRole: {
        type: String,
        default: null
    },
    childRole: {
        type: String,
        default: null
    },
    level: {
        type: Number,
        required: true
    }
});

export const RoleHierarchy = mongoose.model('RoleHierarchy', RoleHierarchySchema);