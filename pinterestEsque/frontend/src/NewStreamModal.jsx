import React from 'react';
import {
  Typography,
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

const NewStreamModal = ({setFollowStreams,boardId,open,onClose}) => {
    const userId = localStorage.getItem('userId');
    const [newStreamName,setNewStreamName] = useState('');
    const [error,setError] = useState(null);

    const handleSubmit = (e) =>{
        e.preventDefault();

        fetch(`http://localhost:8000/api/CreateFollowStream/${userId}/${boardId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ streamName : newStreamName }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to add to create stream');
            }
            return response.json();
        })
        .then((data) => {
            const stream = data.stream
            setFollowStreams((prev) => [...prev,stream]);
            onClose();
        })
        .catch((err) => {
            setError(err.message);
            console.error(err);
        });
    }

    return(
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
            width: '80%',
            height: '80%',
            overflowY: 'auto',
            padding: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
        <form onSubmit={handleSubmit}>
            <FormLabel>New Follow Stream</FormLabel>
            <div>
            <label>
                Follow Stream Name
                <TextField
                    label = "Follow Stream Name"
                    variant="outlined"
                    fullWidth
                    value={newStreamName}
                    onChange={(e) => setNewStreamName(e.target.value)}
                    rows={1}
                    sx={{ marginBottom: '10px' }}
                />
                {error && (
                    <Typography variant="body2" color="error">
                        {error}
                    </Typography>
                )}
            </label>
            </div>
            <button type="submit">Submit</button>
        </form>
        </Box>
      </Modal>
    );
};

export default NewStreamModal;