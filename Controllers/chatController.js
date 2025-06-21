import { detectIntent } from "../dialogflow/client.js";
import {v4 as uuid } from "uuid"; 
import Session from "../Models/session.js";

const projectId = process.env.PROJECT_ID;

export const handleChat = async (req, res) => {
    try {
        const {message, sessionId} = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required"});
        }
        const id = sessionId || uuid();
        let session = await Session.findOne({sessionId: id});
        if (!session) {
            session = await Session.create({sessionId: id, context: {}, history: []},)
        }
        if (!session.context) session.context = {};
        if (!session.history) {
            session.history = [];
        }
        const nlp = await detectIntent(projectId, id , message); 
        session.history.push({
            user: message,
            bot: nlp.response
        })
        session.context.lastIntent = nlp.parameters;
        await session.save();
        return res.json ({
            sessionId: id,
            response: nlp.response,
            intent: nlp.intent,
            parameters: nlp.parameters

        });

    } catch (error) {
        console.log('Dialogflow error:', error);
        return res.status(500).json({
            error: "An error occurred while processing your request "
        })
    }
};