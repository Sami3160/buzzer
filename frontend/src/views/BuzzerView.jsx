import React, { use, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../service/socket";
import Leaderboard from "../components/Leaderboard";

export default function BuzzerView() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [round, setRound]=useState(1);
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    const checkAuth = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/team/isteam`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        if (error.response?.status === 401) navigate("/");
        console.error(error.response.data.message);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
      socket.emit("join-room", localStorage.getItem("teamName"));
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
      socket.emit("leave-room", localStorage.getItem("teamName"));
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-black via-gray-900 to-purple-900 flex flex-col items-center justify-center text-white font-sans px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-purple-400 drop-shadow-lg tracking-widest mb-2">
          ⚡ Round {round}
        </h1>
        <p className="text-xl text-gray-300">
          Team <span className="text-purple-300 font-semibold">{localStorage.getItem("teamName")}</span>
        </p>
      </div>

      <button
        className="bg-purple-600 cursor-pointer hover:bg-purple-800 text-white text-3xl font-extrabold py-6 px-12 rounded-full shadow-lg transition-all duration-300 animate-pulse hover:scale-105"
        onClick={() => {
          socket.emit("buzzer", { teamName: localStorage.getItem("teamName"), time: new Date().getTime() });
        }}
      >
        🔔 BUZZER
      </button>

      <div className="mt-12 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4 text-center text-white drop-shadow-sm">
          🏆 Leaderboard
        </h2>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-purple-300/20">
          <Leaderboard data={teams} />
        </div>
        <button 
        className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition"
        onClick={()=>{
          socket.emit(
            "leave-room",
            localStorage.getItem("teamName")
          )
          localStorage.removeItem("teamName");
          localStorage.removeItem("token")
          navigate("/")
        }}
        > 
          Logout
        </button>
      </div>
    </div>
  );
}
