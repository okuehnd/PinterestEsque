import React from 'react';
import {Box, Divider, Card, CardMedia, CardContent, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import PushPinIcon from '@mui/icons-material/PushPin';
import RepinModal from './AddToBoardModal';

const PinCard = ({ myBoards,setPins,boardId,editModeOn,pin, liked , onClick, imageHeight}) => {
    const [isLiked,setIsLiked] = useState(liked);
    const [error,setError] = useState(null);
    const [isRepinModalOpen,setIsRepinModalOpen] = useState(false);
    const userId = localStorage.getItem('userId')
    const navigate = useNavigate();
    console.log("PIN OBJECT:",pin)
    console.log("DELETE PIN TEST:",pin.pinId)

    const handleLike = () => {
        fetch('http://localhost:8000/api/LikePin/'+userId+'/'+pin.pinId,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) =>{
            if(!response.ok){
                throw new Error('Failed to like the pin');
            }
            return response.json()
        })
        .then((data) => {
            setIsLiked(true);
        })
        .catch((err) => {
            setError(err.message);
            console.error(err);
        })
    }

    const handleUnlike = () => {
        fetch('http://localhost:8000/api/UnlikePin/'+userId+'/'+pin.pinId,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) =>{
            if(!response.ok){
                throw new Error('Failed to unlike the pin');
            }
            return response.json()
        })
        .then((data) => {
            setIsLiked(false);
        })
        .catch((err) => {
            setError(err.message);
            console.error(err);
        })
    }

    const handleBoardOwnerClick = (boardOwnerId) => {
        navigate(`/user/${boardOwnerId}`);
    }

    const handleDeletePin = ()=>{
        const confirmed = window.confirm(`Are you sure you want to this pin?`);
        if(confirmed)   { 
            fetch(`http://localhost:8000/api/DeletePin/${userId}/${boardId}/${pin.pinId}`)
            .then((res) => {
            if(!res.ok) {
                throw new Error('Failed to delete pin')
            }
            return res.json()
            })
            .then((data) => {
            console.log("TOGGLE MESSAGE: ",data.message)
            setPins((prev) => prev.filter((option => option !== pin))) //REMOVE PIN!!!!!!!!
            
            })
        .catch((error)=> console.error("Error changing settings: ",error));
        }
    };

    const handleRepinClick = () =>{
        setIsRepinModalOpen(true);
    };

    const handleRepinModalClose = () =>{
        setIsRepinModalOpen(false);
    };

    const handleTagClick = () =>{

    };

    const handleBoardNameClick = () =>{
        navigate(`/board/${pin.boardId}`);
    };

    return (
        <Card sx={{ 
          cursor: 'pointer', 
          position: 'relative', 
          marginBottom: '20px', 
          boxShadow: 3, 
          borderRadius: '10px', 
          '&:hover': { 
            boxShadow: 6, 
            transform: 'scale(1.03)', 
            transition: 'all 0.3s ease-in-out' 
          } 
        }}>
          {editModeOn && (
            <IconButton 
              onClick={handleDeletePin}
              sx={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                zIndex: 2, 
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              <CloseIcon sx={{ color: 'red', fontSize: 30 }} />
            </IconButton>
          )}
          
          <CardMedia 
            component="img" 
            height={imageHeight*1.5} 
            image={pin.image} 
            alt="Pin Image" 
            sx={{ 
              objectFit: 'cover', 
              borderRadius: '10px', 
              maxHeight: '100%', 
              '&:hover': { opacity: 0.8 } 
            }} 
            onClick={onClick}
          />
          
          <CardContent sx={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Board Name by Board Owner */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography 
                variant="h6" 
                color="text.primary" 
                sx={{ fontWeight: 600 }}
                onClick={handleBoardNameClick}
              >
                {pin.boardName}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                onClick={() => handleBoardOwnerClick(pin.boardOwnerId)} 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { textDecoration: 'underline' } 
                }}
              >
                @{pin.boardOwnerUsername}
              </Typography>
            </Box>
    
            {/* Divider between name and buttons */}
            <Divider sx={{ mb: 0.5, opacity: 0.3 }} />
    
            {/* Tags Section in the middle */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px', 
              justifyContent: 'center', 
              mb: 2,
              cursor: 'pointer',
              '& a': {
                color: 'inherit',
                textDecoration: 'none',
                fontWeight: 400,
                '&:hover': {
                  textDecoration: 'underline',
                  color: 'blue',
                }
              }
            }}>
              {pin.tags.map((tag, idx) => (
                <span key={idx} onClick={() => handleTagClick(tag)}>
                  #{tag}
                </span>
              ))}
            </Box>

            {/* Divider between name and buttons */}
            <Divider sx={{ mb: 0.5, opacity: 0.3 }} />
    
            {/* Heart Button and Pin Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
              <IconButton onClick={handleRepinClick} sx={{ padding: 0 }}>
                <PushPinIcon sx={{ color: '#89DAFF', fontSize: 28 }} />
              </IconButton>
              
              <IconButton onClick={isLiked ? handleUnlike : handleLike} sx={{ padding: 0 }}>
                <FavoriteIcon sx={{ color: isLiked ? 'red' : 'inherit', fontSize: 28 }} />
              </IconButton>
            </Box>
          </CardContent>
    
          {/* Repin Modal */}
          <RepinModal myBoards={myBoards} pinId={pin.pinId} open={isRepinModalOpen} onClose={handleRepinModalClose} />
        </Card>
      );
};

export default PinCard;
