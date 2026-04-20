const express = require("express");
const app = express();
const PORT = 3000;

// GET / - Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to Homework API");
});

// GET /intro - Introduction about yourself
app.get("/intro", (req, res) => {
  res.send(
    "Hi, I'm a Year 2 student passionate about building APIs and web applications!",
  );
});

// GET /name - Your name
app.get("/name", (req, res) => {
  res.send("Hi, I'm Rayne!");
});

// GET /hobbies - Your hobbies (Bonus: returns JSON list)
app.get("/hobbies", (req, res) => {
  res.json(["travelling", "exploring", "eating"]);
});

// GET /food - Your favourite foods
app.get("/food", (req, res) => {
  res.send("My favourite foods are sushi, ramnen and steak!!!");
});

// Bonus: GET /student - Student JSON object
app.get("/student", (req, res) => {
  res.json({
    name: "Rayne",
    hobbies: ["Travelling", "eating", "exploring"],
    intro:
      "Hi, I'm a Year 2 student passionate about building APIs and studying in the diploma of IT!",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
