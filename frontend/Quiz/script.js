document.addEventListener("DOMContentLoaded", function () {
    const quizData = [
        {
            question: "Q1. Which sorting algorithm has the worst-case time complexity of O(n²)?",
            options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Heap Sort"],
            answer: "Bubble Sort"
        },
        {
            question: "Q2. What is the time complexity of searching an element in a balanced binary search tree (BST)?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            answer: "O(log n)"
        },
        {
            question: "Q3. What data structure is best for implementing a LRU (Least Recently Used) cache?",
            options: ["Stack", "Queue", "Hashmap + Doubly Linked List", "Heap"],
            answer: "Hashmap + Doubly Linked List"
        },
        {
            question: "Q4. Which of the following Python data structures is immutable?",
            options: ["List", "Dictionary", "Tuple", "Set"],
            answer: "Tuple"
        },
        {
            question: "Q5. What is the difference between an INNER JOIN and a LEFT JOIN in SQL?",
            options: ["INNER JOIN includes only matching rows; LEFT JOIN includes all from the left table", "LEFT JOIN includes only matching rows; INNER JOIN includes all", "Both return the same results", "INNER JOIN is faster than LEFT JOIN"],
            answer: "INNER JOIN includes only matching rows; LEFT JOIN includes all from the left table"
        },
        {
            question: "Q4. Which of the following Python data structures is immutable?",
            options: ["List", "Dictionary", "Tuple", "Set"],
            answer: "Tuple"
        },
        {
            question: "Q4. Which of the following Python data structures is immutable?",
            options: ["List", "Dictionary", "Tuple", "Set"],
            answer: "Tuple"
        },
        {
            question: "Q4. Which of the following Python data structures is immutable?",
            options: ["List", "Dictionary", "Tuple", "Set"],
            answer: "Tuple"
        },
        {
            question: "Q4. Which of the following Python data structures is immutable?",
            options: ["List", "Dictionary", "Tuple", "Set"],
            answer: "Tuple"
        },
        {
            question: "Q4. Which of the following Python data structures is immutable?",
            options: ["List", "Dictionary", "Tuple", "Set"],
            answer: "Tuple"
        },
    ];

    let currentQuestionIndex = 0;
    let coins = 0;

    const questionElement = document.getElementById("question");
    const optionsContainer = document.getElementById("options");
    const nextButton = document.getElementById("next-btn");
    const coinsDisplay = document.getElementById("coins-earned");

    function updateCoins(amount) {
        coins += amount;
        coinsDisplay.innerHTML = `Coins: ${coins} <span class="coin-emoji">💰</span>`;

        const coinEffect = document.createElement("span");
        coinEffect.classList.add("coin-effect");
        coinEffect.textContent = amount > 0 ? `+${amount} 💰` : `${amount} 💸`;
        coinsDisplay.appendChild(coinEffect);

        setTimeout(() => {
            coinEffect.remove();
        }, 1000);
    }

    function loadQuestion() {
        const currentQuestion = quizData[currentQuestionIndex];
        questionElement.textContent = currentQuestion.question;
        optionsContainer.innerHTML = "";

        currentQuestion.options.forEach(option => {
            const button = document.createElement("button");
            button.classList.add("option");
            button.textContent = option;
            button.addEventListener("click", () => checkAnswer(option, currentQuestion.answer));
            optionsContainer.appendChild(button);
        });
    }

    function checkAnswer(selected, correct) {
        let isCorrect = selected === correct;

        if (isCorrect) {
            updateCoins(10);
        } else {
            updateCoins(-10);
        }

        document.querySelectorAll(".option").forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correct) {
                btn.style.background = "#28a745";
            } else if (btn.textContent === selected) {
                btn.style.background = "#dc3545";
            }
        });

        nextButton.style.display = "block";
    }

    nextButton.addEventListener("click", () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            loadQuestion();
            nextButton.style.display = "none";
        } else {
            endQuiz();
        }
    });

    let startTime;
    let endTime;
    let timeTaken;
    let timeLeft = 600; // 10 mins in seconds
    let timerInterval;

    // Timer display
    const timerDisplay = document.createElement("div");
    timerDisplay.id = "timer";
    timerDisplay.style.position = "absolute";
    timerDisplay.style.top = "10px";
    timerDisplay.style.right = "20px";
    timerDisplay.style.left = "20px";
    timerDisplay.style.fontSize = "30px";
    timerDisplay.style.fontWeight = "bold";
    document.body.appendChild(timerDisplay);

    //start timer
    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerDisplay.textContent = `⏳ Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

            if(timeLeft <= 0) {
                clearInterval(timerInterval);
                forceEndQuiz(); // Force quiz submission if time is up
            }
        }, 1000);
    }
    
    function startQuiz() {
        startTime = Date.now(); // Start timer when quiz begins
        loadQuestion();
        startTimer()
    }

    function endQuiz() {
        clearInterval(timerInterval);
        endTime = Date.now();
        timeTaken = Math.floor((endTime - startTime) / 1000); // Time in seconds

        questionElement.textContent = "🎉 Quiz Completed!";
        optionsContainer.innerHTML = `<p>You earned <strong>${coins} coins</strong>! 💰</p>`;

        let status = (currentQuestionIndex === quizData.length) ? "Completed" : "Not Completed";
        sendQuizResults(status); // send quiz data to backend

        if (coins <= 40) {
            optionsContainer.innerHTML += `<p style="color: red; font-size: 20px;">❌ You have failed the quiz</p>`;
        } else {
            optionsContainer.innerHTML += `<p style="color: green; font-size: 20px;">✅ Congratulations! You have passed the quiz!</p>`;
            triggerCelebration();
        }

        nextButton.style.display = "none";
        coinsDisplay.style.display = "none";

        // Create "View Leaderboard" button
        const leaderboardBtn = document.createElement("button");
        leaderboardBtn.textContent = "View Leaderboard";
        leaderboardBtn.classList.add("leaderboard-btn");
        leaderboardBtn.addEventListener("click", showLeaderboard);

        optionsContainer.appendChild(leaderboardBtn);
    }

    function forceEndQuiz() {
        endTime = Date.now();
        timeTaken = Math.floor((endTime - startTime) / 1000);

        questionElement.textContent = "⏳ Time's Up!";
        optionsContainer.innerHTML = `<p>You earned <strong>${coins} coins</strong>! 💰</p>`;

        optionsContainer.innerHTML += `<p style="color: orange; font-size: 20px;">⚠️ You did not complete the quiz before time ran out.</p>`;

        nextButton.style.display = "none";
        coinsDisplay.style.display = "none";
    
        const leaderboardBtn = document.createElement("button");
        leaderboardBtn.textContent = "View Leaderboard";
        leaderboardBtn.classList.add("leaderboard-btn");
        leaderboardBtn.addEventListener("click", showLeaderboard);

        optionsContainer.appendChild(leaderboardBtn);
    }

    function showLeaderboard() {
        document.body.classList.remove("celebration"); // Remove animation
        document.getElementById("leaderboard").style.display = "block"; // Show leaderboard
        generateLeaderboard();
    }

    // Function to generate leaderboard with 99 random candidates and the user
    function generateLeaderboard() {
        const leaderboard = document.getElementById("leaderboard");
        leaderboard.innerHTML = "<h2>🏆 Leaderboard</h2>";
        
        let participants = [];

        // Generate 99 random candidate scores close to the user
        for (let i = 0; i < 99; i++) {
            let randomScore = Math.floor(Math.random() * 11) * 10;
            let randomTime = Math.floor(Math.random() * 300) + 30 
            let completed = Math.random() > 0.2; // 80% completed the quiz
            participants.push({
            name: "Player " + (i + 1),
            score: randomScore,
            time: completed ? randomTime : "--", // show blank time if not completed
            completed: completed
        });
        }
        
        let userCompleted = timeLeft > 0;

        participants.push({ name: "You", score: coins, time: userCompleted ? timeTaken : "--", completed: userCompleted });
        
        participants.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score 
            return a.completed === b.completed ? a.time - b.time : b.completed - a.completed;
        });
        
        // Create leaderboard table
        let userRank;
    let tableHTML = `
        <table>
            <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Time (s)</th>
                <th>Status</th>
            </tr>
    `;

    participants.forEach((player, index) => {
        if (player.name === "You") userRank = index + 1;
        tableHTML += `
            <tr ${player.name === "You" ? 'style="font-weight: bold; color: #ff6f61;"' : ""}>
                <td>#${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.score}</td>
                <td>${player.time}</td>
                <td>${player.completed ? "✅ Completed" : "❌ Not Completed"}</td>
            </tr>
        `;
    });

    tableHTML += `</table>`;
    leaderboard.innerHTML += `<p style="font-size: 18px; font-weight: bold;">📊 Your Rank: #${userRank}</p>`;
    leaderboard.innerHTML += tableHTML;  
    }

    // 🎇 Celebration Effect
    function triggerCelebration() {
        launchFireworks();
        startConfetti();
        releaseBalloons();
    }

    // 🧨 Fireworks Effect
    function launchFireworks() {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";

        const ctx = canvas.getContext("2d");

        class Firework {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.particles = [];
                for (let i = 0; i < 30; i++) {
                    this.particles.push({
                        x: x,
                        y: y,
                        color: `hsl(${Math.random() * 360}, 100%, 60%)`,
                        velocity: { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 }
                    });
                }
            }
            update() {
                this.particles.forEach(p => {
                    p.x += p.velocity.x;
                    p.y += p.velocity.y;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                });
            }
        }

        let fireworks = [];
        for (let i = 0; i < 5; i++) {
            fireworks.push(new Firework(Math.random() * canvas.width, Math.random() * canvas.height / 2));
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            fireworks.forEach(firework => firework.update());
            requestAnimationFrame(animate);
        }

        animate();
    }

    // 🎊 Confetti Effect
    function startConfetti() {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";

        const ctx = canvas.getContext("2d");

        class Confetti {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * -canvas.height;
                this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
                this.size = Math.random() * 8 + 2;
                this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 3 + 2 };
            }
            update() {
                this.y += this.velocity.y;
                this.x += this.velocity.x;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        let confettiArray = [];
        for (let i = 0; i < 100; i++) confettiArray.push(new Confetti());

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confettiArray.forEach(c => c.update());
            requestAnimationFrame(animate);
        }

        animate();
    }

    // 🎈 Balloon Effect
    function releaseBalloons() {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";
    }

    function sendQuizResults(status) {
        const userData = {
            userId: localStorage.getItem("userId")?.trim(),
            quizId: "65e34f1a9a9c8a0012b3c4d6",
            score: coins,
            timeTaken: status === "Completed" ? timeTaken : null,
            status
        }
    
        console.log("Sending quiz data:", userData);
    
        fetch("http://localhost:8800/quiz-results/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(data => console.log("Quiz result saved:", data))
        .catch(error => console.error("Error:", error));
    }    

    startQuiz();
});   