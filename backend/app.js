const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path")
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const User = require("./api/models/user");
require("dotenv").config();
const Info = require("./api/models/info")
const database = require("./config/database");
const interviewRoutes = require("./api/routers/interviewRoutes");
const uploadVideo = require("./api/routers/uploadVideo");
// const interviewAnalysisRouter = require("./api/routers/interviewAnalysisRouter");

const logResponseBody = require("./utils/logResponse");

var app = require("express")();
var http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*", // Allow any frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Enable CORS for all frontend origins
app.use(cors({ origin: "*" }));

app.set("trust proxy", 1);
var limiter = new rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message:
    "Too many requests created from this IP, please try again after an hour",
});
app.use(limiter);

// const passport_config = require("./api/config/studentGoogleAuth");

mongoose.Promise = global.Promise;

//Use helmet to prevent common security vulnerabilities
app.use(helmet());

//Use body-parser to parse json body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());

app.use("/api/interview", interviewRoutes);

app.get("/", (req, res) => {
  res.send("AI Interview API is running...")
})

// Allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, auth-token"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use(cors());

// ADD ROUTERS

app.use("/user", require("./api/routers/user"));
app.use("/quiz", require("./api/routers/quiz"));
const quizResultRoutes = require("./api/routers/quizResult");
app.use("/quiz-results", quizResultRoutes); // This must match your frontend API call

const uploadRoutes = require("./api/routers/uploadResume");
app.use("/api", uploadRoutes);

const resumeRoutes = require('./api/routers/resumeRoutes');
app.use('/api', resumeRoutes);

app.use("/api", uploadVideo);

// app.use("/api/analyze-interview", interviewAnalysisRouter);

app.post('/quiz-results/submit', async (req, res) => {
    try {
        console.log("Raw Request Body:", req.body);

        const { userId, quizId, score, timeTaken, status } = req.body;

        // Log each individual field
        console.log("Extracted Data ->", { userId, quizId, score, timeTaken, status });

        if (!userId || !quizId || !score || !timeTaken || !status) {
            console.error("❌ Missing fields:", { userId, quizId, score, timeTaken, status });
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const result = await QuizResult.create({ userId, quizId, score, timeTaken, status });
        res.json({ success: true, result });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

app.get("/checkServer", (req, res) => {
  return res.status(200).json({
    message: "Server is up and running",
  });
});

//This function will give a 404 response if an undefined API endpoint is fired
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

//

//sockets

//to keep connection alive
function sendHeartbeat() {
  setTimeout(sendHeartbeat, 8000);
  io.sockets.emit("ping", { beat: 1 });
}

io.on("connection", async (sc) => {
  console.log(`Socket ${sc.id} connected.`);
  sc.on("data", async (data) => {
    const info = new Info({
      _id:  new mongoose.Types.ObjectId,
      info:data
    })
    info.save()
      .then(()=>{
        console.log(info)
      })
  });
  // sc.on("user",async (id)=>{
  //   const {name} = await User.findById(id)
  //   sc.emit("start",name)
  //   console.log(id)
  // })

  sc.on("pong", function (data) {
    console.log("Pong received from client");
  });
  sc.on("disconnect", () => {
    console.log(`Socket ${sc.id} disconnected.`);
  });
 
  setTimeout(sendHeartbeat, 8000);
});

const PORT = process.env.PORT || 8800;

//Start the server
http.listen(PORT, function () {
  console.log(`listening on PORT: ${PORT}`);
});

// module.exports = app;