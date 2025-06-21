import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema ({
    sessionId : {
        type: String,
        context : {type: String, default: {}},
        history: [ {
            user: String,
            bot: String,
            timestamp: { type: Date, default: Date.noe}
        }],
        default: []
    }, 


}, {timestamp: true});

const Session = mongoose.model('Session', sessionSchema);
export default Session;