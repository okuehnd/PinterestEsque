from django.contrib.postgres.fields import ArrayField
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.db import models, transaction
from django.contrib.auth.models import AbstractUser
from datetime import timedelta
import random
from django.utils import timezone
from django.db.models import Q,Count,Avg
from django.core import serializers
from typing import List

# Create your models here.
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # You can make this required or optional

    def __str__(self):
        return self.username
    
# class Profile(models.Model):
#     user = models.OneToOneField(CustomUser,on_delete=models.CASCADE)
#     bio = models.textField()
    
class Board(models.Model):
    user = models.ForeignKey(CustomUser,on_delete = models.CASCADE)
    boardName = models.CharField(max_length = 255)
    description = models.TextField()
    friendsOnlyComments = models.BooleanField(default = True)
    ts = models.DateTimeField(auto_now_add=True)

    #create board

    #edit friendsOnlyCommments
    @transaction.atomic
    def switchCommentPermission(self):
        self.friendsOnlyComments = not self.friendsOnlyComments
        self.save()
        return self.friendsOnlyComments

    #edit description??

    #delete board

    #get pins
    @transaction.atomic
    def getPins(self):
        pins = PinToBoard.objects.filter(board=self)
        pin_objects = [p.pin for p in pins]
        return pin_objects
        


    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['user','boardName'], name = 'unique_user_board')
        ]

class Pin(models.Model):
    user = models.ForeignKey(CustomUser,on_delete = models.CASCADE)
    imageURL = models.URLField(max_length = 200)
    webURL = models.URLField(max_length = 200,null=True,blank=True)
    ts = models.DateTimeField(auto_now_add = True)

    #create pin
    @classmethod
    def createPin(cls,userId, iURL,tags: List[str] = [],wURL=None):
        newPin = cls(user=userId,imageURL=iURL,webURL=wURL)
        newPin.save()
        for t in tags:
            new_tag = Tag(pin=newPin,tag=t)
            new_tag.save()
        return newPin
            
    #remove pin

    #get pins in order of ....
    @classmethod
    def getPinSorted(cls,keyword,sortMethod):

        if sortMethod == "time":
            filteredPosts = cls.objects.filter(comment__comment__icontains=keyword).distinct()
            return filteredPosts.order_by('ts')

        if sortMethod == "likes":
            filteredPosts = cls.objects.filter(comment__comment__icontains=keyword).distinct()
            return filteredPosts.annotate(likeCount=Count('likes')).order_by('-likeCount')

        #else sort by relevance
    
    #getTags
    def getTags(self):
        tags = Tag.objects.filter(pin=self)
        tags = [t.tag for t in tags]
        return tags



class Tag(models.Model):
    pin = models.ForeignKey(Pin,on_delete=models.CASCADE)
    tag = models.CharField(max_length = 200)

    #im going to just have that you can only assign tags at pin create
    #no deleting or editing tags

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['pin','tag'], name = 'unique_pin_tag')
        ]

class PinToBoard(models.Model):
    pin = models.ForeignKey(Pin,on_delete = models.CASCADE)
    board = models.ForeignKey(Board,on_delete = models.CASCADE)
    ts = models.DateTimeField(auto_now_add = True)

    #add to board

    #remove from board

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['pin','board'], name = 'unique_pin_board')
        ]

class FollowStream(models.Model):
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    streamName = models.CharField(max_length = 255)
    ts = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['user','streamName'], name = 'unique_user_stream')
        ]

    #create fs

    #remove fs

class Follows(models.Model):
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    board = models.ForeignKey(Board,on_delete=models.CASCADE)

    #follow

    #unfollow

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['user','board'], name = 'unique_follow')
        ]

class Streams(models.Model):
    followStream = models.ForeignKey(FollowStream,on_delete=models.CASCADE)
    board = models.ForeignKey(Board,on_delete=models.CASCADE)

    #add board to fs
    @classmethod
    def addToStream(cls,fid,bid):
        board = Board.objects.get(id=bid)
        followStream = FollowStream.objects.get(id=fid)
        if cls.objects.filter(followStream=followStream,board=board).exists():
            return False
        cls.objects.create(followStream=followStream,board=board)
        return True

    #remove board from fs

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['followStream','board'], name = 'unique_fs_board')
        ]

class Likes(models.Model):
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    pin = models.ForeignKey(Pin,on_delete=models.CASCADE)
    ts = models.DateTimeField(auto_now_add = True)

    #like

    #unlike

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['user','pin'], name = 'unique_like')
        ]

class Comment(models.Model):
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    board = models.ForeignKey(Board,on_delete=models.CASCADE)
    pin = models.ForeignKey(Pin,on_delete=models.CASCADE)
    comment = models.TextField()
    ts = models.DateTimeField(auto_now_add=True)

    #comment
    @classmethod
    def submitComment(cls,uid,bid,pid,comment):
        board = Board.objects.get(id=bid)
        boardOwner = board.user
        commenter = CustomUser.objects.get(id=uid)
        pin = Pin.objects.get(id=pid)

        if not board.friendsOnlyComments or boardOwner==commenter:
            cls.objects.create(user=commenter,board=board,pin=pin,comment=comment)
            return True

        friendship_exists = Friends.objects.filter(Q(user1=boardOwner,user2=commenter)|Q(user1=commenter,user2=boardOwner)).exists()
        if friendship_exists:
            cls.objects.create(user=commenter,board=board,pin=pin,comment=comment)
            return True

        return False
    
    #delete comment

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['user','pin','comment','ts'], name = 'unique_comment_time')
        ]

class Requests(models.Model):
    requester = models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='request_from')
    requestee = models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='request_to')
    ts = models.DateTimeField(auto_now_add=True)

    #request friends

    #accept friend --> delete request
    @transaction.atomic
    def acceptFriend(self):
        new_friendship = Friends(user1=self.requester,user2=self.requestee)
        new_friendship.save()
        self.delete()

    #reject friend --> delete request
    @transaction.atomic
    def rejectFriend(self):
        self.delete()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['requester','requestee'], name = 'unique_request'),
        ]
    
class Friends(models.Model):
    #when you create a new friend ship check that the reverse order does not already exist
    user1 = models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name = 'friend_first')
    user2 = models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='friend_second')
    ts = models.DateTimeField(auto_now_add=True)

    #friend

    #unfriend

    class Meta:
        constraints = [
            models.UniqueConstraint(fields = ['user1','user2'], name = 'unique_friendship'),
        ]

