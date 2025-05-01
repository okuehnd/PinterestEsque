import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CssBaseline,
  Modal,
  Fab
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import './App.css'
// import './style.css'
import { useNavigate, Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import PinCard from './PinCard';
import CommentCard from './CommentCard';
import NewStreamModal from './NewStreamModal';

const FormLabel = styled('label')({
    fontWeight: 'bold',
    fontSize: '1rem',
    color: 'black',
    textAlign: "left",
    marginBottom: '0.5rem',
    width: '100%',
  });

const FollowBoardModal = ({boardId,isFollowing,setIsFollowing,open,onClose}) => {
    const userId = localStorage.getItem('userId');
    const [followSelect,setFollowSelect] = useState(()=>isFollowing);
    const [selectedStreams,setSelectedStreams] = useState([]);
    const [followStreams, setFollowStreams] = useState([]);
    const [isCreateModalOpen,setIsCreateModalOpen] = useState(false);
    const [error,setError] = useState(null);

    useEffect(() => {
        if (open) {
            setFollowSelect(isFollowing);
        }
    }, [open, isFollowing]);

    useEffect(() => {
        fetch('http://localhost:8000/api/GetFollowStreams/'+userId)
        .then((res) => res.json())
        .then((data)=>{
            var fs = data.streamData
            console.log(fs)
            if (fs.length > 0){
                setFollowStreams(fs);
            }
            
        })
        .catch((error)=> console.error("Error fetching streams: ",error));
    },[]);

    const handleCheckboxChange =(e)=>{
        const value = parseInt(e.target.value,10);
        const {checked} = e.target;

        if (checked) {
            setSelectedStreams((prev) => [...prev,value]);
        }
        else {
            setSelectedStreams((prev) => prev.filter((option) => option !== value));
        }
    };

    const handleSubmit = (e) =>{
        e.preventDefault();

        fetch(`http://localhost:8000/api/AddBoardToFollowStream/${userId}/${boardId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ followSelect: followSelect,followStreams: followStreams }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to add to streams');
            }
            return response.json();
        })
        .then((data) => {
            console.log("FOLLOW SELECT CHECKBOX: ",followSelect);
            setIsFollowing(followSelect);
            onClose();

        })
        .catch((err) => {
            setError(err.message);
            console.error(err);
        });
    }

    const handleCreateStreamClick = () =>{
        setIsCreateModalOpen(true);
    };

    const handleCreateModalClose= () =>{
        setIsCreateModalOpen(false);
    };

    return (
        <div>
          <Modal
            open={open}
            onClose={onClose}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'white',
                width: '60%',  // Adjusted width for better fit
                maxWidth: '500px', // Max width to avoid oversizing
                height: 'auto',  // Height adjusted to auto for better content fit
                overflowY: 'auto',
                padding: 3,
                borderRadius: 2,
                boxShadow: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',  // Center content horizontally
              }}
            >
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {/* Center the Follow Board label */}
                <FormLabel sx={{ fontSize: '20px', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                  Follow Board
                </FormLabel>
      
                <Box mb={2} display="flex" justifyContent="center" alignItems="center">
                  <label style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={followSelect} 
                      onChange={(e) => setFollowSelect(e.target.checked)} 
                      style={{ marginRight: '10px' }}
                    />
                    Follow Board
                  </label>
                </Box>
      
                <Box mb={3} textAlign="center">
                  <Typography 
                    variant="h6" 
                    component="p" 
                    sx={{ fontSize: '18px', fontWeight: 'bold' }}
                  >
                    Add to Follow Streams:
                  </Typography>
                  {followStreams.map((stream, index) => (
                    <Box key={index} display="flex" alignItems="center" justifyContent="center" mb={1}>
                      <input  
                        type="checkbox"
                        value={stream.streamId}
                        checked={selectedStreams.includes(stream.streamId)}
                        onChange={handleCheckboxChange}
                        style={{ marginRight: '10px' }}
                      />
                      <Typography variant="body1">{stream.streamName}</Typography>
                    </Box>
                  ))}
                </Box>
      
                <Box mb={3} textAlign="center">
                  <Typography 
                    variant="h6" 
                    component="p" 
                    sx={{ fontSize: '18px', fontWeight: 'bold' }}
                  >
                    Create and Add to New Follow Stream:
                  </Typography>
                  {/* Add new button */}
                  <Fab 
                    color="primary" 
                    aria-label="add" 
                    onClick={handleCreateStreamClick}
                    sx={{ mt: 2 }}
                  >
                    <AddIcon />
                  </Fab>
                </Box>
      
                <Box display="flex" justifyContent="center" mt={3}>
                  <button 
                    type="submit" 
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#3f51b5', 
                      color: 'white', 
                      borderRadius: '4px', 
                      border: 'none' 
                    }}
                  >
                    Submit
                  </button>
                </Box>
              </form>
            </Box>
          </Modal>
      
          <NewStreamModal setFollowStreams={setFollowStreams} open={isCreateModalOpen} boardId={boardId} onClose={handleCreateModalClose} />
        </div>
      );
    };

export default FollowBoardModal;