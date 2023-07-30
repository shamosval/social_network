from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("self", symmetrical=False, related_name="user_followers")
    following = models.ManyToManyField("self", symmetrical=False, related_name="user_following")
    def serialize(self):
        follower_ids = self.followers.values_list("id", flat=True)
        following_ids = self.following.values_list("id", flat=True)
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "name": self.first_name,
            "surname": self.last_name,
            "follower_ids": list(follower_ids),
            "following_ids": list(following_ids),


        }
    

class Post(models.Model):
    
    author = models.ForeignKey("User", on_delete=models.PROTECT, related_name="author_posts")
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField(User, related_name="likes", blank=True)
    active = models.BooleanField(default=True)
    

    def serialize(self):

        liked_by_users = [user.id for user in self.liked_by.all()] if self.liked_by else []

        return {
            "id": self.id,
            "author": self.author.first_name,
            "author_id": self.author.id,
            "username": self.author.username,
            "surname": self.author.last_name,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "liked_by": liked_by_users,
            "active": self.active
        }