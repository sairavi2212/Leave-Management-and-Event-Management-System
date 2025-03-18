import mongoose from 'mongoose';

const EventsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    start: {
        type: Date,
        required: true,
    },
    end: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    comments: {
        type: Array,
        required: true,
    },
    selected_dropdown: {
        type: String,
        required: true,
    },
    image_blob: {
        type: String,
        required: false,
    },
    locations: {
        type: Array,
        required: true,
    },
    projects: {
        type: Array,
        required: true,
    },
});

const Event = mongoose.model('Event', EventsSchema);

export default Event;