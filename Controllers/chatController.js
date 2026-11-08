import {randomUUID} from 'node:crypto';
import {detectIntent} from "../dialogflow/client.js";
import Session from "../Models/session.js"
import { env } from "../configuration/env.js";


// Input has already been authenticated and validated by the middleware:
// req.chat.message is a trimmed string within the length limit and
// req.chat.sessionId is either undefined or a well-formed UUID v4 string.

export const handleChat = async (req, res) => {
    const {message} = req.chat;
    const id = req.chat.sessionId ?? randomUUID();

    try {
        const nlp = await detectIntent(env.projectId, id, message);
        // One atomic upsert replaces find + create + save:
        //  - $slice keeps only the newest N turns, so a session can't grow forever
        //  - expiresAt is pushed forward on every message; a TTL index deletes idle sessions

        await Session.findOneAndUpdate(
            {sessionId: id},
            {
                $push: {
                    history: {
                        $each: [{user: message, bot: nlp.response, timestamp: new Date()}],
                        $slice: -env.maxHistory,
                    },
                },
                $set: {
                    'content.lastIntent': nlp.intent,
                    'content.lastParameters': nlp.parameters,
                    expiresAt: new Date(Date.now() + env.sessionTtlMs),
                },
            },
            { upsert: true, setDefaultsOnInsert: true }
        );

        return res.json({
            sessionId: id,
            response: nlp.response,
            intent: nlp.intent,
            parameters: nlp.parameters,
        })
    } catch(error) {
        console.error('Chat request failed:', error.code ?? error.name, error.message); 
        return res.status(500).json({
            error: "An error occured while processing yoiur request"
        })
    }
};