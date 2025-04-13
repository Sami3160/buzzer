import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../service/socket";
const Leaderboard = React.lazy(() => import("../components/Leaderboard"));

export default function NoLoginView() {
  const navigate = useNavigate();
  const teamElement = useRef(null);
  const [teams, setTeams] = useState([]);
  const [round, setRound] = useState(0);
  const [error, setError]=useState("")

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
        if (response.status === 200) navigate("/buzzer");
      } catch (error) {
        console.error(error.message);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    let teamName = teamElement.current.value.trim();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/team/login`,
        { teamName }
      );
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("teamName", teamName);
        navigate("/buzzer");
      }
    } catch (err) {
      console.error(err);
      setError(JSON.stringify(err))
      alert(err.response.data.message);
    }
  };

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    socket.on("leaderboard-update", (data) => {
      setTeams(data);
      console.log(data);
    });

    socket.on("round-update", (no) => {
      setRound(no);
    });

    return () => {
      socket.off("leaderboard-update");
            socket.emit("leave-room", localStorage.getItem("teamName"));
      
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex flex-col items-center justify-center px-4 py-10 text-white font-sans">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-purple-400 drop-shadow-md tracking-widest">
        ⚡ Buzzer Rush
      </h1>
      <p className="text-gray-300 mb-8 text-lg">Not a team yet? Join below!</p>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-purple-500/30">
        <input
          ref={teamElement}
          type="text"
          placeholder="Enter your Team Name"
          className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-purple-400 transition-all mb-4"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-md"
        >
          Join Game
        </button>
      </div>

      <div className="mt-12 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4 text-center text-white drop-shadow-sm">
          🏆 Live Leaderboard - Round {round}
        </h2>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-purple-300/20">
          <Leaderboard data={teams} round={round} />
        </div>
      </div>
      <p>{import.meta.env.VITE_BACKEND_URL}</p>
      <p>{error.length}</p>
      <p>{error}</p>

    </div>
  );
}
