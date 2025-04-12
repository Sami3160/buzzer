import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

export default function BuzzerView() {
    const navigate = useNavigate();
    
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:4000/api/team/isteam", {
        method:"POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);

        if (res.status != 200) navigate("/buzzer");
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div>
      
    </div>
  )
}
