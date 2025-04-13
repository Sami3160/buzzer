import { useEffect, useState } from "react";
import "./App.css";
import React from 'react'
import { Route, Routes, useNavigate } from "react-router-dom";
const BuzzerView=React.lazy(()=>import('./views/BuzzerView'))
const AdminControls=React.lazy(()=>import('./views/AdminControls'))
const NoLoginView=React.lazy(()=>import('./views/NoLoginView'))
function App() {
  return (
    <Routes>
      <Route path="/" element={<NoLoginView/>}/>
      {/* <Route path="/login" element/> */}
      <Route path="/adminhiddenroute" element={<AdminControls/>} />
      <Route path="/buzzer" element={<BuzzerView/>}/>
      <Route path="/*" element={<div>404 not found</div>}/>
    </Routes>
  );
}

export default App;
