const Interview = require("../models/interviewModel");

// 📌 Save Interview Responses
exports.saveInterview = async (req, res) => {
    try {
        const { responses } = req.body;
        if (!responses || Object.keys(responses).length === 0) {
            return res.status(400).json({ error: "Responses cannot be empty!" });
        }

        const interview = new Interview({ responses });
        await interview.save();
        res.status(201).json({ message: "Interview saved successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📌 Get All Interviews
exports.getAllInterviews = async (req, res) => {
    try {
        const interviews = await Interview.find();
        res.status(200).json(interviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};