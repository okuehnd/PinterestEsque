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
  Modal
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, useEffect } from 'react';
import './App.css'
// import './style.css'
import { useNavigate, Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import axios from 'axios';
import PinCard from './PinCard';
import CommentCard from './CommentCard';

const PinModal = ({pin,open,onClose}) => {
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
          {pin && (
            <>
              {/* <Card sx={{ maxWidth: '100%', mb: 2 }}>
                <CardMedia component="img" height="400" image={selectedPin.imageURL} alt="Pin Image" />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedPin.boardName}
                  </Typography>
                </CardContent>
              </Card> */}

              {/* Render CommentCard component */}
              <CommentCard pin={pin} liked={pin.pinLiked}/>
            </>
          )}
        </Box>
      </Modal>
    );
};

export default PinModal;