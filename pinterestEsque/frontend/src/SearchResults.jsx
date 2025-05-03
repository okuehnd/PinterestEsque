import React from 'react';
import {
  Typography,
  Container,
  Button,
  Box,
  Grid,
  FormControl,
  MenuItem,
  Select
} from '@mui/material';
import { useState, useEffect } from 'react';
import './App.css'
import { useNavigate, Link, useLocation } from 'react-router-dom';
import PinCard from './PinCard';
import PinModal from './PinModal'

function SearchResults() {
  const [error, setError] = useState('');
  const[pins,setPins] = useState([]);
  const [myBoards,setMyBoards] = useState([]);
  const userId = localStorage.getItem('userId');
  const [selectedPin, setSelectedPin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [followStreams,setFollowStreams] = useState([]);
  const [keyword,setKeyword] = useState('');
  const [sortMethod,setSortMethod] = useState('time');
  const location = useLocation();


  useEffect(() => {
    const initialKeyword = location.state?.keyword || '';
    if (initialKeyword) {
      setKeyword(initialKeyword);
    }
  }, []);
  
  const navigate = useNavigate();
  const imageHeight = 140;

  useEffect(()=>{
    fetch('http://localhost:8000/api/GetFollowStreams/'+userId)
        .then((res) => res.json())
        .then((data)=>{
            setFollowStreams(data.streamData)
        })
        .catch((error)=> console.error("Error fetching follow streams: ",error));
  },[])

  useEffect(()=>{
    fetch(`http://localhost:8000/api/SearchPins/${userId}`,{
        method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keyword: keyword,sortMethod: sortMethod }),
    })
        .then((res) => res.json())
        .then((data)=>{
            var pin = data.pinData
            setPins(pin)
        })
        .catch((error)=> console.error("Error fetching boards: ",error));
  },[keyword,sortMethod])

  useEffect(()=>{
    fetch('http://localhost:8000/api/Boards/'+userId+'/'+userId)
        .then((res) => res.json())
        .then((data)=>{
            var b = data.boardData
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

  const handleSearch = (keyword) =>{
    localStorage.setItem('keyword',keyword);
    navigate('/search-results');
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
              borderRadius: '30px',  // Rounded corners for buttons
              boxShadow: 2,
              textTransform: 'none',  // Prevents uppercasing of button text
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const searchValue = keyword;
            handleSearch(searchValue)
          }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
            <input
              name="search"
              type="text"
              placeholder="Search pins..."
              value={keyword}
              onChange={(e) => {setKeyword(e.target.value)}}
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
        </form>
        </Box>
        <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl
            variant="outlined"
            size="small"
            sx={{
              minWidth: 160,
              borderRadius: '30px',
              backgroundColor: 'white',
              boxShadow: 2,
              '.MuiOutlinedInput-root': {
                borderRadius: '30px',
                paddingLeft: 1,
              },
              '.MuiSelect-select': {
                padding: '10px 20px',
              },
            }}
          >
            <Select
              labelId="sort-label"
              value={sortMethod}
              label="Sort By"
              onChange={(e) => setSortMethod(e.target.value)}
            >
              <MenuItem value="time">Most Recent</MenuItem>
              <MenuItem value="likes">Likes</MenuItem>
            </Select>
          </FormControl>

        </Box>
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
          onClick={() => navigate('/search-results')} 
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
          Search
        </Button>
      </Grid>
      {/* Dynamically rendered stream buttons */}
      {followStreams.map((stream, index) => (
        <Grid key={index}>
          <Button 
            onClick={() => navigate(`/stream/${stream.streamId}`)} 
            variant="outlined" 
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

export default SearchResults;

