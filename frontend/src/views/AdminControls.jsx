import React, { useEffect, useState } from "react";
const Leaderboard = React.lazy(() => import("../components/Leaderboard"));
// import Leaderboard from '../components/Leaderboard'
export default function AdminControls() {
    const [data, setData]=useState([])
  return (
    <div>
      <h1>Admin</h1>
      <button>Start round</button>
      <button>Stop round</button>
      <button>Next round</button>
      <button>Reset round</button>
      <Leaderboard />
    </div>
  );
}
