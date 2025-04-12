import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
const Leaderboard = React.lazy(() => import("../components/Leaderboard"));
export default function NoLoginView() {
  const [data, setData] = useState();
  const navigate = useNavigate();
  const teamElement = useRef(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token)
    // fetch("http://localhost:4000/api/team/isteam", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // })
    //   .then((res) => {
    //     console.log('one ', res)
    //     if(!res.ok)throw new Error('network error')
    //     return res.json()
    //   })
    //   .then((res) => {
    //     console.log('two ',res);
    //     if (res.role == 200) navigate("/buzzer");
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });

    const checkAuth = async () => {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/team/isteam",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status == 200) navigate("/buzzer");
      } catch (error) {
        console.error(error.message);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    let teamName = teamElement.current.value;
    teamName.trim();
    try {
      const response = await axios.post(
        "http://localhost:4000/api/team/login",
        { teamName: teamName }
      );
      console.log(response.data);
      if (response.status == 200) {
        localStorage.setItem("token", response.data.token);
        navigate("/buzzer");
      }
    } catch (error) {
      console.error(err);
      alert(error.message);
    }
  };
  return (
    <div>
      <p>Not a team?</p>
      <div className="">
        <input type="text" name="" id="" ref={teamElement} />
        <button onClick={handleLogin}>Login</button>
        <Leaderboard data />
      </div>
    </div>
  );
}
