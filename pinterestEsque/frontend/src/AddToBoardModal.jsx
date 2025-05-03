import React from 'react';
import {
  Checkbox,
  Button,
  Typography,
  Box,
  Modal,
  FormLabel,
  FormControlLabel,
} from '@mui/material';
import { useState, useEffect } from 'react';
import './App.css'

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
                          onChange={(e) => handleCheckboxChange(e)}
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