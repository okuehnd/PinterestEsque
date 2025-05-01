import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  Box,
  CardActionArea,
  CardContent,
  CardMedia,
  CssBaseline,
  Switch,
  Fab
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, useEffect } from 'react';
import './App.css'
// import './style.css'
import { useNavigate, Link, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import axios from 'axios';
import PinCard from './PinCard';
import PinModal from './PinModal'
import FollowBoardModal from './FollowModal';


function Board() {
  const [error, setError] = useState('');
  const[pins,setPins] = useState([]);
  const [boardName,setBoardName] = useState([]);
  const { boardId } = useParams();
  const [boardOwnerUsername,setBoardOwnerUsername] = useState([]);
  const [boardOwnerId,setBoardOwnerId] = useState([]);
  console.log("BoardID: ",boardId);
  const userId = localStorage.getItem('userId')
  const navigate = useNavigate();
  const [selectedPin, setSelectedPin] = useState(null);
  const [isModalPinOpen, setIsModalPinOpen] = useState(false);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [editModeOn,setEditModeOn] = useState(false);
  const imageHeight = 280;
  const isBoardOwner = parseInt(userId) === boardOwnerId;
  const [friendsOnly, setFriendsOnly] = useState(true);
  const [isFollowing,setIsFollowing] = useState(null);
  const [myBoards,setMyBoards] = useState([]);
  console.log("OWNER: ",boardOwnerId)
  console.log("USER: ",userId)
  console.log("IS OWNER: ",isBoardOwner)

  useEffect(()=>{
    fetch('http://localhost:8000/api/Boards/'+userId+'/'+userId)
        .then((res) => res.json())
        .then((data)=>{
            var b = data.boardData
            var bou = data.boardOwnerUsername
            // pin = JSON.parse(pin)
            console.log(b)
            console.log(bou)
            setMyBoards(b)
        })
        .catch((error)=> console.error("Error fetching boards: ",error));
  },[])

  useEffect(()=>{
    fetch('http://localhost:8000/api/BoardPins/'+boardId +'/'+userId)
        .then((res) => res.json())
        .then((data)=>{
            var p = data.pinData
            // pin = JSON.parse(pin)
            console.log(data)
            setPins(p)
            setBoardName(data.boardName)
            setBoardOwnerUsername(data.boardOwnerUsername)
            console.log("BOARD OWNER ID SET: ",data.boardOwnerId)
            setBoardOwnerId(data.boardOwnerId)
            setIsFollowing(data.isFollowing)
        })
        .catch((error)=> console.error("Error fetching pins: ",error));
  },[])

  const handlePinClick = (pin) =>{
    console.log("PIN CLICK")
    setSelectedPin(pin);
    setIsModalPinOpen(true);
  };

  const handleFollowBoardClick = () =>{
    console.log("FOLLOW CLICK")
    setIsFollowModalOpen(true);
  };
  
  
  const handleClosePinModal = () =>{
    setIsModalPinOpen(false);
  };

  const handleCloseFollowModal = () =>{
    setIsFollowModalOpen(false);
  };

  const handleEditModeClick = () =>{
    setEditModeOn((prev) => !prev);
  };

  const handleBoardOwnerClick = (boardOwnerId) => {
    navigate(`/user/${boardOwnerId}`);
}

  const handleFriendsOnlyChange = () =>{
    fetch('http://localhost:8000/api/ToggleFriendsOnlySetting/'+userId +'/'+boardId)
        .then((res) => {
          if(!res.ok) {
            throw new Error('Failed to toggle setting')
          }
          return res.json()
        })
        .then((data) => {
          console.log("TOGGLE MESSAGE: ",data.message)
          setFriendsOnly(prev => !prev)
        })
        .catch((error)=> console.error("Error changing settings: ",error));
  };

// following
return (
  <div>
    {/* Header Section */}
    <Box 
      sx={{
        backgroundColor: '#3f51b5', // Blue background
        padding: '40px 0', // Increased padding for spacing
        marginBottom: '30px',
        textAlign: 'center',
        color: 'white',
        borderRadius: 2,
        position: 'relative',
      }}
    >
      <Container>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold', lineHeight: '1.2' }}
        >
          {boardName}
        </Typography>
        <Typography 
          variant="h6" 
          component="p" 
          onClick={() => handleBoardOwnerClick(boardOwnerId)} 
          sx={{ 
            fontSize: '18px',
            cursor: 'pointer', 
            '&:hover': { textDecoration: 'underline' } 
          }}
        >
          by {boardOwnerUsername}
        </Typography>
      </Container>

      {/* Toggles for board owner */}
      {isBoardOwner && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: '50%',
            right: 20, 
            transform: 'translateY(-50%)', // Vertically center the toggles
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1, fontSize: '14px' }}>Friends Only Comments</Typography>
            <Switch checked={friendsOnly} onChange={handleFriendsOnlyChange} />
            <Typography variant="body2" sx={{ ml: 1, fontSize: '14px' }}>
              {friendsOnly ? "On" : "Off"}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ mr: 1, fontSize: '14px' }}>Edit Mode</Typography>
            <Switch checked={editModeOn} onChange={handleEditModeClick} />
            <Typography variant="body2" sx={{ ml: 1, fontSize: '14px' }}>
              {editModeOn ? "On" : "Off"}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Non-owner settings: Follow button in the header */}
      {!isBoardOwner && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            right: 20, 
            transform: 'translateY(-50%)', // Vertically center the button
            display: 'flex', 
            alignItems: 'center' 
          }}
        >
          <Typography variant="body2" sx={{ mr: 1 }}>Follow Board</Typography>
          <Fab color="primary" aria-label="add" onClick={handleFollowBoardClick}>
            <AddIcon />
          </Fab>
        </Box>
      )}
    </Box>

    {/* Grid of Pins */}
    <Container>
      <Grid container spacing={4} justifyContent="center" sx={{ width: '100%' }}>
        {pins.map((pin, index) => (
          <PinCard
            myBoards={myBoards}
            setPins={setPins}
            boardId={parseInt(boardId)}
            editModeOn={editModeOn}
            key={pin.pinId}
            pin={pin}
            liked={pin.pinLiked}
            imageHeight={imageHeight}
            onClick={() => handlePinClick(pin)}
          />
        ))}
      </Grid>
    </Container>

    {/* Modals */}
    <PinModal pin={selectedPin} open={isModalPinOpen} onClose={handleClosePinModal} />
    <FollowBoardModal 
      boardId={boardId} 
      isFollowing={isFollowing} 
      setIsFollowing={setIsFollowing} 
      open={isFollowModalOpen} 
      onClose={handleCloseFollowModal} 
    />
  </div>
);
}

export default Board;