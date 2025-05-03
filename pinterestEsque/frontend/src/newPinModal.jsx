import React from 'react';
import {
  Typography,
  Container,
  Box,
  Modal,
  TextField
} from '@mui/material';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import './App.css'

const FormLabel = styled('label')({
    fontWeight: 'bold',
    fontSize: '1rem',
    color: 'black',
    textAlign: "left",
    marginBottom: '0.5rem',
    width: '100%',
  });

const NewPinModal = ({boards,open,onClose}) => {
    const userId = localStorage.getItem('userId');
    const [error,setError] = useState(null);
    const [selectedBoards,setSelectedBoards] = useState([]);
    const [tagString,setTagString] = useState('');
    const [imageUrl,setImageUrl] = useState('');

    const handleSubmit = (e) =>{
        e.preventDefault();

        fetch(`http://localhost:8000/api/CreatePin/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: imageUrl,tags: tagString, addToBoards:selectedBoards}),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to add pin');
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
              width: '70%', 
              maxHeight: '80%',
              overflowY: 'auto',
              padding: 3,
              borderRadius: 2,
              boxShadow: 24,
              position: 'relative',
            }}
          >
            <form onSubmit={handleSubmit}>
              <Container sx={{ marginBottom: 2 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 3 }}
                >
                  Create New Pin
                </Typography>
              </Container>
    
              {/* Image URL Field */}
              <div>
                <FormLabel sx={{ fontWeight: 'bold' }}>Image URL</FormLabel>
                <TextField
                  label="Image URL"
                  variant="outlined"
                  required
                  fullWidth
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />
                {error && (
                  <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
                    {error}
                  </Typography>
                )}
              </div>
    
              {/* Tags Field */}
              <div>
                <FormLabel sx={{ fontWeight: 'bold' }}>Tags</FormLabel>
                <TextField
                  label="#tags"
                  variant="outlined"
                  fullWidth
                  value={tagString}
                  onChange={(e) => setTagString(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />
                {error && (
                  <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
                    {error}
                  </Typography>
                )}
              </div>
    
              {/* Boards Section */}
              <div>
                <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                  Add to Boards:
                </Typography>
                <div style={{ marginBottom: 2 }}>
                  {boards.map((board, index) => (
                    <Box key={index} display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
                      <input
                        type="checkbox"
                        value={board.boardId}
                        checked={selectedBoards.includes(board.boardId)}
                        onChange={handleCheckboxChange}
                        style={{ marginRight: '10px' }}
                      />
                      <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        {board.boardName}
                      </Typography>
                    </Box>
                  ))}
                </div>
                {error === "Must Pin to at least one board" && (
                  <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
                    {error}
                  </Typography>
                )}
              </div>
    
              {/* Submit Button */}
              <Box display="flex" justifyContent="center" sx={{ marginTop: 3 }}>
                <button type="submit" style={{
                  padding: '10px 20px',
                  backgroundColor: '#3f51b5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}>
                  Submit
                </button>
              </Box>
            </form>
          </Box>
        </Modal>
      );
};

export default NewPinModal;