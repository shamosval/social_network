
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("posts", views.write, name="write"),
    path("posts/<int:post_id>", views.post, name="post"),
    path("posts/<str:folder>/<int:page_num>", views.folder, name="folder"),
    path("users/<int:user_id>", views.poster, name="poster"),
    path('author_posts/<int:author_id>/', views.author_posts, name='author_posts'),
    
]
