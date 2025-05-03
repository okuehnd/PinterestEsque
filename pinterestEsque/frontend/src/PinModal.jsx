import React from 'react';
import {
  Box,
  Modal
} from '@mui/material';
import './App.css'
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
              <CommentCard pin={pin} liked={pin.pinLiked}/>
            </>
          )}
        </Box>
      </Modal>
    );
};

export default PinModal;