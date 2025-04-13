const fs=require('fs')
const path = require("path");
const dbPath = path.join(__dirname, "../data/teams.json");

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

const sortTeams=(teams)=>{
  teams.sort((a, b) => {
    if (!a.isOnline && !b.isOnline) return 0; // Keep relative order if both are offline
    if (!a.isOnline) return 1; // Offline teams go to the end
    if (!b.isOnline) return -1; // Offline teams go to the end

    if (a.time === 0 && b.time === 0) return 0; // Keep relative order if both haven't buzzed
    if (a.time === 0) return 1; // Teams that haven't buzzed go to the end
    if (b.time === 0) return -1; // Teams that haven't buzzed go to the end
    return a.time - b.time; // Sort by time ascending for those who buzzed
  });
  return teams;
}
module.exports.sortTeams = sortTeams;
module.exports.readTeamsFromFile = readTeamsFromFile;
module.exports.writeTeamsToFile = writeTeamsToFile;
