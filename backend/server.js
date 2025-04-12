require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const cors = require("cors");
const teamRoutes = require("./routes/team.routes");
const { isAdmin } = require("./middleware/auth");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let ROUND_COUNT = 0;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
  })
);

app.use("/api/team", teamRoutes);

let teams = [];
app.post("/start-round", isAdmin, (req, res) => {
  ROUND_COUNT++;
  for (let index = 0; index <teams.length; index++) {
    const element =teams[index];
    teams[index].time = 0;
  }
  io.emit("leaderboard-update", teams);
  io.emit("round-started", { round: ROUND_COUNT });
  
  res.status(200).json({ message: `Round ${ROUND_COUNT} started` });
});
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.emit("leaderboard-update", teams);
  socket.on("join-room", (room, teamName) => {
    socket.join(room);
    const existingTeam = teams.find((t) => t.teamName === teamName);
    if (!existingTeam) {
      teams.push({ teamName: teamName, time: 0 });
      console.log(`Team "${teamName}" added.`);
      io.emit("leaderboard-update", teams);
    } else {
      console.log(`Team "${teamName}" reconnected or already exists.`);
    }
    console.log(`User ${socket.id} joined room: ${room}`);
  });
  socket.on("handle-buzzer", (room, teamName, time) => {
    let teamUpdated = false;
    for (let index = 0; index < teams.length; index++) {
      const element = teams[index];
      if (element.teamName == teamName) {
        if (element.time == 0) {
          element.time = time;
          teamUpdated = true;
          console.log(`Recorded time ${time} for team ${teamName}`);
        }else{
            console.log(`Team ${teamName} already buzzed this round.`);
        }
        break
      }
    }
    if(teamUpdated){
        // teams.sort((a, b) => a.time - b.time);
        teams.sort((a, b) => {
            if (a.time === 0 && b.time === 0) return 0; // Keep relative order if both haven't buzzed
            if (a.time === 0) return 1;  // Teams that haven't buzzed go to the end
            if (b.time === 0) return -1; // Teams that haven't buzzed go to the end
            return a.time - b.time; // Sort by time ascending for those who buzzed
          });
        io.emit("leaderboard-update", teams);
    }
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
  socket.on("leaderboard", () => {});
});

app.post('/ping',(req,res)=>res.status(200).json({message:'pong'}))
app.listen(process.env.PORT || 5000, console.log("buzzer server started!!"));
