import React from 'react';
import {
  Typography,
  Container,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Fab
} from '@mui/material';
import { useState, useEffect } from 'react';
import './App.css'
// import './style.css'
import { useNavigate, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton } from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ManageProfileModal from './ManageProfile';
import NewPinModal from './newPinModal';
import CreateBoardModal from './CreateBoardModal';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import PushPinIcon from '@mui/icons-material/PushPin';

function MyBoards() {
  const[boards,setBoards] = useState([]);
  const { boardOwnerId } = useParams();
  const [boardOwnerUsername, setBoardOwnerUsername] = useState([]);
  const [isSettingsModalOpen,setIsSettingsModalOpen] = useState(false);
  const [isCreatePinModalOpen,setIsCreatePinModalOpen] = useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);

  const userId = localStorage.getItem('userId');
  const isProfileOwner = parseInt(userId) === parseInt(boardOwnerId);
  
  const [areFriends,setAreFriends] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    fetch('http://localhost:8000/api/Boards/'+userId+'/'+boardOwnerId)
        .then((res) => res.json())
        .then((data)=>{
            var b = data.boardData
            var bou = data.boardOwnerUsername
            setBoards(b)
            setBoardOwnerUsername(bou);
            setAreFriends(data.areFriends);
        })
        .catch((error)=> console.error("Error fetching boards: ",error));
  },[])

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  }

  const handleSettingsClick = () =>{
    setIsSettingsModalOpen(true);
  };

  const handleSettingsModalClose = () =>{
    setIsSettingsModalOpen(false);
  };

  const handleAddFriendClick = () =>{
    const confirmed = window.confirm(`Send ${boardOwnerUsername} a friend request?`);
    if (confirmed) {
        fetch('http://localhost:8000/api/FriendRequest/'+userId+'/'+boardOwnerId)
        .then((res) => {
            if (!res.ok){
                throw new Error(`Failed to send friend request to ${boardOwnerUsername}`);
            }
            return res.json();
        })
        .then((data)=>{
          console.log(data.message)
        })
        .catch((error)=> console.error("Error sending friend request: ",error));
    }
  };

  const handleRemoveFriendClick = () =>{
    const confirmed = window.confirm(`Are you sure you want to unfriend ${boardOwnerUsername}?`);
    if (confirmed) {
        fetch('http://localhost:8000/api/Unfriend/'+userId+ '/'+boardOwnerId)
        .then((res) => {
            if (!res.ok){
                throw new Error(`Failed to unfriend ${boardOwnerUsername}`);
            }
            return res.json();
        })
        .then((data)=>{

        })
        .catch((error)=> console.error("Error unfriending: ",error));
    }
  };  

  const handleCloseCreatePinModal = () =>{
    setIsCreatePinModalOpen(false);
  };
  const handleCreatePinClick = () =>{
    setIsCreatePinModalOpen(true);
  };

  const handleCloseCreateBoardModal =() =>{
    setIsCreateBoardModalOpen(false);
  };

  const handleCreateBoardClick = () =>{
    setIsCreateBoardModalOpen(true);
  };


  
// following
return (
  <div>
    {/* Header Section */}
    <Box sx={{
      backgroundColor: '#3f51b5', 
      padding: '20px 0', 
      marginBottom: '30px', 
      textAlign: 'center', 
      color: 'white', 
      borderRadius: 2
    }}>
      <Container>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button 
            onClick={() => navigate(`/following`)} 
            variant="outlined" 
            color="primary" 
            sx={{
              padding: '10px 20px', 
              fontSize: '1rem', 
              marginBottom: '20px', 
              borderRadius: '30px',  // Rounded corners for buttons
              boxShadow: 2,
              textTransform: 'none',
              color: 'white',  // Prevents uppercasing of button text
            }}
          >
            Following
          </Button>
        </Box>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {boardOwnerUsername}'s Boards
        </Typography>

        {/* Profile-specific actions */}
        {isProfileOwner && (
          <div>
            <Grid  container spacing={2} justifyContent="center" sx={{ flexDirection: 'row' }}>
              <Grid>
                <IconButton onClick={handleSettingsClick} sx={{ color: 'gray' }}>
                  <SettingsIcon />
                </IconButton>
              </Grid>
              <Grid>
                <IconButton onClick={handleCreatePinClick}>
                  <PushPinIcon sx={{ color: 'white' }} />
                </IconButton>
              </Grid>
              <Grid>
                <IconButton onClick={handleCreateBoardClick}>
                  <DashboardCustomizeIcon sx={{ color: 'white' }} />
                </IconButton>
              </Grid>
            </Grid>
            {/* Settings Button */}
          </div>
        )}

        {/* Add or Remove Friend section */}
        {!isProfileOwner && !areFriends && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', mt: 2 }}>
            <Typography variant="h6" component="p" sx={{ fontSize: '18px' }}>Add Friend</Typography>
            <Fab color="primary" aria-label="add" onClick={handleAddFriendClick}>
              <AddIcon />
            </Fab>
          </Box>
        )}

        {!isProfileOwner && areFriends && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', mt: 2 }}>
            <Typography variant="h6" component="p" sx={{ fontSize: '18px' }}>Remove Friend</Typography>
            <Fab color="primary" aria-label="remove" onClick={handleRemoveFriendClick}>
              <RemoveCircleIcon />
            </Fab>
          </Box>
        )}

      </Container>
    </Box>

    {/* Display Boards */}
    <Container>
      <Grid container spacing={4} justifyContent="center" sx={{ width: '100%' }}>
        {boards.map((board, index) => (
          <Grid item key={index}>
            <Card sx={{ width: 200, borderRadius: 2, boxShadow: 3, '&:hover': { boxShadow: 6 } }}>
              <CardMedia component="img" height="140" image={board.pinnedImage} alt="Image" sx={{ borderRadius: 1 }} />
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  onClick={() => handleBoardClick(board.boardId)} 
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {board.boardName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>

    {/* Modals */}
    <ManageProfileModal open={isSettingsModalOpen} onClose={handleSettingsModalClose} />
    <NewPinModal boards={boards} open={isCreatePinModalOpen} onClose={handleCloseCreatePinModal} />
    <CreateBoardModal setBoards={setBoards} open={isCreateBoardModalOpen} onClose={handleCloseCreateBoardModal} />
  </div>
);
}

export default MyBoards;
