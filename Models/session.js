import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    user: String,
    bot: String,
    timestamp: { type: Date, default: Date.now } 
}, {_id: false})

const sessionSchema = new mongoose.Schema ({
    sessionId : {type: String, unique: true, required: true, immutable: true},
    context : {lastIntent: String, lastParameters: mongoose.Schema.Types.Mixed},
    history: {type: [historySchema], default: []},
    // MongoDB deletes the document once this time passes
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // Default expiration time is 24 hours from creation
    }
    
}, {timestamps: true});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;