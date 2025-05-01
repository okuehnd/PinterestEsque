import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
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
import { useNavigate, Link, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import PinCard from './PinCard';
import CommentCard from './CommentCard';
import PinModal from './PinModal'

function Streams() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const[pins,setPins] = useState([]);
    const [myBoards,setMyBoards] = useState([]);
    const userId = localStorage.getItem('userId');
    const [selectedPin, setSelectedPin] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [followStreams,setFollowStreams] = useState([]);
    const { streamId } = useParams();
    const streamName = followStreams[streamId]?.streamName;
    console.log("CURRENT STREAM ID: ",streamId)
    console.log("CURRENT STREAM NAME: ",streamName)
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
      fetch(`http://localhost:8000/api/GetStreamPins/${userId}/${streamId}`)
          .then((res) => res.json())
          .then((data)=>{
              var pin = data.pinData
              // pin = JSON.parse(pin)
              console.log("GET STREAM PINS:",pin)
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
          backgroundColor: '#3f51b5', // Blue background
          padding: '40px 0',  // Increased padding for a more spacious feel
          marginBottom: '40px',
          textAlign: 'center',
          color: 'white',
          borderRadius: 2, // Rounded corners for the box
          boxShadow: 3, // Slight shadow for depth
        }}
      >
        <Container>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ fontWeight: 'bold', fontSize: '2.5rem' }}  // Larger title font
          >
            {streamName}
          </Typography>
          <Typography 
            variant="h6" 
            component="p" 
            sx={{ fontSize: '1.2rem' }}  // Slightly larger subheading
          >
            Explore, discover, and follow your favorite boards!
          </Typography>
        </Container>
      </Box>
  
      {/* Button Section */}
      <Grid container spacing={2} justifyContent="center" sx={{ flexDirection: 'row' }}>
        <Grid item>
          <Button 
            onClick={() => navigate(`/following`)} 
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
            Following
          </Button>
        </Grid>
  
        <Grid item>
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
          <Grid item key={index}>
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
  
  export default Streams;
  