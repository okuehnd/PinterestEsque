from django.urls import path
from . import views
from .views import RegisterView, LoginView, UserProfileView#,GetFollowingPins,GetBoards,GetBoardPins,LikePin,RemoveLike, GetPinComments

urlpatterns = [
    path('api/register/', RegisterView.as_view()),
    path('api/login/', LoginView.as_view()),
    path('api/profile/', UserProfileView.as_view()),
    path('api/following/<int:userId>',views.GetFollowingPins, name = "GetFollowingPins" ),
    path('api/Boards/<int:userId>/<int:boardOwnerId>',views.GetBoards, name = "GetBoards" ),
    path('api/BoardPins/<int:boardId>/<int:userId>',views.GetBoardPins, name = "GetBoadPins" ),
    path('api/LikePin/<int:userId>/<int:pinId>',views.LikePin, name = "LikePin" ),
    path('api/UnlikePin/<int:userId>/<int:pinId>',views.RemoveLike, name = "UnlikePin" ),
    path('api/GetPinComments/<int:pinId>',views.GetPinComments, name = "GetPinComments" ),
    path('api/AddComment/<int:userId>/<int:boardId>/<int:pinId>',views.AddNewComment, name = "AddComment" ),
    path('api/ToggleFriendsOnlySetting/<int:userId>/<int:boardId>',views.ToggleFriendsOnlySetting, name = "ToggleFriendsComments"),
    path('api/GetFollowStreams/<int:userId>', views.GetFollowStreams, name = "GetFollowStreams"),
    path('api/AddBoardToFollowStream/<int:userId>/<int:boardId>',views.AddBoardToFollowStream, name="AddBoardToFollowStream"),
    path('api/GetProfileData/<int:userId>',views.GetProfileData,name="GetProfileData"),
    path('api/Unfriend/<int:userId>/<int:friendId>',views.Unfriend,name="Unfriend"),
    path('api/AcceptFriendRequest/<int:requestId>',views.AcceptFriendRequest, name="AcceptFriendRequest"),
    path('api/RejectFriendRequest/<int:requestId>',views.RejectFriendRequest,name="RejectFriendRequest"),
    path('api/DeleteFollowStream/<int:streamId>',views.DeleteFollowStream,name="DeleteFollowStream"),
    path('api/DeleteBoard/<int:boardId>',views.DeleteBoard,name="DeleteBoard"),
    path('api/CreateFollowStream/<int:userId>/<int:boardId>',views.CreateNewStream,name="CreateNewStream"),
    path('api/FriendRequest/<int:userId>/<int:friendId>',views.NewFriendRequest,name="FriendRequest"),
    path('api/CreatePin/<int:userId>',views.CreatePin,name="CreatePin"),
    path('api/CreateBoard/<int:userId>',views.CreateBoard,name="CreateBoard"),
    path('api/DeletePin/<int:userId>/<int:boardId>/<int:pinId>',views.DeletePin,name="DeletePin"),
    path('api/Repin/<int:userId>/<int:pinId>',views.Repin,name="Repin"),
    path('api/GetStreamPins/<int:userId>/<int:streamId>',views.GetStreamPins,name="StreamPins"),
    path('api/SearchPins/<int:userId>',views.SearchPins,name="SearchPins"),
    path('api/GetStreamBoards/<int:streamId>',views.GetStreamBoards,name="GetStreamBoards"),
    path('api/RemoveBoardFromStream/<int:streamId>/<int:boardId>',views.RemoveBoardFromStream,name="RemoveBoardFromStream"),

]
