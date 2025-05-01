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

# User registration view
class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response({'error': 'User already exists'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({'message': 'User created successfully'})

# Login view to get access and refresh tokens
class LoginView(APIView):
    @csrf_exempt
    def post(self, request):
        username = request.data.get('username')
        print("GOT USERNAME:",username)
        password = request.data.get('password')
        print("GOT PASSWORD:",password)

        user = authenticate(username=username, password=password)
        
        print("USER:",user)
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
    user = CustomUser.objects.get(id=userId)
    boards = [f.board for f in Follows.objects.filter(user=user)]
    print("BOARDS: ",boards)

    pin_data = []
    for board in boards:
        boardOwner = CustomUser.objects.get(id=board.user.id)
        pins = board.getPins()
        for pin in pins:
            tags = pin.getTags()
            pin_data.append({
                'pinId':pin.id,
                'pinLiked' : Likes.objects.filter(user=user,pin=pin).exists(),
                'boardOwnerId': boardOwner.id,
                'boardOwnerUsername': boardOwner.username,
                'boardId':board.id,
                'boardName':board.boardName,
                'friendsOnlyComments' : board.friendsOnlyComments,
                'image':pin.imageURL,
                'tags' : tags,
                'ts':pin.ts,
            })
        print("PINS:",pins)

    return JsonResponse({'pinData' : pin_data})

def GetBoards(request,userId,boardOwnerId):
    boardOwner = CustomUser.objects.get(id=boardOwnerId)
    boards = Board.objects.filter(user=boardOwnerId)
    user = CustomUser.objects.get(id=userId)
    friends = Friends.objects.filter(Q(user1=user,user2=boardOwner)|Q(user1=boardOwner,user2=user)).exists()

    boardData = []
    print("BOARDS:",boards)
    for b in boards:
        pins = b.getPins()
        pinImage = ""
        print("Pins:" , pins)
        if pins:
            pinImage = random.choice(pins).imageURL
        boardData.append({
            'boardId' : b.id,
            'boardName':b.boardName,
            'pinnedImage':pinImage,
        })
        print("BOARD DATA:",boardData)
        print("BOARD OWNER USERNAME: ",boardOwner.username)
    return JsonResponse({'boardOwnerId':boardOwnerId,'boardOwnerUsername':boardOwner.username,'boardData':boardData,'areFriends':friends})

def GetBoardPins(request,boardId,userId):
    board = Board.objects.get(id=boardId)
    user = CustomUser.objects.get(id=userId)
    print("BOARD NAME:",board.boardName)
    # boards = [f.board for f in Follows.objects.filter(user=user)]
    print("GET pins for board: ",board)

    isFollowing = Follows.objects.filter(user=user,board=board).exists()

    pin_data = []
    boardOwner = CustomUser.objects.get(id=board.user.id)
    print("BOARD OWNER:",boardOwner.username)
    pins = board.getPins()
    for pin in pins:
        tags = pin.getTags()
        pin_data.append({
            'pinId':pin.id,
            'image':pin.imageURL,
            'pinLiked' : Likes.objects.filter(user=user,pin=pin).exists(),
            'boardOwnerId': boardOwner.id,
            'boardOwnerUsername': boardOwner.username,
            'boardId':board.id,
            'boardName':board.boardName,
            'friendsOnlyComments' : board.friendsOnlyComments,
            'tags' : tags,
            'ts':pin.ts,
        })
    print("PINS:",pins)

    return JsonResponse({'isFollowing':isFollowing,'boardId':board.id,'boardName':board.boardName,'boardOwnerId': boardOwner.id,'boardOwnerUsername':boardOwner.username,'friendsOnlyComments' : board.friendsOnlyComments,'pinData' : pin_data})

@csrf_exempt
def LikePin(request,userId,pinId):
    try:
        user = CustomUser.objects.get(id=userId)
        pin = Pin.objects.get(id=pinId)
        
        if Likes.objects.filter(user=user, pin=pin).exists():
            return Response({'error': 'You have already liked this pin.'}, status=401)
        
        like = Likes.objects.create(user=user, pin=pin)
        like.save()

        return JsonResponse({'message': 'Pin liked successfully!'}, status=201)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User or Pin not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def RemoveLike(request,userId,pinId):
    try:
        user = CustomUser.objects.get(id=userId)
        pin = Pin.objects.get(id=pinId)
        
        if Likes.objects.filter(user=user, pin=pin).exists():
            like = Likes.objects.get(user=user,pin=pin)
            like.delete()
            return JsonResponse({'message': 'Pin unliked successfully!'}, status=201)

        return JsonResponse({'error': 'You have not liked this pin.'}, status=400)
    
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User or Pin not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def GetPinComments(request,pinId):
    try:
        pin = Pin.objects.get(id=pinId)
        print("GET COMMENTS PIN:",pin)
        comments = Comment.objects.filter(pin=pin).order_by('-ts')
        print("COMMENTS: ",comments)

        comment_data = []
        for c in comments:
            print("C COMMENT:",c)
            user = c.user
            comment_data.append({
                'commentId':c.id,
                'comment' : c.comment,
                'commenterId':user.id,
                'commenterUsername' : user.username,
                'ts':c.ts,
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
        print("THIS IS THE NEW COMMENT: ", comment_text)

        comment_submitted = Comment.submitComment(userId,boardId,pinId,comment_text)
        if comment_submitted:
            return JsonResponse({'message': 'Comment added successfully'}, status=200)
        return JsonResponse({'message': 'User and Board Owner not friends'}, status=400)
    return JsonResponse({'message': 'Invalid request'}, status=400)

def ToggleFriendsOnlySetting(request,userId,boardId):
    board = Board.objects.get(id=boardId)
    user = CustomUser.objects.get(id=userId)
    print("FRIENDS ONLY COMMENTS START: ",board.friendsOnlyComments)

    if board.user == user:
        new_setting = board.switchCommentPermission()
        print("FRIENDS ONLY COMMENTS END: ",board.friendsOnlyComments)
        return JsonResponse({'message': f'Friends only permission changed successfully to {new_setting}'}, status=200)
    print("FRIENDS ONLY COMMENTS END2: ",board.friendsOnlyComments)
    return JsonResponse({'message': 'User does not own board'}, status=400)

def GetFollowStreams(request,userId):
    user = CustomUser.objects.get(id=userId);
    followStreams = FollowStream.objects.filter(user=user)

    stream_data = []
    for stream in followStreams:
        stream_data.append({
            'streamId' : stream.id,
            'streamName' : stream.streamName,
        })
    return JsonResponse({'streamData':stream_data})

@csrf_exempt
def AddBoardToFollowStream(request,userId,boardId):
    if request.method == 'POST':
        count = 0
        data = json.loads(request.body)
        followSelect = data.get('followSelect')
        print("GOT DATA: ",data)
        followStreams = data.get('followStreams',[])
        print("These are the follow streams:",followStreams)
        board = Board.objects.get(id=boardId)
        user = CustomUser.objects.get(id=userId)
        #if follow Select is false we have to make sure were not following that baord
        #if true we have to make sure we are following
        if followSelect:
            if not Follows.objects.filter(user=user,board=board):
                Follows.objects.create(user=user,board=board)
        else:
            if Follows.objects.filter(user=user,board=board):
                Follows.objects.filter(user=user,board=board).delete()
        

        for stream in followStreams:
            sid = int(stream['streamId'])
            val= Streams.addToStream(sid,boardId)
            if val:
                count+=1
        return JsonResponse({'message': f'Board added to {count} streams'}, status=200)
    return JsonResponse({'message': 'Invalid request'}, status=400)

def GetProfileData(request,userId):
    print("GET PROFILE DATA")
    user = CustomUser.objects.get(id=userId)
    boards = Board.objects.filter(user=user)

    friendships = Friends.objects.filter(Q(user1=user)|Q(user2=user))
    friends = [fs.user1 if fs.user2==user else fs.user2 for fs in friendships]

    followStreams = FollowStream.objects.filter(user=user)

    friendRequests = Requests.objects.filter(requestee=user)
    print("FRIENDS REQUESTS: ",friendRequests)

    board_data = []

    for board in boards:
        board_data.append({
            'boardId' : board.id,
            'boardName': board.boardName,
            'boardDescription' : board.description,
            'boardFriendsOnly' : board.friendsOnlyComments,
        })

    friend_data = []

    for friend in friends:
        friend_data.append({
            'friendId' : friend.id,
            'friendUsername' : friend.username,
        })

    stream_data = []

    for stream in followStreams:
        stream_data.append({
            'streamId':stream.id,
            'streamName' : stream.streamName,
        })
    
    friend_request_data = []

    for req in friendRequests:
        requester = CustomUser.objects.get(id=req.requester.id)
        friend_request_data.append({
            'requestId': req.id,
            'requesterId' : requester.id,
            'requesterUsername' :requester.username,
        })

    print("BOARD DATA: ",board_data)

    print("FRIENDS: ",friend_data)

    print("FRIEND REQUESTS: ",friend_request_data)

    print("STREAMS: ",stream_data)

    return JsonResponse({'boardData' : board_data,'friendData':friend_data,'friendRequestData':friend_request_data,'streamData':stream_data},status=200)


def Unfriend(request,userId,friendId):
    user = CustomUser.objects.get(id=userId)
    friend = CustomUser.objects.get(id=friendId)

    Friends.objects.filter(Q(user1=user,user2=friend)|Q(user1=friend,user2=user)).delete()

    return JsonResponse({'message' : 'Unfriended'})


def AcceptFriendRequest(request,requestId):
    req = Requests.objects.get(id=requestId)
    req.acceptFriend();
    return JsonResponse({'message' : "Accepted Friend Request"})

def RejectFriendRequest(request,requestId):
    req = Requests.objects.get(id=requestId)
    req.rejectFriend();
    return JsonResponse({'message' : "Rejected Friend Request"})

def DeleteFollowStream(request,streamId):
    FollowStream.objects.filter(id=streamId).delete()
    return JsonResponse({'message':"Follow Stream Deleted"})

def DeleteBoard(request,boardId):
    Board.objects.filter(id=boardId).delete()
    return JsonResponse({'message' : "Board deleted"})

@csrf_exempt
def CreateNewStream(request,userId,boardId):
     if request.method == 'POST':
        data = json.loads(request.body)
        user = CustomUser.objects.get(id=userId)
        board = Board.objects.get(id=boardId)
        streamName = data.get('streamName')
        print(streamName)
        if FollowStream.objects.filter(user=user,streamName=streamName).exists():
            return Response({'error' : 'Follow stream name already exists'},status=401)
        
        newStream = FollowStream.objects.create(user=user,streamName=streamName)
        Streams.objects.create(followStream=newStream,board=board)
        return JsonResponse({'message':'New follow stream create','stream': {"streamId":newStream.id,"streamName":streamName}})
     
def NewFriendRequest(request,userId,friendId):
    requestee = CustomUser.objects.get(id=friendId)
    requester=CustomUser.objects.get(id=userId)
    existingRequest = Requests.objects.filter(requester=requestee,requestee=requester).exists()

    if existingRequest:
        existingRequest.acceptFriend()
        return JsonResponse({'message' : 'New Friend Added'})
    
    existingRequest = Requests.objects.filter(requester=requester,requestee=requestee).exists()

    if existingRequest:
        return Response({'error': 'You have already sent a request'},status=401)
    
    Requests.objects.create(requester=requester,requestee=requestee)
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
        print("CREATE PIN GOT DATA: ",data)

        user = CustomUser.objects.get(id=userId)
        #if follow Select is false we have to make sure were not following that baord
        #if true we have to make sure we are following

        newPin = Pin.objects.create(user=user,imageURL=imageUrl)

        for tag in tags:
            Tag.objects.create(pin=newPin,tag=tag)
        
        for boardId in boards:
            count+=1
            board = Board.objects.get(id=boardId)
            PinToBoard.objects.create(pin=newPin,board=board)
        return JsonResponse({'message': f'Pin added to {count} boards'}, status=200)
    return JsonResponse({'message': 'Invalid request'}, status=400)

@csrf_exempt
def CreateBoard(request,userId):
    if request.method == 'POST':
        count = 0
        data = json.loads(request.body)
        user = CustomUser.objects.get(id=userId)
        boardName = data.get('boardName')
        if Board.objects.filter(user=user,boardName=boardName).exists():
            return Response({'error':'Board already exists'},status=400)
        boardDescrip = data.get('boardDescription')
        Board.objects.create(user=user,boardName=boardName,description=boardDescrip)
        return JsonResponse({'message' : 'Created Board'},status=200)
    return JsonResponse({'message': 'Invalid request'}, status=400)

@csrf_exempt
def DeletePin(request,userId,boardId,pinId):
    pin = Pin.objects.get(id=pinId)
    user = CustomUser.objects.get(id=userId)
    #is pin owner user?
    board = Board.objects.get(id=boardId)
    PinToBoard.objects.filter(pin=pin,board=board).delete()
    if pin.user == user and not PinToBoard.objects.filter(pin=pin, board__user=user).exists():
        Pin.objects.filter(id=pinId).delete()
    return JsonResponse({'message' : 'Pin removed'},status=200)
    
@csrf_exempt
def Repin(request,userId,pinId):
    if request.method == 'POST':
        count = 0
        data = json.loads(request.body)
        boards = data.get('addToBoards')
        if not boards:
            return Response({"error":"Must Pin to at least one board"},status=401)
        print("CREATE PIN GOT DATA: ",data)
        pin = Pin.objects.get(id=pinId)

        for boardId in boards:
            count+=1
            board = Board.objects.get(id=boardId)
            PinToBoard.objects.create(pin=pin,board=board)
        return JsonResponse({'message': f'Pin added to {count} boards'}, status=200)
    return JsonResponse({'message': 'Invalid request'}, status=400)

def GetStreamPins(request,userId,streamId):
    followStream = FollowStream.objects.get(id=streamId)
    streams = Streams.objects.filter(followStream=followStream)
    user = CustomUser.objects.get(id=userId)

    pin_data = []
    for stream in streams:
        board = stream.board
        boardOwner = CustomUser.objects.get(id=board.user.id)
        pins = board.getPins()
        for pin in pins:
            tags = pin.getTags()
            pin_data.append({
                'pinId':pin.id,
                'pinLiked' : Likes.objects.filter(user=user,pin=pin).exists(),
                'boardOwnerId': boardOwner.id,
                'boardOwnerUsername': boardOwner.username,
                'boardId':board.id,
                'boardName':board.boardName,
                'friendsOnlyComments' : board.friendsOnlyComments,
                'image':pin.imageURL,
                'tags' : tags,
                'ts':pin.ts,
            })
    return JsonResponse({'pinData' : pin_data})