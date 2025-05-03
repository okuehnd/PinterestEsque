import React from 'react';
import {
  Typography,
  Container,
  Box,
  Button,
  Grid,
} from '@mui/material';
import { useState, useEffect } from 'react';
import './App.css'
// import './style.css'
import { useNavigate, useParams } from 'react-router-dom';
import PinCard from './PinCard';
import PinModal from './PinModal'

function Streams() {
    const[pins,setPins] = useState([]);
    const [myBoards,setMyBoards] = useState([]);
    const userId = localStorage.getItem('userId');
    const [selectedPin, setSelectedPin] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [followStreams,setFollowStreams] = useState([]);
    const { streamId } = useParams();
    const streamName = followStreams[streamId]?.streamName;
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
              setPins(pin)
          })
          .catch((error)=> console.error("Error fetching pins: ",error));
    },[streamId])
  
    useEffect(()=>{
      fetch('http://localhost:8000/api/Boards/'+userId+'/'+userId)
          .then((res) => res.json())
          .then((data)=>{
              var b = data.boardData
              var bou = data.boardOwnerUsername
              setMyBoards(b)
          })
          .catch((error)=> console.error("Error fetching boards: ",error));
    },[])
  
  
    const handlePinClick = (pin) =>{
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
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button 
              onClick={() => navigate(`/user/${localStorage.getItem('userId')}`)} 
              variant="contained" 
              color="primary" 
              sx={{
                padding: '10px 20px', 
                fontSize: '1rem', 
                marginBottom: '2px', 
                borderRadius: '30px', 
                boxShadow: 2,
                textTransform: 'none',  
              }}
            >
              My Boards
            </Button>
          </Box>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ fontWeight: 'bold', fontSize: '2.5rem' }}  
          >
            {streamName}
          </Typography>
          <Typography 
            variant="h6" 
            component="p" 
            sx={{ fontSize: '1.2rem' }}  
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
            variant="outlined" 
            color="primary" 
            sx={{
              padding: '10px 20px', 
              fontSize: '1rem', 
              marginBottom: '20px', 
              borderRadius: '30px', 
              boxShadow: 2,
              textTransform: 'none',  
            }}
          >
            Following
          </Button>
        </Grid>
        <Grid item>
          <Button 
            onClick={() => navigate('/search-results')} 
            variant="outlined" 
            color="primary" 
            sx={{
              padding: '10px 20px', 
              fontSize: '1rem', 
              marginBottom: '20px', 
              borderRadius: '30px',  
              boxShadow: 2,
              textTransform: 'none',  
            }}
          >
            Search
          </Button>
        </Grid>
  
        {/* Dynamically rendered stream buttons */}
        {followStreams.map((stream, index) => (
          <Grid item key={index}>
            <Button 
              onClick={() => navigate(`/stream/${stream.streamId}`)} 
              variant={(parseInt(stream.streamId) === parseInt(streamId))? "contained" : "outlined"}  
              color="primary" 
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
  