import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator



from .models import *


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def write(request):

    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of post
    data = json.loads(request.body)
    body = data.get("body", "")

    # Create the post
    post = Post(
            author=request.user,
            body=body,
        )
    post.save()
    return JsonResponse({"message": "Post sent successfully."}, status=201)


def paginate(posts, page_num):
    # do pagination
    p = Paginator(posts, per_page=10)  

    page_obj = p.get_page(page_num) 
    
    
    serialized_posts = [post.serialize() for post in page_obj]

    # make object for json file
    response_data = {
        'current_page': page_obj.number,
        'num_pages': p.num_pages,
        'posts': serialized_posts,
    }

    return JsonResponse(response_data)


def folder(request, folder, page_num):

    if request.user.is_authenticated:

        # Filter content returned based on folder
        if folder == "home":

            posts = Post.objects.filter(
                active=True
            )

        elif folder == "following":
            posts = Post.objects.filter(
                active=True, author__in=request.user.user_followers.all() 
            )

        else:
            return JsonResponse({"error": "Invalid folder."}, status=400)

        
        posts = posts.order_by("-timestamp").all() 

        return paginate(posts, page_num)
        


       
    
    else: 

        if folder == "home":
            posts = Post.objects.filter(
                active=True
            )
        
        
        posts = posts.order_by("-timestamp").all()  


        return paginate(posts, page_num)

        


@csrf_exempt
@login_required
def post(request, post_id):

    post = Post.objects.get(pk=post_id)
    

    if request.method == "PUT":
        data = json.loads(request.body)

        # Edit the post (user must be the post's author)
        if request.user == post.author:
            if "body" in data:
                post.body = data["body"]
            
            if "liked_by" in data:
                user_liked = data["liked_by"]
                if user_liked:
                    post.liked_by.add(request.user)
                else:
                    post.liked_by.remove(request.user)
            post.save()
            json_data = post.serialize()
            return JsonResponse(json_data)

        # Like or unlike the post
        if "liked_by" in data:

            user_liked = data["liked_by"]
            if user_liked:
                post.liked_by.add(request.user)
            else:
                post.liked_by.remove(request.user)
            post.save()
            json_data = post.serialize()
            return JsonResponse(json_data)

    
    # transform data to json
    json_data = post.serialize()
    return JsonResponse(json_data)



@csrf_exempt
def poster(request, user_id):

    poster = User.objects.get(pk=user_id)

    if request.method == "POST":
        data = json.loads(request.body)
        # Update the fields of the poster based on the data received
        poster.username = data.get("username", poster.username)
        poster.email = data.get("email", poster.email)
        poster.first_name = data.get("name", poster.first_name)
        poster.last_name = data.get("surname", poster.last_name)
        # Save the updated poster
        poster.save()
        return JsonResponse({"message": "User updated successfully."})

    elif request.method == "PUT":
        data = json.loads(request.body)
        
        # Update the fields of the poster based on the data received
        

        new_follower = data["followers"]
        if new_follower:
            poster.followers.add(request.user)
            request.user.following.add(poster)
        else:
            poster.followers.remove(request.user)
            request.user.following.remove(poster)
        

        poster.save()
        return JsonResponse({"message": "User followed successfully."})

    # transform data to json
    json_data = poster.serialize()
    return JsonResponse(json_data)


def author_posts(request, author_id):
    try:

        author = User.objects.get(pk=author_id)
        posts = Post.objects.filter(active=True, author=author)
        posts = posts.order_by("-timestamp").all()

        

        return paginate(posts, 1)

    except User.DoesNotExist:
        return JsonResponse({"error": "Author not found."}, status=404)


