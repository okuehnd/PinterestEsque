import React from 'react';
import {  Typography, TextField, Button,Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PinCard from './PinCard';


const CommentCard = ({ pin, liked }) => {
    const [error,setError] = useState(null);
    const [comments,setComments] = useState([]);
    const userId = localStorage.getItem('userId')
    const [newComment,setNewComment] = useState('');
    const [refreshComments, setRefreshComments] = useState(false);

    const navigate = useNavigate();
    const imageHeight = 280;

    const fetchComments = () => {
        fetch(`http://localhost:8000/api/GetPinComments/${pin.pinId}`)
            .then((res) => res.json())
            .then((data) => {
                setComments(data.commentData);
            })
            .catch((error) => console.error("Error fetching comments: ", error));
    };

    useEffect(()=>{
        fetchComments();
    },[refreshComments])

    const handleCommenterClick = (commenterId) => {
        navigate(`/user/${commenterId}`);
    }

    const handleCommentSubmit = () => {
        const userId = localStorage.getItem('userId');
        const pinId = pin.pinId;  
        const boardId = pin.boardId;

        if (!newComment.trim()) {
            setError('Comment cannot be empty!');
            return;
        }

        // Send POST request to the backend to submit the comment
        fetch(`http://localhost:8000/api/AddComment/${userId}/${boardId}/${pinId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: newComment }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to submit comment');
            }
            return response.json();
        })
        .then((data) => {
            setNewComment('');
            setError(null); 
            setTimeout(() => {
                setRefreshComments(prev => !prev); 
            }, 200); 
        })
        .catch((err) => {
            setError(err.message);
            console.error(err);
        });
    };


    return (
        <div style={{ width: '100%' }}>
          {/* Pin Card Section */}
          <Box sx={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
            <PinCard pin={pin} liked={liked} imageHeight={imageHeight} />
          </Box>
    
          {/* Comment Section */}
          <Box sx={{ marginTop: '20px' }}>
            <TextField
              label="Write a Comment"
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              multiline
              rows={3}
              sx={{
                marginBottom: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
              }}
            />
            {error && (
              <Typography variant="body2" color="error" sx={{ marginBottom: '10px' }}>
                {error}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleCommentSubmit}
              sx={{
                marginTop: '10px',
                width: '100%', 
                backgroundColor: '#3f51b5',
                '&:hover': { backgroundColor: '#303f9f' }, 
              }}
            >
              Submit Comment
            </Button>
          </Box>
    
          {/* Comments List Section */}
          <Box sx={{ marginTop: '20px' }}>
            {comments.map((comment) => (
              <Typography
                key={comment.commentId}
                variant="body2"
                color="text.secondary"
                onClick={() => handleCommenterClick(comment.commenterId)}
                sx={{
                  cursor: 'pointer',
                  marginBottom: '8px', 
                  fontSize: '1.1rem', 
                  '&:hover': {
                    textDecoration: 'underline', 
                  },
                }}
              >
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                  @{comment.commenterUsername}
                </span>
                :{" "}
                <span style={{ fontSize: '1.1rem' }}>
                  {comment.comment}
                </span>
              </Typography>
            ))}
          </Box>
        </div>
      );
};

export default CommentCard;
