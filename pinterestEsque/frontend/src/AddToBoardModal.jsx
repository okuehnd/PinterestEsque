import React from 'react';
import {
  AppBar,
  Toolbar,
  Checkbox,
  Button,
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
  FormLabel,
  FormControlLabel,
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

const RepinModal = ({myBoards,pinId,open,onClose}) => {
       const userId = localStorage.getItem('userId');
       const [error,setError] = useState(null);
       const [selectedBoards,setSelectedBoards] = useState([]);
       const [boards,setBoards] = useState([]);

       useEffect(() => {
        if (myBoards) {
          setBoards(myBoards);
        }
      }, [myBoards]);
       

       const handleSubmit = (e) =>{
           e.preventDefault();
   
           fetch(`http://localhost:8000/api/Repin/${userId}/${pinId}`, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({ addToBoards:selectedBoards}),
           })
           .then((response) => {
               if (!response.ok) {
                   throw new Error('Failed to repin');
               }
               return response.json();
           })
           .then((data) => {
               setError(null);
               onClose();
           })
           .catch((err) => {
               setError(err.message);
               console.error(err);
           });
       }
   
       const handleCheckboxChange =(e)=>{
           const value = parseInt(e.target.value,10);
           const {checked} = e.target;
   
           if (checked) {
               setSelectedBoards((prev) => [...prev,value]);
           }
           else {
               setSelectedBoards((prev) => prev.filter((option) => option !== value));
           }
       };
   
       return (
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
              width: '60%',
              height: 'auto',
              overflowY: 'auto',
              padding: 3,
              borderRadius: 2,
              boxShadow: 24,
              maxHeight: '80%', // Prevents modal from becoming too tall
            }}
          >
            <form onSubmit={handleSubmit}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                Repin
              </Typography>
    
              <FormLabel sx={{ fontSize: '18px', marginBottom: 1 }}>Add to Boards:</FormLabel>
    
              <div style={{ marginBottom: '20px' }}>
                {boards.length > 0 &&
                  boards.map((board, index) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                          checked={selectedBoards.includes(board.boardId)}
                          onChange={() => handleCheckboxChange(board.boardId)}
                          value={board.boardId}
                          color="primary"
                        />
                      }
                      label={board.boardName}
                      sx={{ marginBottom: 1 }}
                    />
                  ))}
              </div>
    
              {error === "Must Pin to at least one board" && (
                <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
                  {error}
                </Typography>
              )}
    
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  backgroundColor: '#3f51b5',
                  '&:hover': { backgroundColor: '#303f9f' }, // Hover effect for button
                }}
              >
                Submit
              </Button>
            </form>
          </Box>
        </Modal>
      );
   };
   
export default RepinModal;