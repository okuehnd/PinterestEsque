from .models import Follows,CustomUser,Board,Pin,PinToBoard,Likes,Comment, FollowStream,Likes,Streams,Friends,Requests,Tag
import random
from django.db import connection

def getUser(userId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * " \
                        "FROM backend_customuser " \
                        "WHERE id = %s",[userId])
        row = cursor.fetchone()
        if row is None:
            return None
        columns = [col[0] for col in cursor.description]
        user = dict(zip(columns,row))
    return user

def checkUsernameExists(username):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 " \
                        "FROM backend_customuser " \
                        "WHERE username = %s",[username])
        return cursor.fetchone() is not None

def getBoard(boardId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * " \
                        "FROM backend_board " \
                        "WHERE id = %s",[boardId])
        row = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        board = dict(zip(columns,row))
        return board
    
def getPin(pinId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * " \
                        "FROM backend_pin " \
                        "WHERE id = %s",[pinId])
        row = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        pin = dict(zip(columns,row))
    return pin

def getFollowingBoardsFromUser(userId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT B.*  \
                        FROM backend_board AS B JOIN backend_follows AS F  \
                        ON B.id = F.board_id \
                        WHERE F.user_id = %s",[userId])
        columns = [col[0] for col in cursor.description]
        boards = [dict(zip(columns,row)) for row in cursor.fetchall()]
    return boards

def boardCommentsFriendsOnly(boardId):
    with connection.cursor() as cursor:
        cursor.execute('SELECT friendsonlycomments  \
                        FROM backend_board  \
                        WHERE id = %s',[boardId])
        res = cursor.fetchone()[0]
        return res

def getBoardPins(boardId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT P.*\
                        FROM backend_pin AS P\
                        JOIN backend_pintoboard AS T ON P.id = T.pin_id\
                        JOIN backend_board AS B ON T.board_id = B.id\
                        WHERE B.id = %s \
                        ORDER BY T.ts DESC",[boardId])
        columns = [col[0] for col in cursor.description]
        pins = [dict(zip(columns,row)) for row in cursor.fetchall()]
    return pins

def getBoardOwner(boardId):
    with connection.cursor() as cursor:
        board = getBoard(boardId)
        cursor.execute("SELECT *" \
                        "FROM backend_customuser " \
                        "WHERE id = %s",[board['user_id']])
        row = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        boardOwner = dict(zip(columns,row))
    return boardOwner

def getPinOwner(pinId):
    with connection.cursor() as cursor:
        pin = getPin(pinId)
        cursor.execute("SELECT *" \
                        "FROM backend_customuser " \
                        "WHERE id = %s",[pin['user_id']])
        row = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        boardOwner = dict(zip(columns,row))
    return boardOwner

def isPinLiked(pinId,userId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 \
                        FROM backend_likes  \
                        WHERE user_id = %s AND pin_id = %s",[userId,pinId])
        return cursor.fetchone() is not None
    
def likePin(pinId,userId):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_likes(user_id,pin_id,ts) \
                        VALUES (%s, %s,NOW())",[userId,pinId])

def unlikePin(pinId,userId):
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM backend_likes \
                       WHERE user_id = %s AND pin_id = %s",[userId,pinId])

def getPinLikeCount(pinId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) \
                        FROM backend_pin AS P JOIN backend_likes AS L \
                        ON P.id = L.pin_id \
                        WHERE P.id = %s",[pinId])
        row = cursor.fetchone()
        return row[0] if row else 0

def getPinTags(pinId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT T.tag \
                        FROM backend_tag AS T \
                        WHERE T.pin_id = %s",[pinId])
        
        return cursor.fetchall()

def getUsersBoards(userId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * " \
                        "FROM backend_board " \
                        "WHERE user_id = %s",[userId])
        columns = [col[0] for col in cursor.description]
        boards = [dict(zip(columns,row)) for row in cursor.fetchall()]
    return boards

def createUser(username,email,password):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_customuser(username,email,password) \
                        VALUES (%s, %s,%s)",[username,email,password])

def areFriends(userId1,userId2):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 " \
                        "FROM backend_friends " \
                        "WHERE (user1_id = %s AND user2_id = %s)  \
                        OR (user1_id = %s and user2_id = %s)",[userId1,userId2,userId2,userId1])
        return cursor.fetchone() is not None
    
def isFollowing(userId,boardId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 " \
                        "FROM backend_follows " \
                        "WHERE user_id = %s AND board_id = %s",[userId,boardId])
        return cursor.fetchone() is not None

def getRandomImage(boardId):
    with connection.cursor() as cursor:
        cursor.execute('SELECT P.imageurl \
                       FROM backend_pin as P JOIN backend_pintoboard as B  \
                       ON P.id = B.pin_id \
                       WHERE B.board_id = %s',[boardId])
        images = cursor.fetchall()
        return random.choice(images)

def getPinComments(pinId,boardId=None):
    with connection.cursor() as cursor:
        cursor.execute('SELECT * \
                       FROM backend_comment \
                       WHERE pin_id = %s',[pinId])
        columns = [col[0] for col in cursor.description]
        comments = [dict(zip(columns,row)) for row in cursor.fetchall()]
        return comments

def addComment(pinId,boardId,userId,comment):
    boardOwner = getBoardOwner(boardId)
    if not boardCommentsFriendsOnly(boardId) or areFriends(userId,boardOwner['id']):
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO backend_comment(user_id,board_id,pin_id,comment,ts) \
                            VALUES (%s, %s,%s,%s,NOW())",[userId,boardId,pinId,comment])
        return True
    return False

def toggleFriendsOnlyComments(userId,boardId):
    boardOwner = getBoardOwner(boardId)
    if boardOwner['id'] == userId:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE backend_board \
                            SET friendsOnlyComments =%s\
                           WHERE id = %s",[not boardCommentsFriendsOnly(boardId),boardId])
        return True
    return False

def getFollowStreams(userId):
    with connection.cursor() as cursor:
        cursor.execute('SELECT * \
                       FROM backend_followstream \
                       WHERE user_id = %s',[userId])
        columns = [col[0] for col in cursor.description]
        streams = [dict(zip(columns,row)) for row in cursor.fetchall()]
        return streams

def getStreamBoards(sid):
    with connection.cursor() as cursor:
        cursor.execute('SELECT * \
                       FROM backend_streams AS S JOIN backend_board AS B  \
                       ON S.board_id = B.id\
                       WHERE S.followstream_id = %s',[sid])
        columns = [col[0] for col in cursor.description]
        boards = [dict(zip(columns,row)) for row in cursor.fetchall()]
        return boards
    
def addBoardToFollowStream(boardId,streamId):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_streams(followstream_id,board_id) \
                        VALUES (%s, %s)",[streamId,boardId])
    return True

def followBoard(userId,boardId):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_follows(user_id,board_id) \
                        VALUES (%s, %s)",[userId,boardId])
        return True
    
def userFollowsBoard(userId,boardId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 \
                        FROM backend_follows  \
                        WHERE user_id = %s AND board_id = %s",[userId,boardId])
        return cursor.fetchone() is not None
    
def unfollowBoard(userId,boardId):
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM backend_follows \
                       WHERE user_id = %s AND board_id = %s",[userId,boardId])

def getFriends(userId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * " \
                        "FROM backend_friends " \
                        "WHERE user1_id = %s   \
                        OR user2_id = %s",[userId,userId])
        columns = [col[0] for col in cursor.description]
        friends = [dict(zip(columns,row)) for row in cursor.fetchall()]
        return friends 

def getFriendRequests(userId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * " \
                        "FROM backend_requests " \
                        "WHERE requestee_id = %s",[userId])
        columns = [col[0] for col in cursor.description]
        requests = [dict(zip(columns,row)) for row in cursor.fetchall()]
        return requests 
    
def addFriend(userId,friendId):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_friends(user1_id,user2_id,ts) \
                        VALUES (%s, %s,NOW())",[userId,friendId])

def removeFriend(userId,friendId):
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM backend_friends \
                       WHERE (user1_id = %s AND user2_id = %s)  \
                       OR (user1_id = %s AND user2_id = %s)",[userId,friendId,friendId,userId])

def acceptFriendRequest(requestId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * " \
                        "FROM backend_requests " \
                        "WHERE id = %s",[requestId])
        row = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        request = dict(zip(columns,row))
        requester = request['requester_id']
        requestee = request['requestee_id']

        addFriend(requester,requestee)
        cursor.execute("DELETE FROM backend_requests \
                       WHERE id = %s",[requestId])

def friendRequestExists(userId,friendId):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * \
                        FROM backend_requests  \
                        WHERE (requester_id = %s AND requestee_id = %s) \
                        OR (requester_id = %s AND requestee_id = %s)",[userId,friendId,friendId,userId])
        row = cursor.fetchone()
        if not row:
            return None
        columns = [col[0] for col in cursor.description]
        request = dict(zip(columns,row))
    return request

def createFriendRequest(userId,friendId):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_requests(requester_id,requestee_id,ts) \
                        VALUES (%s, %s,NOW())",[userId,friendId])

def rejectFriendRequest(requestId):
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM backend_requests \
                       WHERE id = %s",[requestId])

def deleteFollowStream(streamId):
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM backend_followstream \
                       WHERE id = %s",[streamId])

def deleteBoard(boardId):
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM backend_board \
                       WHERE id = %s",[boardId])

def createFollowStream(userId,boardId,streamname):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 \
                        FROM backend_followstream  \
                        WHERE user_id = %s AND streamname = %s",[userId,streamname])
        
        if cursor.fetchone() is not None:
            return None

        cursor.execute("INSERT INTO backend_followstream(user_id,streamname,ts) \
                        VALUES (%s, %s,NOW()) \
                        RETURNING id",[userId,streamname])
        streamId = cursor.fetchone()[0]
        print("⭐:",streamId)
        addBoardToFollowStream(boardId,streamId)
        return streamId

def addTag(pinId,tag):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_tag(pin_id,tag) \
                        VALUES (%s, %s)",[pinId,tag])

def createPin(userId,imageUrl,tags):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_pin(user_id,imageurl,ts) \
                        VALUES (%s, %s,NOW())\
                       RETURNING id",[userId,imageUrl])
        pinId = cursor.fetchone()[0]
        for tag in tags:
            addTag(pinId,tag)
        return pinId
    
def boardExists(userId,boardname):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 \
                        FROM backend_board \
                        WHERE user_id = %s AND boardname = %s",[userId,boardname])
        if cursor.fetchone() is not None:
            return True
        return False

def createBoard(userId,boardname,description):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_board(user_id,boardname,description,friendsonlycomments,ts) \
                            VALUES (%s,%s, %s,%s,NOW())\
                        RETURNING id",[userId,boardname,description,True])
        boardId = cursor.fetchone()[0]
        return boardId

def pinToBoard(pinId,boardId):
    with connection.cursor() as cursor:
        cursor.execute("INSERT INTO backend_pintoboard(pin_id,board_id,ts) \
                        VALUES (%s, %s,NOW())",[pinId,boardId])

def deletePin(userId,boardId,pinId):
    pinOwner = getPinOwner(pinId) #get pin owner
    pinOwnerId = pinOwner['id']
    print("IS BOARD OWNER CURRENT USER? :", pinOwnerId == userId)
    if pinOwnerId != userId:
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM backend_pintoboard \
                            WHERE board_id = %s AND pin_id = %s",[boardId,pinId])
    else:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*)\
                        FROM backend_pintoboard AS P JOIN backend_board AS B \
                        ON P.board_id = B.id \
                        WHERE B.user_id = %s AND P.pin_id =%s",[pinOwnerId,pinId])
            count = cursor.fetchone()[0]
            if count == 1:
                cursor.execute("DELETE FROM backend_pin \
                                WHERE id = %s",[pinId])
            else:
                cursor.execute("DELETE FROM backend_pintoboard \
                                WHERE board_id = %s AND pin_id = %s",[boardId,pinId])

def getKeywordSortedPins(keyword,sortMethod):
    keyword_pattern = f"%{keyword}%"
    if sortMethod == 'time':
        if keyword != "":
            with connection.cursor() as cursor:
                cursor.execute("SELECT DISTINCT P.*  \
                                FROM backend_pin AS P JOIN backend_tag AS T \
                                ON P.id = T.pin_id \
                                WHERE T.tag ILIKE %s \
                                ORDER BY P.ts DESC",[keyword_pattern])
                columns = [col[0] for col in cursor.description]
                pins = [dict(zip(columns,row)) for row in cursor.fetchall()]
                return pins 
        else:
            with connection.cursor() as cursor:
                cursor.execute("SELECT DISTINCT P.*  \
                                FROM backend_pin AS P \
                                ORDER BY P.ts DESC")
                columns = [col[0] for col in cursor.description]
                pins = [dict(zip(columns,row)) for row in cursor.fetchall()]
                return pins
    else:
        if keyword != "":
            with connection.cursor() as cursor:
                cursor.execute("SELECT P.*, COUNT(L.id) AS like_count \
                                FROM backend_pin AS P JOIN backend_tag AS T ON P.id = T.pin_id \
                                LEFT JOIN backend_likes AS L \
                                ON P.id = L.pin_id \
                                WHERE T.tag ILIKE %s \
                                GROUP BY P.id  \
                                ORDER BY like_count DESC",[keyword_pattern])
                columns = [col[0] for col in cursor.description]
                pins = [dict(zip(columns,row)) for row in cursor.fetchall()]
                return pins 
        else:
            with connection.cursor() as cursor:
                cursor.execute("SELECT P.*, COUNT(L.id) AS like_count \
                                FROM backend_pin AS P LEFT JOIN backend_likes AS L \
                                ON P.id = L.pin_id \
                                GROUP BY P.id  \
                                ORDER BY like_count DESC")
                columns = [col[0] for col in cursor.description]
                pins = [dict(zip(columns,row)) for row in cursor.fetchall()]
                return pins 
        
def getRepins(pinId):
    with connection.cursor() as cursor:
            cursor.execute("SELECT *  \
                            FROM backend_pintoboard \
                            WHERE pin_id = %s ",[pinId])
            columns = [col[0] for col in cursor.description]
            repins = [dict(zip(columns,row)) for row in cursor.fetchall()]
            return repins 
    
def removeBoardFromStream(streamId,boardId):
    with connection.cursor() as cursor:
            cursor.execute("DELETE FROM backend_streams \
                            WHERE board_id = %s AND followstream_id = %s",[boardId,streamId])
            
def checkConstraints():
    with connection.cursor() as cursor:
        cursor.execute("SELECT conname, confdeltype \
                        FROM pg_constraint \
                        WHERE contype = 'f'")
        columns = [col[0] for col in cursor.description]
        res = [dict(zip(columns,row)) for row in cursor.fetchall()]
        # print("🌟PRINTED RES:",res)