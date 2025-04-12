const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { isAdmin, protect } = require("../middleware/auth");
const dbPath = path.join(__dirname, "../data/teams.json");
// router.post('/register', isAdmin, async (req, res) => {
//     let teams=readTeamsFromFile()
//     try {
//         const {teamName}= req.body;
//         if(!teamName){
//             return res.status(400).json({ message: 'Team name is required' });
//         }
//         if(teams.includes(teamName)){
//             return res.status(400).json({ message: 'Team already exists' });
//         }
//         teams.push(teamName)
//         return res.status(201).json({ message: 'Team created successfully' });
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: 'Server error' });
//     }
// })

router.post("/login", async (req, res) => {
  const { teamName } = req.body;
  if (!teamName) {
    return res.status(400).json({ message: "Team name is required" });
  }
  try {
    const teams = readTeamsFromFile();
    if (!teams.includes(teamName)) {
      return res.status(404).json({ message: "Team not found" });
    }
    const token = jwt.sign({ teamName }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    return res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/isteam", protect, (req, res) => {
  res.status(200).json({ message: "Its a team!" });
});

const readTeamsFromFile = () => {
  if (!fs.existsSync(dbPath)) {
    return [];
  }
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data)["teams"];
};

const writeTeamsToFile = (teams) => {
  fs.writeFileSync(dbPath, JSON.stringify(teams, null, 2), "utf-8");
};

module.exports = router;
