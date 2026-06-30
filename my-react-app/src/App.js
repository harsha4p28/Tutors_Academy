import './App.css';
import React, { useEffect, useState } from 'react';
import Home from './Home/Home';
import Navbar from './Navbar/Navbar';
import { Route, Routes } from 'react-router-dom';
import Tutor from './Tutor/Tutor';
import Parent from './Parent/Parent';
import Login from './Login/Login';
import RequireAuth from './Components/RequireAuth';
import useAuth from './hooks/useAuth';
import {ClipLoader} from 'react-spinners';
import axios from './api/axios';
import Profile from './Profile/Profile';
import Message from './Message/Message';
import FindTutors from './FindTutors/FindTutors';
import FindStudents from './FindStudents/FindStudents';
import Policy from './Policy/Policy';

export default function App() {
  const { auth,loading } = useAuth();

  if (loading) return (
  <div style={{textAlign: "center", marginTop: "100px"}}>
    <ClipLoader size={80} color={"#123abc"} loading={true} />
  </div>
);



  return (
    <div>
      <Navbar />
        <Routes>
          {!auth?.email ? <Route path="/" element={<Home />} /> : auth?.role === 'Tutor' ? <Route path="/" element={<Tutor />} /> : <Route path="/" element={<Parent />} />}
          <Route path="/login" element={<Login />} /> 
          <Route path="/policy" element={<Policy />} /> 
          <Route element={<RequireAuth  />}>
            <Route path="/tutor" element={<Tutor />} />
          </Route>
          <Route element={<RequireAuth  />}>
            <Route path="/parent" element={<Parent />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/message' element={<Message />} />
            <Route path='/findtutors' element={<FindTutors />} />
            <Route path='/findstudents' element={<FindStudents />} />
          </Route>

        </Routes>
    </div>
  )
}
