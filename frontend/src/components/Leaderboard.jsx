import React from "react";

function formatTime(ms) {
  if (typeof ms !== "number") return "-";
  const seconds = Math.floor(ms / 1000);
  const milliseconds = Math.floor(ms % 1000).toString().padStart(3, "0");
  return `${seconds}.${milliseconds}s`;
}

export default function Leaderboard({ data = [], round }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse text-white">
        <thead>
          <tr className="bg-purple-800/80 text-white uppercase text-sm tracking-wide">
            <th className="px-4 py-3 text-left rounded-tl-xl">Rank</th>
            <th className="px-4 py-3 text-left">Team</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Time Taken</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-300">
                Waiting for scores to come in...
              </td>
            </tr>
          ) : (
            data.map((team, index) => (
              <tr
                key={team.teamName}
                className={`${
                  index % 2 === 0 ? "bg-white/5" : "bg-white/10"
                } hover:bg-purple-700/30 transition-all duration-200`}
              >
                <td className="px-4 py-3 font-bold text-purple-300">
                  #{index + 1}
                </td>
                <td className="px-4 py-3">{team.teamName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      team.isOnline ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{
                        backgroundColor: team.isOnline
                          ? "#4ade80"
                          : "#f87171",
                      }}
                    ></span>
                    {team.isOnline ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-4 py-3 text-purple-100">
                  {formatTime(team.time)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
