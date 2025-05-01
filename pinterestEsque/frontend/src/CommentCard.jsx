import React from 'react';
import { Card, CardMedia, CardContent, Typography, IconButton, TextField, Button,Box } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PinCard from './PinCard';


const CommentCard = ({ pin, liked }) => {
    const [isLiked,setIsLiked] = useState(liked);
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
        const pinId = pin.pinId;  // Assuming pinId is available in pin
        const boardId = pin.boardId;


        console.log("BOARD ID ON SUBMIT:", boardId);

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
                setRefreshComments(prev => !prev); // Delay a little before refetch
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
                backgroundColor: '#f9f9f9', // Light background for input area
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
                width: '100%', // Full width for the button
                backgroundColor: '#3f51b5',
                '&:hover': { backgroundColor: '#303f9f' }, // Darker shade on hover
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
                  marginBottom: '8px', // Spacing between comments
                  fontSize: '1.1rem', // Slightly larger text size
                  '&:hover': {
                    textDecoration: 'underline', // Underline effect on hover
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
