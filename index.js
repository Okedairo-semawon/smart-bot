import { env } from './configuration/env.js'; // validates config first; exits if unsafe
import connectDB from './configuration/db.js';
import { createApp } from './app.js';
import 'dotenv/config';

await connectDB();

createApp().listen(env.port, () => {
  console.log(`Server is running on port: ${env.port}`);
});

// import express from "express";
// import dotenv from "dotenv";
// import connectDB from "./configuration/db.js";
// import chatRoute from "./Routes/chatRoute.js";
// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 8000;

// app.use(express.json());
// app.use('/chat', chatRoute);


// //  connect to mongodb
// connectDB().then(() => {
//     app.listen(PORT, () => {
//         console.log(`Server is running on port: ${PORT}`);
//     });
// }).catch ((error) => {
//     console.error('DB connection failed:', error);
// });
