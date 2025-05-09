from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Follows,CustomUser,Board,Pin,PinToBoard,Likes,Comment, FollowStream,Likes,Streams,Friends,Requests,Tag
import random

# Create your views here.
from rest_framework.views import APIView
from rest_framework import status, permissions
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q,Count,Avg
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.exceptions import ObjectDoesNotExist
import json
from typing import List
import re
from django.db import connection

from .utils import getUser,getFollowingBoardsFromUser,getBoardOwner,getBoard,isPinLiked, getPinLikeCount, \
    getBoardPins, getPinTags,checkUsernameExists, getUsersBoards, areFriends,getRandomImage, \
    isFollowing,likePin,unlikePin, getPin, getPinComments, addComment,toggleFriendsOnlyComments,\
    getFollowStreams,userFollowsBoard,followBoard,unfollowBoard,addBoardToFollowStream, getFriends,\
    getFriendRequests,getStreamBoards,removeFriend,addFriend,acceptFriendRequest,rejectFriendRequest,\
    deleteFollowStream, deleteBoard, createFollowStream, friendRequestExists,  createFriendRequest,\
    createPin, pinToBoard, boardExists, createBoard, deletePin, getKeywordSortedPins, getRepins,removeBoardFromStream,checkConstraints
# User registration view
class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        # Check if user already exists
        if checkUsernameExists(username):
            return Response({'error': 'User already exists'}, status=400)

        user = CustomUser.objects.create_user(username=username, email=email, password=password)
        return Response({'message': 'User created successfully'})

# Login view to get access and refresh tokens
class LoginView(APIView):
    @csrf_exempt
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'userId':user.id,
            })
        return Response({'error': 'Invalid credentials'}, status=401)

# User profile view to get logged-in user's info
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'email': request.user.email,
            'id': request.user.id,
        })   

def GetFollowingPins(request,userId):
    user = getUser(userId)
    boards = getFollowingBoardsFromUser(userId)

    pin_data = []
    for board in boards:
        boardOwner = getBoardOwner(board['id'])
        pins = getBoardPins(board['id'])
        for pin in pins:
            tags = getPinTags(pin['id'])
            pin_data.append({
                'pinId':pin['id'],
                'pinLiked' : isPinLiked(pin['id'],user['id']),
                'pinLikeCount' : getPinLikeCount(pin['id']),
                'boardOwnerId': boardOwner['id'],
                'boardOwnerUsername': boardOwner['username'],
                'boardId':board['id'],
                'boardName':board['boardname'],
                'friendsOnlyComments' : board['friendsonlycomments'],
                'image':pin['imageurl'],
                'tags' : tags,
                'ts':pin['ts'],
            })

    return JsonResponse({'pinData' : pin_data})

def GetBoards(request,userId,boardOwnerId):
    boardOwner = getUser(boardOwnerId)
    boards = getUsersBoards(boardOwnerId)

    boardData = []
    for b in boards:
        pins = getBoardPins(b['id'])
        pinImage = ""
        if pins:
            pinImage = getRandomImage(b['id'])
        boardData.append({
            'boardId' : b['id'],
            'boardName':b['boardname'],
            'pinnedImage':pinImage,
        })
    return JsonResponse({'boardOwnerId':boardOwnerId,'boardOwnerUsername':boardOwner['username'],'boardData':boardData,'areFriends':areFriends(userId,boardOwnerId)})

def GetBoardPins(request,boardId,userId):
    board = getBoard(boardId)

    pin_data = []
    boardOwner = getBoardOwner(boardId)
    pins = getBoardPins(boardId)
    for pin in pins:
        tags = getPinTags(pin['id'])
        pin_data.append({
            'pinId':pin['id'],
            'image':pin['imageurl'],
            'pinLiked' : isPinLiked(pin['id'],userId),
            'pinLikeCount' : getPinLikeCount(pin['id']),
            'boardOwnerId': boardOwner['id'],
            'boardOwnerUsername': boardOwner['username'],
            'boardId':board['id'],
            'boardName':board['boardname'],
            'friendsOnlyComments' : board['friendsonlycomments'],
            'tags' : tags,
            'ts':pin['ts'],
        })

    return JsonResponse({'isFollowing':isFollowing(userId,boardId),'boardId':board['id'],'boardName':board['boardname'],'boardOwnerId': boardOwner['id'],'boardOwnerUsername':boardOwner['username'],'friendsOnlyComments' : board['friendsonlycomments'],'pinData' : pin_data})

@csrf_exempt
def LikePin(request,userId,pinId):
    checkConstraints()
    try:
        if isPinLiked(pinId,userId):
            return JsonResponse({'message': 'You have already liked this pin.'}, status=200)
        
        likePin(pinId,userId)

        return JsonResponse({'message': 'Pin liked successfully!'}, status=201)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User or Pin not found.'}, status=404)
    except Exception as e:
        print("Like Error: ",e)
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def RemoveLike(request,userId,pinId):
    try:
        if isPinLiked(pinId,userId):
            unlikePin(pinId,userId)
            return JsonResponse({'message': 'Pin unliked successfully!'}, status=201)

        return JsonResponse({'message': 'You have not liked this pin.'}, status=201)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User or Pin not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def GetPinComments(request,pinId):
    try:
        pin = getPin(pinId)
        pin_comments = getPinComments(pinId)
        comments = sorted(pin_comments, key=lambda x: x["ts"],reverse=True)
        comment_data = []
        for c in comments:
            user = getUser(c['user_id'])
            comment_data.append({
                'commentId':c['id'],
                'comment' : c['comment'],
                'commenterId':user['id'],
                'commenterUsername' : user['username'],
                'ts':c['ts'],
            })

        return JsonResponse({'commentData':comment_data})
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User or Pin not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
@csrf_exempt
def AddNewComment(request,userId,boardId,pinId):
    if request.method == 'POST':
        data = json.loads(request.body)
        comment_text = data.get('comment')

        comment_submitted = addComment(pinId,boardId,userId,comment_text)
        if comment_submitted:
            return JsonResponse({'message': 'Comment added successfully'}, status=200)
        return JsonResponse({'message': 'User and Board Owner not friends'}, status=400)
    return JsonResponse({'message': 'Invalid request'}, status=400)

def ToggleFriendsOnlySetting(request,userId,boardId):

    if toggleFriendsOnlyComments(userId,boardId):
        return JsonResponse({'message': f'Friends only permission changed successfully'}, status=200)
    return JsonResponse({'message': 'User does not own board'}, status=400)

def GetFollowStreams(request,userId):
    followStreams = getFollowStreams(userId)

    stream_data = []
    for stream in followStreams:
        stream_data.append({
            'streamId' : stream['id'],
            'streamName' : stream['streamname'],
        })
    return JsonResponse({'streamData':stream_data})

@csrf_exempt
def AddBoardToFollowStream(request,userId,boardId):
    if request.method == 'POST':
        count = 0
        data = json.loads(request.body)
        followSelect = data.get('followSelect')
        followStreams = data.get('followStreams',[])
        #if follow Select is false we have to make sure were not following that baord
        #if true we have to make sure we are following
        if followSelect:
            if not userFollowsBoard(userId,boardId):
                followBoard(userId,boardId)
        else:
            if userFollowsBoard:
                unfollowBoard(userId,boardId)
        
        for stream in followStreams:
            sid = int(stream['streamId'])
            val= addBoardToFollowStream(boardId,sid)
            if val:
                count+=1
        return JsonResponse({'message': f'Board added to {count} streams'}, status=200)
    return JsonResponse({'message': 'Invalid request'}, status=400)

def GetProfileData(request,userId):
    # user = CustomUser.objects.get(id=userId)
    boards = getUsersBoards(userId)

    friends = getFriends(userId)

    followStreams = getFollowStreams(userId)

    friendRequests = getFriendRequests(userId)

    board_data = []

    for board in boards:
        board_data.append({
            'boardId' : board['id'],
            'boardName': board['boardname'],
            'boardDescription' : board['description'],
            'boardFriendsOnly' : board['friendsonlycomments'],
        })

    friend_data = []

    for friend in friends:
        if friend['user1_id'] != userId:
            friendUser = getUser(friend['user1_id'])
        else:
            friendUser = getUser(friend['user2_id'])        
        friend_data.append({
            'friendId' : friend['id'],
            'friendUsername' : friendUser['username'],
        })

    stream_data = []

    for stream in followStreams:
        boards = getStreamBoards(stream['id'])
        stream_boards = []
        for board in boards:
            stream_boards.append({
                'boardId' : board['id'],
                'boardName': board['boardname']
            })

        stream_data.append({
            'streamId':stream['id'],
            'streamName' : stream['streamname'],
            'streamBoards' : stream_boards,
        })
    
    friend_request_data = []
    

    for req in friendRequests:
        requesterId = req['requester_id']
        requester = getUser(requesterId)
        friend_request_data.append({
            'requestId': req['id'],
            'requesterId' : requesterId,
            'requesterUsername' :requester['username'],
        })
    return JsonResponse({'boardData' : board_data,'friendData':friend_data,'friendRequestData':friend_request_data,'streamData':stream_data},status=200)

def Unfriend(request,userId,friendId):
    removeFriend(userId,friendId)
    return JsonResponse({'message' : 'Unfriended'})


def AcceptFriendRequest(request,requestId):
    acceptFriendRequest(requestId)
    return JsonResponse({'message' : "Accepted Friend Request"})

def RejectFriendRequest(request,requestId):
    rejectFriendRequest(requestId)
    return JsonResponse({'message' : "Rejected Friend Request"})

def DeleteFollowStream(request,streamId):
    deleteFollowStream(streamId)
    return JsonResponse({'message':"Follow Stream Deleted"})

def DeleteBoard(request,boardId):
    deleteBoard(boardId)
    return JsonResponse({'message' : "Board deleted"})

@csrf_exempt
def CreateNewStream(request,userId,boardId):
     if request.method == 'POST':
        data = json.loads(request.body)
        streamName = data.get('streamName')
        newStream = createFollowStream(userId,boardId,streamName)
        if not newStream:
            return JsonResponse({'error' : 'Follow stream name already exists'},status=401)
        return JsonResponse({'message':'New follow stream create','stream': {"streamId":newStream,"streamName":streamName}})
     
def NewFriendRequest(request,userId,friendId):
    existingRequest = friendRequestExists(friendId,userId)
    if existingRequest:
        acceptFriendRequest(existingRequest['id'])
        return JsonResponse({'message' : 'New Friend Added'})
    
    existingRequest = friendRequestExists(userId,friendId)

    if existingRequest:
        return Response({'error': 'You have already sent a request'},status=401)
    
    createFriendRequest(userId,friendId)
    return JsonResponse({'message' : 'Request Sent!'})

@csrf_exempt
def CreatePin(request,userId):
    if request.method == 'POST':
        count = 0
        data = json.loads(request.body)
        imageUrl = data.get('imageUrl')
        tagString = data.get('tags')
        tags = re.findall(r"#(\w+)", tagString)
        boards = data.get('addToBoards')
        if not boards:
            return Response({"error":"Must Pin to at least one board"},status=401)

        newPin = createPin(userId,imageUrl,tags)
        
        for boardId in boards:
            count+=1
            pinToBoard(newPin,boardId)
        return JsonResponse({'message': f'Pin added to {count} boards'}, status=200)
    return JsonResponse({'message': 'Invalid request'}, status=400)

@csrf_exempt
def CreateBoard(request,userId):
    if request.method == 'POST':
        data = json.loads(request.body)
        # user = CustomUser.objects.get(id=userId)
        boardName = data.get('boardName')
        if boardExists(userId,boardName):
            return Response({'error':'Board already exists'},status=400)
        boardDescrip = data.get('boardDescription')
        createBoard(userId,boardName,boardDescrip)
        return JsonResponse({'message' : 'Created Board'},status=200)
    return JsonResponse({'message': 'Invalid request'}, status=400)

@csrf_exempt
def DeletePin(request,userId,boardId,pinId):
    deletePin(userId,boardId,pinId)
    return JsonResponse({'message' : 'Pin removed'},status=200)
    
@csrf_exempt
def Repin(request,userId,pinId):
    if request.method == 'POST':
        count = 0
        data = json.loads(request.body)
        boards = data.get('addToBoards')
        if not boards:
            return Response({"error":"Must Pin to at least one board"},status=401)

        for boardId in boards:
            count+=1
            pinToBoard(pinId,boardId)
        return JsonResponse({'message': f'Pin added to {count} boards'}, status=200)
    return JsonResponse({'message': 'Invalid request'}, status=400)

def GetStreamPins(request,userId,streamId):
    boards = getStreamBoards(streamId)

    pin_data = []
    for board in boards:
        boardOwnerId = board['user_id']
        boardOwner = getUser(boardOwnerId)
        pins = getBoardPins(board['id'])
        for pin in pins:
            tags = getPinTags(pin['id'])
            pin_data.append({
                'pinId':pin['id'],
                'pinLiked' : isPinLiked(pin['id'],userId),
                'pinLikeCount' : getPinLikeCount(pin['id']),
                'boardOwnerId': boardOwnerId,
                'boardOwnerUsername': boardOwner['username'],
                'boardId':board['id'],
                'boardName':board['boardname'],
                'friendsOnlyComments' : board['friendsonlycomments'],
                'image':pin['imageurl'],
                'tags' : tags,
                'ts':pin['ts'],
            })
    return JsonResponse({'pinData' : pin_data})

@csrf_exempt
def SearchPins(request,userId):
    if request.method == 'POST':
        data = json.loads(request.body)
        keyword = data.get('keyword')
        sortMethod=data.get('sortMethod').lower()
        pins =  getKeywordSortedPins(keyword,sortMethod)

        pin_data=[] 
        for pin in pins:
            tags = getPinTags(pin['id'])
            repins = getRepins(pin['id'])
            for repin in repins:
                boardId = repin['board_id']
                boardOwner = getBoardOwner(boardId)
                board = getBoard(boardId)
                pin_data.append({
                    'pinId':pin['id'],
                    'pinLiked' : isPinLiked(pin['id'],userId) ,
                    'pinLikeCount' : getPinLikeCount(pin['id']),
                    'boardOwnerId': boardOwner['id'],
                    'boardOwnerUsername': boardOwner['username'],
                    'boardId':boardId,
                    'boardName':board['boardname'],
                    'friendsOnlyComments' : board['friendsonlycomments'],
                    'image':pin['imageurl'],
                    'tags' : tags,
                    'ts':pin['ts'],
                })
        return JsonResponse({'pinData' : pin_data})
           
    return JsonResponse({'message': 'Invalid request'}, status=400)

def GetStreamBoards(request,streamId):
    # followStream = FollowStream.objects.get(id=streamId)
    boards = getStreamBoards(streamId)

    boardData = []
    for b in boards:
        pins = getBoardPins(b['id'])
        pinImage = ""
        if pins:
            pinImage = getRandomImage(b['id'])
        boardData.append({
            'boardId' : b['id'],
            'boardName':b['boardname'],
            'pinnedImage':pinImage,
        })
    return JsonResponse({'boardData':boardData})

def RemoveBoardFromStream(request,streamId,boardId):
    removeBoardFromStream(streamId,boardId)
    return JsonResponse({'message' : 'Board removed from stream'})

   