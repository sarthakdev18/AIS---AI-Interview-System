const codingQuestions = {
    javascript: [
        {
            question: "Write a function to reverse a string.",
            functionName: "reverseString",
            testCases: [
                { input: "hello", expected: "olleh" },
                { input: "world", expected: "dlrow" }
            ]
        },
        {
            question: "Write a function to find the maximum number in an array.",
            functionName: "findMax",
            testCases: [
                { input: [1, 2, 3, 4, 5], expected: 5 },
                { input: [-10, -5, 0, 5, 10], expected: 10 }
            ]
        }
    ],
    python: [
        {
            question: "Write a function to reverse a string.",
            functionName: "reverse_string",
            testCases: [
                { input: "hello", expected: "olleh" },
                { input: "world", expected: "dlrow" }
            ]
        },
        {
            question: "Write a function to find the maximum number in an array.",
            functionName: "find_max",
            testCases: [
                { input: [1, 2, 3, 4, 5], expected: 5 },
                { input: [-10, -5, 0, 5, 10], expected: 10 }
            ]
        }
    ]
};

let selectedLanguage = "javascript";
let currentQuestionIndex = 0;

function loadQuestion() {
    const questionData = codingQuestions[selectedLanguage][currentQuestionIndex];
    document.getElementById("questionBox").innerText = `Question: ${questionData.question}`;
    editor.setValue(`function ${questionData.functionName}(input) {\n    // Your code here\n}`);
}

document.getElementById("languageSelector").addEventListener("change", function () {
    selectedLanguage = this.value;
    loadQuestion();
});

function runTestCases() {
    const userCode = editor.getValue();
    const questionData = codingQuestions[selectedLanguage][currentQuestionIndex];
    let outputBox = document.getElementById("outputBox");
    outputBox.innerHTML = ""; // Clear previous output
    
    try {
        const userFunction = new Function("input", userCode + ` return ${questionData.functionName}(input);`);
        let correctCases = 0;
        let totalCases = questionData.testCases.length;

        questionData.testCases.forEach(test => {
            try {
                const result = userFunction(test.input);
                let isCorrect = JSON.stringify(result) === JSON.stringify(test.expected);
                if (isCorrect) correctCases++;
                outputBox.innerHTML += `<p>Input: ${JSON.stringify(test.input)} | Expected: ${JSON.stringify(test.expected)} | Output: ${JSON.stringify(result)} | ${isCorrect ? "✅" : "❌"}</p>`;
            } catch (e) {
                outputBox.innerHTML += `<p>Error executing test case: ${e.message}</p>`;
            }
        });
        
        const score = (correctCases / totalCases) * 100;
        outputBox.innerHTML += `<p><strong>Score: ${score}%</strong></p>`;
    } catch (error) {
        outputBox.innerHTML = `<p><strong>Error:</strong> ${error.message}</p>`;
    }
}

document.querySelector("button").addEventListener("click", runTestCases);
loadQuestion();