import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login'; 
import Register from './Register'
import Following from './Homepage'
import MyBoards from './Profile'
import Board from './Board'
import Streams from './StreamPins';
import SearchResults from './SearchResults';
// import ChannelPage from './ChannelPage'; 
// import CreateChannel from './CreateChannel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/register" element={<Register />}/>
        <Route path="/following" element={<Following/>}/>
        <Route path="/user/:boardOwnerId" element ={<MyBoards/>}/>
        <Route path ="/board/:boardId" element={<Board/>}/>
        <Route path ="/stream/:streamId" element={<Streams/>}/>
        <Route path ="/search-results" element={<SearchResults/>}/>
        {/*<Route path="/channel/:id" element={<ChannelPage />} />
        <Route path="/newChannel/" element={<CreateChannel/>}/> */}
      </Routes>
    </Router>
  );
}

export default App;