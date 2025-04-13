import React, { useEffect, useState } from "react";
import { socket } from "../service/socket";
const Leaderboard = React.lazy(() => import("../components/Leaderboard"));

export default function AdminControls() {
  const [teams, setTeams] = useState([]);
  const [round, setRound] = useState(0);
  
  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    socket.on("leaderboard-update", (data) => {
      setTeams(data);
      console.log(data);
    });

    socket.on("round-update", (data) => {
      setRound(data);
    });
    
    return () => {
      socket.off("leaderboard-update");
      socket.disconnect();
    };
  }, []);

  const handleEmit = (event) => {
    socket.emit(event);
    console.log(`Emitted: ${event}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white flex flex-col items-center px-6 py-12 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-purple-400 tracking-wider drop-shadow-lg">
        🎮 Admin Controls
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <button
          onClick={() => handleEmit("start-round")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition"
        >
          ▶ Start Next Round
        </button>
        {/* <button
          onClick={() => handleEmit("stop-round")}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition"
        >
          ⏹ Stop Round
        </button> */}
        <button
          onClick={() => handleEmit("previous-round")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition"
        >
          ⏭ Previous Round
        </button>

        <button
          onClick={() => handleEmit("reset-round")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition"
        >
          🔄 Reset Round
        </button>
      </div>
      <div className="w-full flex justify-center">
        <h1 className="text-5xl font-bold text-purple-400 drop-shadow-lg tracking-widest mb-2">
          ⚡ Round {round}
        </h1>
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4 text-center text-white drop-shadow-sm">
          🏆 Live Leaderboard
        </h2>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-purple-300/20">
          <Leaderboard data={teams} />
        </div>
      </div>
    </div>
  );
}
