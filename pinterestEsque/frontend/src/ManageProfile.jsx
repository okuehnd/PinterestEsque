import React from 'react';
import {
  Typography,
  Container,
  Divider,
  Box,
  Modal,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { useState, useEffect } from 'react';
import './App.css'
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const ManageProfileModal = ({open,onClose}) => {
    const [myBoards, setMyBoards] = useState([]);
    const [myFriends, setMyFriends] = useState([]);
    const [myFollowStreams, setMyFollowStreams] = useState([]);
    const [selectedFollowStream,setSelectedFollowStream] = useState(null);
    const [followStreamBoards,setFollowStreamBoards] = useState([]);
    const [friendRequests,setFriendRequests] = useState([]);
    const userId = localStorage.getItem('userId');
    const [selectedStreamBoard,setSelectedStreamBoard] = useState(null);

    useEffect(()=>{
        fetch('http://localhost:8000/api/GetProfileData/'+userId)
            .then((res) => res.json())
            .then((data)=>{
                setMyBoards(data.boardData)
                setMyFollowStreams(data.streamData)
                setFriendRequests(data.friendRequestData)
                setMyFriends(data.friendData)
            })
            .catch((error)=> console.error("Error fetching pins: ",error));
    },[])

    const handleDeleteBoard = (board) =>{
        const confirmed = window.confirm(`Are you sure you want to delete ${board.boardName}?`);
        if (confirmed) {
            fetch('http://localhost:8000/api/DeleteBoard/'+board.boardId)
            .then((res) => {
                if (!res.ok){
                    throw new Error(`Failed to delete ${board.boardName}`);
                }
                return res.json();
            })
            .then((data)=>{
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
                setMyFollowStreams((prev) => prev.filter((option) => option !== stream))
            })
            .catch((error)=> console.error("Error deleting stream: ",error));
        }
    };

    const handleManageStreamClick = (stream) =>{
      setSelectedStreamBoard(null);
      setSelectedFollowStream(stream);
      setFollowStreamBoards(stream.streamBoards)
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
                setFriendRequests((prev) => prev.filter((option) => option !== request))
            })
            .catch((error)=> console.error("Error rejecting request: ",error));
        }
    };

    const handleDeleteBoardFromStream = (stream,board) =>{
      const confirmed = window.confirm(`Are you sure you want to remove ${board.boardName} from ${stream.streamName}?`);
      if (confirmed) {
          fetch(`http://localhost:8000/api/RemoveBoardFromStream/${stream.streamId}/${board.boardId}`)
          .then((res) => {
              if (!res.ok){
                  throw new Error(`Failed to remove ${board.boardName}`);
              }
              return res.json();
          })
          .then((data)=>{
              setMyFollowStreams((prevStreams) =>
                prevStreams.map((s) =>
                  s.streamId === stream.streamId
                    ? { ...s, streamBoards: s.streamBoards.filter((b) => b.boardId !== board.boardId) }
                    : s
                )
              );
              setSelectedFollowStream(null);
          })
          .catch((error)=> console.error("Error removing board: ",error));
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
              width: '40%', 
              height: 'auto',
              overflowY: 'auto',
              padding: 3,
              borderRadius: 2,
              boxShadow: 24,
              maxHeight: '80%',
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
                    <Typography variant="body1" 
                    sx={{ flexGrow: 1 ,
                        cursor: 'pointer' ,
                        '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => handleManageStreamClick(stream)}
                    >
                      {stream.streamName}
                    </Typography>
                    {/* Show dropdown when a stream is selected */}
                    {selectedFollowStream === stream ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', marginLeft: 2 }}>
                        {/* Dropdown for selecting board */}
                        <Select
                          value={selectedStreamBoard}
                          onChange={(e) => setSelectedStreamBoard(e.target.value)}
                          displayEmpty
                          fullWidth
                          sx={{ marginBottom: 1 }}
                        >
                          <MenuItem value="" disabled>Select a board</MenuItem>
                          {followStreamBoards.map((board, index) => (
                            <MenuItem key={index} value={board}>
                              {board.boardName}
                            </MenuItem>
                          ))}
                        </Select>
                        {/* Delete button */}
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteBoardFromStream(stream,selectedStreamBoard)}
                          disabled={!selectedStreamBoard}
                        >
                          Delete Selected Board
                        </Button>
                      </Box>
                    ) :
                    (<IconButton onClick={() => handleDeleteStream(stream)} sx={{ marginLeft: 1 }}>
                      <CloseIcon sx={{ color: 'red' }} />
                    </IconButton>)}
                  </Box>
                ))}
              </Box>
    
            </form>
          </Box>
          
        </Modal>
      );

};

export default ManageProfileModal;