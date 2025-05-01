import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Divider,
  Card,
  Box,
  CardActionArea,
  CardContent,
  CardMedia,
  CssBaseline,
  Switch,
  Fab,
  Modal,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState, useEffect } from 'react';
import './App.css'
// import './style.css'
import { useNavigate, Link, useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import PinCard from './PinCard';
import PinModal from './PinModal'
import FollowBoardModal from './FollowModal';

const ManageProfileModal = ({open,onClose}) => {
    //Need to list all boards I own and give option to delete them
    //Need to show all friends and give option to remove them
    //Need to show all follow streams and give option to delete them 
    //If I choose to manage a follow stream I should I have option to remove a board from it

    //ALSO NEED FRIEND REQUESTS SO I CAN ACCEPT/REJECT
    const [myBoards, setMyBoards] = useState([]);
    const [myFriends, setMyFriends] = useState([]);
    const [myFollowStreams, setMyFollowStreams] = useState([]);
    const [selectedFollowStream,setSelectedFollowStream] = useState(null);
    const [followStreamBoards,setFollowStreamBoards] = useState([]);
    const [friendRequests,setFriendRequests] = useState([]);
    const userId = localStorage.getItem('userId');

    useEffect(()=>{
        fetch('http://localhost:8000/api/GetProfileData/'+userId)
            .then((res) => res.json())
            .then((data)=>{
                console.log(data)
                setMyBoards(data.boardData)
                setMyFollowStreams(data.streamData)
                setFriendRequests(data.friendRequestData)
                setMyFriends(data.friendData)
            })
            .catch((error)=> console.error("Error fetching pins: ",error));
    },[])

    const handleSubmit = () =>{

    };

    const handleDeleteBoard = (board) =>{
        const confirmed = window.confirm(`Are you sure you want to delete ${board.boardName}?`);
        if (confirmed) {
            fetch('http://localhost:8000/api/DeleteBoard/'+board.boardName)
            .then((res) => {
                if (!res.ok){
                    throw new Error(`Failed to delete ${board.boardName}`);
                }
                return res.json();
            })
            .then((data)=>{
                console.log(data)
                setMyBoards((prev) => prev.filter((option) => option !== board))
            })
            .catch((error)=> console.error("Error deleting board: ",error));
        }
    };
    
    const handleUnfriend = (friend)  =>{
        const confirmed = window.confirm(`Are you sure you want to unfriend ${friend.friendUsername}?`);
        if (confirmed) {
            fetch('http://localhost:8000/api/Unfriend/'+userId+ '/'+friend.friendId)
            .then((res) => {
                if (!res.ok){
                    throw new Error(`Failed to unfriend ${friend.friendUsername}`);
                }
                return res.json();
            })
            .then((data)=>{
                console.log(data)
                setMyFriends((prev) => prev.filter((option) => option !==friend))
            })
            .catch((error)=> console.error("Error unfriending: ",error));
        }
            
    };

    const handleDeleteStream = (stream) => {
        const confirmed = window.confirm(`Are you sure you want to delete ${stream.streamName}?`);
        if (confirmed) {
            fetch('http://localhost:8000/api/DeleteFollowStream/'+stream.streamId)
            .then((res) => {
                if (!res.ok){
                    throw new Error(`Failed to delete ${stream.streamName}`);
                }
                return res.json();
            })
            .then((data)=>{
                console.log(data)
                setMyFollowStreams((prev) => prev.filter((option) => option !== stream))
            })
            .catch((error)=> console.error("Error deleting stream: ",error));
        }
    };

    const handleManageStreamClick = () =>{

    };

    const handleAcceptFriend = (request) =>{
        const confirmed = window.confirm(`Accept friend request from ${request.requesterUsername}?`);
        if (confirmed) {
            fetch('http://localhost:8000/api/AcceptFriendRequest/'+request.requestId)
            .then((res) => {
                if (!res.ok){
                    throw new Error(`Failed to accept friend request from ${request.requesterUsername}`);
                }
                return res.json();
            })
            .then((data)=>{
                console.log(data)
                setFriendRequests((prev) => prev.filter((option) => option !== request));
                const newFriend = {'friendId' : request.requesterId,'friendUsername' : request.requesterUsername};
                setMyFriends((prev)=>[...prev,newFriend])
            })
            .catch((error)=> console.error("Error accepting request: ",error));
        }
    };

    const handleRejectFriend = (request) =>{
        const confirmed = window.confirm(`Reject friend request from ${request.requesterUsername}?`);
        if (confirmed) {
            fetch('http://localhost:8000/api/RejectFriendRequest/'+request.requestId)
            .then((res) => {
                if (!res.ok){
                    throw new Error(`Failed to reject friend request from ${request.requesterUsername}`);
                }
                return res.json();
            })
            .then((data)=>{
                console.log(data)
                setFriendRequests((prev) => prev.filter((option) => option !== request))
            })
            .catch((error)=> console.error("Error rejecting request: ",error));
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
              width: '40%', // Adjusted width for a more compact view
              height: 'auto',
              overflowY: 'auto',
              padding: 3,
              borderRadius: 2,
              boxShadow: 24,
              maxHeight: '80%', // Keeps the modal from becoming too large on big screens
            }}
          >
            <form onSubmit={(e) => e.preventDefault()}>
              <Container sx={{ marginBottom: 3 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ fontWeight: 'bold', textAlign: 'center' }}
                >
                  Manage
                </Typography>
              </Container>
    
              {/* My Boards Section */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ fontWeight: 'bold', marginBottom: 1 }}
                >
                  My Boards
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />
                {myBoards.map((board, index) => (
                  <Box display="flex" alignItems="center" key={index} sx={{ marginBottom: 1 }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {board.boardName}
                    </Typography>
                    <IconButton onClick={() => handleDeleteBoard(board)} sx={{ marginLeft: 1 }}>
                      <CloseIcon sx={{ color: 'red' }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
    
              {/* My Friends Section */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ fontWeight: 'bold', marginBottom: 1 }}
                >
                  My Friends
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />
                {myFriends.map((friend, index) => (
                  <Box display="flex" alignItems="center" key={index} sx={{ marginBottom: 1 }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {friend.friendUsername}
                    </Typography>
                    <IconButton onClick={() => handleUnfriend(friend)} sx={{ marginLeft: 1 }}>
                      <CloseIcon sx={{ color: 'red' }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
    
              {/* Friend Requests Section */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ fontWeight: 'bold', marginBottom: 1 }}
                >
                  Friend Requests
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />
                {friendRequests.map((req, index) => (
                  <Box display="flex" alignItems="center" key={index} sx={{ marginBottom: 1 }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {req.requesterUsername}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" sx={{ marginLeft: 'auto' }}>
                      <IconButton onClick={() => handleRejectFriend(req)} sx={{ marginRight: 1 }}>
                        <CloseIcon sx={{ color: 'red' }} />
                      </IconButton>
                      <IconButton onClick={() => handleAcceptFriend(req)}>
                        <CheckIcon sx={{ color: 'green' }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
    
              {/* My Follow Streams Section */}
              <Box sx={{ marginBottom: 3 }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ fontWeight: 'bold', marginBottom: 1 }}
                >
                  My Follow Streams
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />
                {myFollowStreams.map((stream, index) => (
                  <Box display="flex" alignItems="center" key={index} sx={{ marginBottom: 1 }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {stream.streamName}
                    </Typography>
                    <IconButton onClick={() => handleDeleteStream(stream)} sx={{ marginLeft: 1 }}>
                      <CloseIcon sx={{ color: 'red' }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
    
            </form>
          </Box>
        </Modal>
      );

};

export default ManageProfileModal;