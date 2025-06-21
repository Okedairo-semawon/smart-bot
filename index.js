import express from "express";
import dotenv from "dotenv";
import connectDB from "./configuration/db.js";
import chatRoute from "./Routes/chatRoute.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use('/chat', chatRoute);


//  connect to mongodb
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
}).catch ((error) => {
    console.error('DB connection failed:', error);
});
