const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
require("dotenv").config();

app.use(cors());

const socket = require("socket.io");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

server.listen(5000, () => {
    console.log(":: server listening on 5000 :::");
});

const io = new socket.Server(server, {
    path: "/api/socket.io",
    cors: {
        origin: "http://localhost:8000", // Allow frontend domain
        credentials: true,
    },
});

const chatHistory = [];

// Initial AI greeting and questions
chatHistory.push({
    role: "system",
    content: `Welcome to the AI Technical Interview! To begin, please introduce yourself and share a bit about your technical background and experiences.

    Upon receiving the user's response, extract key technologies mentioned and proceed with tailored questions:

    1️⃣ Introduction & Technology Proficiency Check: Based on your background, it seems you're familiar with [Technology X]. Could you tell me more about your experience with it?
    
    2️⃣ Problem-Solving Approach: How do you approach solving complex problems?
    
    3️⃣ Algorithmic Thinking: Can you explain the concept of [Algorithm Y] with an example?
    
    4️⃣ Software Development: What methodologies or frameworks do you prefer in projects?
    
    5️⃣ Database Management: Have you worked with [Database Z] before?
    
    6️⃣ Version Control: How do you ensure version control in your projects?
    
    7️⃣ Debugging: Share an instance where you encountered a technical issue and resolved it.
    
    8️⃣ Security Awareness: What measures do you take to ensure software security?
    
    9️⃣ Project Management: Can you discuss a project from inception to completion?
    
    🔟 Reflection: How do you think you performed in this interview?
    
    At the end, I will provide constructive feedback based on your answers.`,
});

io.on("connection", (socket) => {
    console.log("===>> New client connected:", socket.id);

    // Send initial chat history to the user
    socket.emit("initialChat", chatHistory.map(msg => msg.content));
    console.log("===>> Sending initial chat history:", chatHistory.map(msg => msg.content));

    // Handling user messages
    socket.on("sendMessage", async (data) => {
        console.log("===>> Message from client:", data.message);

        chatHistory.push({ role: "user", content: data.message });

        try {
            const chatCompletion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: chatHistory,
            });

            const aiResponse = chatCompletion.data.choices[0].message.content;
            console.log("===>> AI Response:", aiResponse);

            socket.emit("receiveMessage", { message: aiResponse });
            chatHistory.push({ role: "assistant", content: aiResponse });
        } catch (error) {
            console.error("===>> Error generating response:", error);
            socket.emit("receiveMessage", { message: "Sorry, an error occurred." });
        }
    });

    socket.on("disconnect", () => {
        console.log("===>> Client disconnected:", socket.id);
    });
});
