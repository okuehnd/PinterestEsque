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
  TextField
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

const FormLabel = styled('label')({
    fontWeight: 'bold',
    fontSize: '1rem',
    color: 'black',
    textAlign: "left",
    marginBottom: '0.5rem',
    width: '100%',
  });

const CreateBoardModal = ({setBoards,open,onClose}) => {
    const userId = localStorage.getItem('userId');
    const [error,setError] = useState(null);
    const [boardName,setBoardName] = useState('');
    const [boardDescrip,setBoardDescrip] = useState('');

    const handleSubmit = (e) =>{
        e.preventDefault();

        fetch(`http://localhost:8000/api/CreateBoard/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ boardName: boardName,boardDescription: boardDescrip}),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to add board');
            }
            return response.json();
        })
        .then((data) => {
            const boardId = data.boardId
            const newBoard = {
                'boardId' : boardId,
                'boardName': boardName,
                'boardDescription' : boardDescrip,
                'boardFriendsOnly' : true,
            }

            setBoards((prev) => [...prev,newBoard])

            setError(null)
            onClose();
        })
        .catch((err) => {
            setError(err.message);
            console.error(err);
        });
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
              width: '70%', // Adjusted width for better fit
              maxHeight: '80%',
              overflowY: 'auto',
              padding: 3,
              borderRadius: 2,
              boxShadow: 24,
            }}
          >
            <form onSubmit={handleSubmit}>
              <Container sx={{ marginBottom: 2 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 3 }}
                >
                  Create New Board
                </Typography>
              </Container>
    
              {/* Board Name Field */}
              <div>
                <FormLabel sx={{ fontWeight: 'bold' }}>Board Name</FormLabel>
                <TextField
                  label="Board Name"
                  variant="outlined"
                  required
                  fullWidth
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />
                {error && (
                  <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
                    {error}
                  </Typography>
                )}
              </div>
    
              {/* Description Field */}
              <div>
                <FormLabel sx={{ fontWeight: 'bold' }}>Description</FormLabel>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={boardDescrip}
                  onChange={(e) => setBoardDescrip(e.target.value)}
                  rows={3}
                  multiline
                  sx={{ marginBottom: 2 }}
                />
                {error && (
                  <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
                    {error}
                  </Typography>
                )}
              </div>
    
              {/* Submit Button */}
              <Box display="flex" justifyContent="center" sx={{ marginTop: 3 }}>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3f51b5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  Submit
                </button>
              </Box>
            </form>
          </Box>
        </Modal>
      );
};

export default CreateBoardModal;