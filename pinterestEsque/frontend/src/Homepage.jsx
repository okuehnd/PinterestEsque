import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CssBaseline,
  Modal
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, useEffect } from 'react';
import './App.css'
// import './style.css'
import { useNavigate, Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import PinCard from './PinCard';
import CommentCard from './CommentCard';
import PinModal from './PinModal'

function Following() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const[pins,setPins] = useState([]);
  const [myBoards,setMyBoards] = useState([]);
  const userId = localStorage.getItem('userId');
  const [selectedPin, setSelectedPin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [followStreams,setFollowStreams] = useState([]);
  const navigate = useNavigate();
  const imageHeight = 140;

  useEffect(()=>{
    fetch('http://localhost:8000/api/GetFollowStreams/'+userId)
        .then((res) => res.json())
        .then((data)=>{
            setFollowStreams(data.streamData)
        })
        .catch((error)=> console.error("Error fetching pins: ",error));
  },[])

  useEffect(()=>{
    fetch('http://localhost:8000/api/following/'+userId)
        .then((res) => res.json())
        .then((data)=>{
            var pin = data.pinData
            // pin = JSON.parse(pin)
            console.log(pin)
            setPins(pin)
        })
        .catch((error)=> console.error("Error fetching pins: ",error));
  },[])

  useEffect(()=>{
    fetch('http://localhost:8000/api/Boards/'+userId+'/'+userId)
        .then((res) => res.json())
        .then((data)=>{
            var b = data.boardData
            var bou = data.boardOwnerUsername
            // pin = JSON.parse(pin)
            console.log("BOOOOOOOOARDS:",b)
            console.log(bou)
            setMyBoards(b)
        })
        .catch((error)=> console.error("Error fetching boards: ",error));
  },[])


  const handlePinClick = (pin) =>{
    console.log("PIN CLICK")
    setSelectedPin(pin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () =>{
    setIsModalOpen(false);
  };

  
// following
  
return (
  <div>
    {/* Header Section */}
    <Box 
      sx={{
        backgroundColor: '#3f51b5',
        padding: '40px 0',
        marginBottom: '40px',
        textAlign: 'center',
        color: 'white',
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Container>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold', fontSize: '2.5rem' }}
        >
          Welcome to the Boards Page
        </Typography>
        <Typography 
          variant="h6" 
          component="p" 
          sx={{ fontSize: '1.2rem', mb: 3 }}
        >
          Explore, discover, and follow your favorite boards!
        </Typography>

        {/* Search Input */}
        <Box display="flex" justifyContent="center">
          <input
            type="text"
            placeholder="Search pins..."
            onChange={() => {}}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 16px',
              borderRadius: '30px',
              border: 'none',
              fontSize: '16px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              outline: 'none',
            }}
          />
        </Box>
      </Container>
    </Box>

    {/* Button Section */}
    <Grid container spacing={2} justifyContent="center" sx={{ flexDirection: 'row' }}>
      <Grid>
        <Button 
          onClick={() => navigate(`/user/${localStorage.getItem('userId')}`)} 
          variant="contained" 
          color="primary" 
          sx={{
            padding: '10px 20px', 
            fontSize: '1rem', 
            marginBottom: '20px', 
            borderRadius: '30px',  // Rounded corners for buttons
            boxShadow: 2,
            textTransform: 'none',  // Prevents uppercasing of button text
          }}
        >
          My Boards
        </Button>
      </Grid>
      
      {/* Dynamically rendered stream buttons */}
      {followStreams.map((stream, index) => (
        <Grid key={index}>
          <Button 
            onClick={() => navigate(`/stream/${stream.streamId}`)} 
            variant="outlined" 
            color="secondary" 
            sx={{
              padding: '10px 20px', 
              fontSize: '1rem', 
              borderRadius: '30px',
              marginBottom: '10px',
              boxShadow: 1,
              textTransform: 'none',
            }}
          >
            {stream.streamName}
          </Button>
        </Grid>
      ))}
    </Grid>
    
    {/* Pins grid section */}
    <Grid container spacing={4} justifyContent="center" style={{ width: '100%' }}>
      {pins.map((pin, index) => (
        <PinCard 
          myBoards={myBoards} 
          key={index} 
          pin={pin} 
          liked={pin.pinLiked} 
          onClick={() => handlePinClick(pin)} 
          imageHeight={imageHeight} 
        />
      ))}
    </Grid>

    {/* Pin Modal */}
    <PinModal pin={selectedPin} open={isModalOpen} onClose={handleCloseModal} />
  </div>
);
}

export default Following;



// fetch('http://localhost:8000/api/profile/', {
//     method: 'GET',
//     headers: {
//       'Authorization': `Bearer ${localStorage.getItem('access_token')}`
//     }
//   })
//   .then(response => response.json())
//   .then(data => console.log(data));