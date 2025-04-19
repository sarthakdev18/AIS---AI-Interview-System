const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
    responses: [
        {
            question: String,
            answer: String
        }
    ],
    timestamp: { type: Date, default: Date.now }
}, { collation: "interviews" });

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;
