require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const cors = require("cors");
const teamRoutes = require("./routes/team.routes");
const { isAdmin } = require("./middleware/auth");
const { readTeamsFromFile, sortTeams } = require("./utils/json_operations");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
let ROUND_COUNT = 0;
let FREEZE_RESPONSE = false;
let START_TIME = new Date().getTime();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use("/api/team", teamRoutes);

let teamNames = readTeamsFromFile();
let teams = [];
for (let index = 0; index < teamNames.length; index++) {
  const element = teamNames[index];
  teams.push({ teamName: element, time: 0, isOnline: false });
}
app.post("/start-round", isAdmin, (req, res) => {
  ROUND_COUNT++;
  for (let index = 0; index < teams.length; index++) {
    const element = teams[index];
    teams[index].time = 0;
  }
  io.emit("leaderboard-update", teams);
  io.emit("round-update", ROUND_COUNT);
  io.emit("round-started", { round: ROUND_COUNT });

  res.status(200).json({ message: `Round ${ROUND_COUNT} started` });
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.emit("leaderboard-update", teams);
  socket.emit("round-update", ROUND_COUNT);

  socket.on("start-round", () => {
    if(ROUND_COUNT==5)return
    ROUND_COUNT++;
    START_TIME = new Date().getTime();
    console.log("START TIME ",START_TIME);
    FREEZE_RESPONSE = false;
    for (let index = 0; index < teams.length; index++) {
      const element = teams[index];
      teams[index].time = 0;
    }
    
    io.emit("leaderboard-update", teams);
    io.emit("round-update", ROUND_COUNT);
    console.log(`Round ${ROUND_COUNT} started`);
  });

  socket.on("join-room", (teamName) => {
    socket.join("room1");
    let found = false;
    // const existingTeam = teams.find((t) => t.teamName === teamName);
    for (let index = 0; index < teams.length; index++) {
      if (teams[index].teamName == teamName) {
        teams[index].isOnline = true;
        found = true;
        break;
      }
    }
    if (found) {
      // teams.push({ teamName: teamName, time: 0, isOnline: true });
      console.log(`Team "${teamName}" added.`);
      teams = sortTeams(teams);
      io.emit("leaderboard-update", teams);
    } else {
      console.log(`Team "${teamName}" reconnected or already exists.`);
    }
    console.log(`User ${socket.id} joined room: room1`);
  });
  socket.on("buzzer", (data) => {
    if (START_TIME == 0 || FREEZE_RESPONSE || ROUND_COUNT==0 ||ROUND_COUNT==6) {
      return;
    }
    let teamUpdated = false;
    let { teamName, time } = data;

    console.log(teamName, time);
    for (let index = 0; index < teams.length; index++) {
      const element = teams[index];
      if (element.teamName == teamName) {
        if (element.time == 0) {
          time=new Date().getTime();
          teams[index].time = time-START_TIME;
          teamUpdated = true;
          console.log(`Recorded time ${time} for team ${teamName}`);
        } else {
          console.log(`Team ${teamName} already buzzed this round.`);
        }
        break;
      }
    }
    if (teamUpdated) {
      // teams.sort((a, b) => a.time - b.time);
      teams = sortTeams(teams);
      io.emit("leaderboard-update", teams);
    }
  });

  // socket.on("leave-room", (teamName) => {
    
  // });
  socket.on("reset-round", () => {
    FREEZE_RESPONSE = false;
    START_TIME = new Date().getTime();
    for (let index = 0; index < teams.length; index++) {
      const element = teams[index];
      teams[index].time = 0;
    }
    teams=sortTeams(teams);
    io.emit("leaderboard-update", teams);
    io.emit("round-update", ROUND_COUNT);
    console.log(`Round ${ROUND_COUNT} stopped`);
  });
  socket.on('previous-round',()=>{
    if(ROUND_COUNT==0)return;
    FREEZE_RESPONSE = false;
    ROUND_COUNT--;
    START_TIME = new Date().getTime();
    for (let index = 0; index < teams.length; index++) {
      const element = teams[index];
      teams[index].time = 0;
    }
    teams=sortTeams(teams);
    io.emit("leaderboard-update", teams);
    io.emit("round-update", ROUND_COUNT);
    console.log(`Round ${ROUND_COUNT} stopped`);
  })

  socket.on("leave-room", (teamName) => {
    console.log(teamName, " left the room");

    for (let index = 0; index < teams.length; index++) {
      const element = teams[index];
      if (teamName == element.teamName) {
        teams[index].isOnline = false;
        break;
      }
    }
    teams = sortTeams(teams);
    io.emit("leaderboard-update", teams);
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
  socket.on("leaderboard", () => {
    io.emit("leaderboard-update", teams);
  });
});

app.post("/ping", (req, res) => res.status(200).json({ message: "pong" }));
server.listen(process.env.PORT || 5000,'0.0.0.0', console.log("buzzer server started!!"));
