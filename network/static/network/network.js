document.addEventListener('DOMContentLoaded', function() {
  
  // Set event listeners for menu items, buttons
  load_folder('home', 1)
  document.querySelector('#home').addEventListener('click', () => load_folder('home', 1));  
  document.querySelector('#following')?.addEventListener('click', () => load_folder('following', 1));  
  document.querySelector('#poster')?.addEventListener('click', (event) => {
    const user_id = event.target.value;
    load_user(user_id);
  });
  document.querySelector('#new_post')?.addEventListener('submit', submit_post);
  
  //Toggle button that loads a tooltip element to log out button
  const button = document.getElementById('log_out_btn');
  const tooltip = document.getElementById('tooltip');

  if (button && tooltip) {
    button.addEventListener('click', (event) => {
      const buttonRect = event.target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      //Place the tooltip above the button
      const tooltipTop = buttonRect.top - tooltipRect.height - 50;
      const tooltipLeft = buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2);

      tooltip.style.top = tooltipTop + 'px';
      tooltip.style.left = tooltipLeft + 'px';

      tooltip.classList.toggle('hidden');
    });
  }

  //Make textarea grow vertically as more stuff is typed in

  const textarea = document.getElementById('post_body');

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto'; 
    textarea.style.height = `${textarea.scrollHeight}px`; 
  });
  

});


function submit_post(event) {
  // Prevent reload of page
  event.preventDefault();
   
  // Get the form input values
  const body = document.querySelector('#post_body').value.trim();

  // Check if the post body is empty
  if (body === '') {
    return;
  };
  

  // Post to API if post is not empty
  fetch('/posts', {
    method: 'POST',
    body: JSON.stringify({
      body: body,
      
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      document.querySelector('#post_body').value = '';
      load_folder('home', 1);
  });
}


function load_folder(folder, page_num){

  //Clear the posts_view div
  document.querySelector('#posts_view').innerHTML = '';

  //Hide edit user form, if open
  document.getElementById('edit_user_info')?.classList.remove('show');
  
  //Shows post container if it is loaded
  new_post_container = document.getElementById('new_post_container');
  if (new_post_container) {
    new_post_container.style.display = 'flex';
  }

  //Fetch the posts
  fetch(`/posts/${folder}/${page_num}`)
  .then(response => response.json())
  .then(result => {
      
    load_posts(result, folder)
  });
  
}


function load_user(user_id) {
  // Set visibility of corresponding elements
  document.querySelector('#user_info').innerHTML = '';
  document.querySelector('#posts_view').style.display = 'none';
  document.querySelector('#title').innerHTML = '';
  document.querySelector('#title').innerHTML = 'Profile';
  document.querySelector('#home')?.classList.remove('active_custom');
  document.querySelector('#following')?.classList.remove('active_custom');
  document.querySelector('#poster')?.classList.add('active_custom');
  
  //Shows post container if it is loaded
 new_post_container = document.getElementById('new_post_container');
  if (new_post_container) {
    new_post_container.style.display = 'none';
  }


  //Fetch json data about user
  fetch(`/users/${user_id}`)
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);

      const username = result.username;
      const email = result.email;
      const name = result.name;
      const surname = result.surname;
      const followers = result.follower_ids;
      const num_followers = followers.length;
      const following = result.following_ids;
      const num_following = following.length;

      

      // Create div to display data about user
      const element = document.createElement('div');
      document.querySelector('#user_info').innerHTML = '';
      element.classList.add('m-0');
      element.classList.add('p-0');
      element.style.position = 'relative';

      element.innerHTML = `
      <div style="height: 120px; border-bottom: 1px solid lightgrey; display: flex; justify-content: center; align-items: center;  max-width: 100%;" class="m-0 p-0">
        <img src=/static/network/back.png style="max-width: 200%; max-height: 200%; overflow: hidden;">
      </div>
    
        <span id='user_view_image'><i style="font-size: 6rem; color: #543077" class="bi bi-person-circle"></i></span>

      <div class="d-flex justify-content-between align-items-start">
        <div>
          <p style="margin-top: 65px;" class="ms-4">
            <span class="fw-semibold fs-5" style="color: #543077">${name} ${surname}</span>
            <br>
            <span class="fw-lighter" style="color: #543077">@${username}</span>
            <br>
            <br>
            <small><i class="bi bi-calendar2-week pe-3"></i>Joined July 2023</small>
            <br>
            <small><i class="bi bi-envelope pe-3"></i>${email} </small>
            <br>
            <small><i class="bi bi-person-vcard pe-3"></i>${name} has ${num_followers} follower(s).</small>
            <br>
            <small><i class="bi bi-person-workspace pe-3"></i>${name} follows ${num_following} account(s).</small>
          </p>
        </div>
        
        <div>
          <div style="margin-top: 95px;" class="me-4 d-flex flex-column" id="user_view_btns">
            <button id='see_users_posts' value='${user_id}'>User's posts</button>
            
          </div>
        </div>
      </div>
      `;



      //Get the id of the logged in user from Django template html
      const logged_user_id = logged_user;
      console.log(logged_user_id);

      document.querySelector('#user_info').append(element);
      document.querySelector('#user_info').style.display = 'block';
      document.querySelector('#user_info').classList.add('p-0');
      document.querySelector('#title').innerHTML = 'Profile';



      //Create edit user button
      if (user_id === logged_user_id) {
        const btn_edit_user = document.createElement('button');
        
        btn_edit_user.addEventListener('click', (event) => {
          const user_id = event.target.value;
          edit_user(user_id);
        });

        btn_edit_user.id = 'update_user';
        btn_edit_user.value = `${user_id}`;
        btn_edit_user.innerHTML = 'Edit user';



        user_view_btns = document.getElementById('user_view_btns');
        if (user_view_btns){
          user_view_btns.append(btn_edit_user);  
        }
      }


      //Implement the follow/unfollow user button
      if (logged_user_id !== 'None') {
        if (user_id !== logged_user_id) {
          const btn_follow_user = document.createElement('button');
          btn_follow_user.id = 'follow_user';
          btn_follow_user.value = `${user_id}`;
          
          const loggedUserID = parseInt(logged_user_id);
          
          // Check if the logged user is already in the user's followers list
          const isFollowed = followers.includes(loggedUserID);
          console.log(isFollowed);
          
          if (isFollowed) {
            btn_follow_user.innerHTML = 'Unfollow user';
            btn_follow_user.addEventListener('click', (event) => {
              const user_id = event.target.value;
              unfollow_user(user_id);
              setTimeout(() => {
                  load_user(user_id);
                }, 100);
              
            });
          } else {
            btn_follow_user.innerHTML = 'Follow user';
            btn_follow_user.addEventListener('click', (event) => {
              const user_id = event.target.value;
              follow_user(user_id);

              setTimeout(() => {
                  load_user(user_id);
                }, 100);
            });
          }
          
          user_view_btns = document.getElementById('user_view_btns');
          if (user_view_btns){
            user_view_btns.append(btn_follow_user);  
          }

        }
      }
      
      //Load user's posts
      document.getElementById('see_users_posts').addEventListener('click', (event) => {
        const user_id = event.target.value;
        user_posts(user_id);
      });
    });
}


function edit_user(user_id) {

  //Show corresponding div and get data for it
  const edit_user_form = document.getElementById('edit_user_form');
  const edit_user_info = document.getElementById('edit_user_info');
  edit_user_info.classList.add('show');

  const btn_dismiss = document.getElementById('dismiss_edit_user');
  btn_dismiss.addEventListener('click', (event) => {
      event.preventDefault();
      edit_user_info.classList.remove('show');
    });


  fetch(`/users/${user_id}`)
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);

      const username = result.username;
      const email = result.email;
      const name = result.name;
      const surname = result.surname;

      // Populate the form fields with user's info
      document.getElementById('user_username').value = username;
      document.getElementById('user_email').value = email;
      document.getElementById('user_name').value = name;
      document.getElementById('user_surname').value = surname;

      edit_user_form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get the form input values
        const username = document.getElementById('user_username').value;
        const email = document.getElementById('user_email').value;
        const name = document.getElementById('user_name').value;
        const surname = document.getElementById('user_surname').value;

        // Create an object with the form data
        const data = {
          username: username,
          email: email,
          name: name,
          surname: surname
        };

        fetch(`/users/${user_id}`, {
          method: 'POST',
          body: JSON.stringify(data)
        })
          .then(() => {
            document.querySelector('#user_info').innerHTML = '';
          load_user(user_id);

          edit_user_info.classList.remove('show');
        })
      });
    });
}


function load_posts(result, folder) {
  //Hide edit user form, if open
  document.getElementById('edit_user_info')?.classList.remove('show');

  //Set menu button's active status
  
  document.querySelector('#title').innerHTML = '';
  if (folder === 'home') {
    document.querySelector('#title').innerHTML = 'Home'; 
    document.querySelector('#home')?.classList.add('active_custom');
    document.querySelector('#following')?.classList.remove('active_custom');
    document.querySelector('#poster')?.classList.remove('active_custom');
  } else if (folder === 'following') {
    document.querySelector('#title').innerHTML = 'Following';
    document.querySelector('#home')?.classList.remove('active_custom');
    document.querySelector('#following')?.classList.add('active_custom');
    document.querySelector('#poster')?.classList.remove('active_custom');
  }

  
  // Do the pagination
  paginator_container = document.createElement('nav');
  paginator_container.classList.add('paginator_nav');
  paginator = document.createElement('ul');

  paginator.classList.add('d-flex');

  paginator.style.listStyle = 'none';
  current_page = result.current_page;
  num_pages = result.num_pages;

  paginator_container.innerHTML = '';

  // Add page links
  for (let i = 1; i <= num_pages; i++) {
    const page_link = document.createElement('li');

    page_link.classList.add('page-item');

    const page_button = document.createElement('button');
      page_button.classList.add('page-link');
      page_button.textContent = i;

      page_button.addEventListener('click', (event) => {
        event.preventDefault();
        load_folder(folder, i);
      });

    // Add active class
    if (i === current_page) {
      page_link.classList.add('active_custom_pagination');
    }

    page_link.append(page_button);
    paginator.append(page_link)
    
  }

  paginator_container.append(paginator);


  // Load posts
  result.posts.forEach((item) => {

    const author = item.author;
    const body = item.body;
    const username = item.author.username;
    const numLikes = item.liked_by.length;
    const timestamp = item.timestamp;


    const element = document.createElement('div');

    // Create button to load info about user
    const btn_load_user = document.createElement('span');

    btn_load_user.innerHTML = `
    <span class="ms-4 me-2">
      <i class="hover_custom bi bi-person-circle fs-3 post_color"></i>
      <span class="ps-3 hover_custom fw-semibold">${author} ${item.surname}</span>
      <span class="hover_custom fw-lighter">@${item.username}</span>
    </span>
    `;
    

    btn_load_user.addEventListener('click', (event) => {
      const user_id = `${item.author_id}`;
      load_user(user_id);
    });

    // Create HTML for the post container
    element.innerHTML = `
      <span>&#8226;</span>
      <span class="ms-2 fw-lighter">${timestamp}</span>

      <p class="ms-5 ps-4">${body}  </p>

    `;


    element.style.padding = '5px';
    element.style.borderTop = '1px solid lightgrey';
    element.classList.add('single_post');
    element.id = `${item.id}`;

    element.prepend(btn_load_user);

    
    // Create like/unlike button

    const logged_user_id = logged_user;

    if (logged_user_id !== 'None') {
      const btn_like_post = document.createElement('button');
      btn_like_post.classList.add('like_btn');


      const loggedUserID = parseInt(logged_user_id);

      // Check if logged user already liked the post
      isLiked = item.liked_by.includes(loggedUserID);

      if (isLiked) {
        btn_like_post.innerHTML = `<i class="bi bi-heart-fill hover_custom pe-2 ms-3 ps-5"></i>`;
        btn_like_post.addEventListener('click', (event) => {
          const post_id = `${item.id}`;
          unlike_post(post_id);
          console.log(post_id, current_page);
          setTimeout(() => {
            load_folder('home', current_page);
          }, 100);
          
        });
      } else {
        btn_like_post.innerHTML = `<i class="bi bi-heart hover_custom pe-2 ms-3 ps-5"></i>`;
        btn_like_post.addEventListener('click', (event) => {
          const post_id = `${item.id}`;
          like_post(post_id);
          
          setTimeout(() => {
            load_folder('home', current_page);
          }, 100);
          
        });
      }

      element.append(btn_like_post);
    } else {

      const btn_like_post = document.createElement('button');
      btn_like_post.classList.add('like_btn');
      btn_like_post.innerHTML = `<i class="bi bi-heart  pe-2 ms-3 ps-5"></i>`;
      element.append(btn_like_post);

    }

    element.append(numLikes);

    const random_icons = document.createElement('span');

    random_icons.innerHTML = `
    <i class="bi bi-chat pe-2 ms-2 ps-3  random_icons"></i>
    <i class="bi bi-upload pe-2 ms-2 ps-3 random_icons"></i>

    `;


    element.append(random_icons);    



    // Create edit post button

    const loggedUserID = parseInt(logged_user_id);
    if (loggedUserID === item.author_id) {
      const btn_edit_post = document.createElement('button');
      btn_edit_post.value = `${item.id}`;
      btn_edit_post.classList.add('like_btn');
      btn_edit_post.innerHTML = `<i class="bi bi-pencil-square random_icons px-3"></i>`;
      btn_edit_post.addEventListener('click', (event) => {
        const post_id = `${item.id}`;
        edit_post(post_id, current_page);
      });
      element.append(btn_edit_post);
    }

    document.querySelector('#posts_view').append(element, paginator_container);
    document.querySelector('#posts_view').style.display = 'block';
  });
  
  document.querySelector('#user_info').style.display = 'none';
}



function user_posts(user_id) {
  //Hide edit user form, if open
  document.getElementById('edit_user_info')?.classList.remove('show');

  document.querySelector('#posts_view').innerHTML = '';

  //Get the posts and load them
  fetch(`/author_posts/${user_id}/`)
  .then(response => response.json())
  .then(result => {
     load_posts(result);
     document.querySelector('#user_info').style.display = 'block';
     document.querySelector('#title').innerHTML = "User's posts";
   });
}


function follow_user(user_id) {
    
  //Update corresponding user's model data

  const logged_user_id = logged_user;
  
  fetch(`/users/${user_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      followers: true
    })
  })
}


function unfollow_user(user_id) {
  
  //Update corresponding user's model data

  const logged_user_id = logged_user;
  
  fetch(`/users/${user_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      followers: false
    })
  })
}


function like_post(post_id) {
  
  //Update corresponding posts's model data
  fetch(`/posts/${post_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          liked_by: true
        })
      })
}


function unlike_post(post_id) {
  
  //Update corresponding posts's model data

  fetch(`/posts/${post_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          liked_by: false
        })
      })
}


function edit_post(post_id, current_page) {
 
  //Show corresponding modal div to update the data, prepopulate it with post text
  

  const edit_post = document.getElementById('edit_post');
  edit_post.innerHTML = '';
  edit_post.classList.add('show');

  

  fetch(`/posts/${post_id}`)
  .then(response => response.json())
  .then(result => {
    console.log(result);
    const body = result.body;

    edit_post_form = document.createElement('form');
    edit_post_title = document.createElement('h4');
    edit_post_title.innerHTML = 'Edit post';
    edit_textarea = document.createElement('textarea');

    edit_textarea.value = body;
    edit_textarea.id = 'edit_textarea';
    edit_textarea.classList.add('fs-5');


    edit_submit = document.createElement('input');
    edit_submit.type = 'submit';
    edit_submit.value = 'Save!';
    edit_submit.classList.add('m-3');
    edit_submit.classList.add('btn');
    edit_submit.classList.add('btn-secondary');
    edit_submit.classList.add('round_custom');
    

    btn_dismiss = document.createElement('button');
    btn_dismiss.innerHTML = 'Dismiss';
    btn_dismiss.classList.add('m-3');
    btn_dismiss.classList.add('btn');
    btn_dismiss.classList.add('btn-secondary');
    btn_dismiss.classList.add('round_custom');


    btn_dismiss.addEventListener('click', (event) => {
      event.preventDefault();
      edit_post.classList.remove('show');
    });

    edit_post_form.append (edit_post_title, edit_textarea, edit_submit, btn_dismiss);

    edit_post.append(edit_post_form);


    //Send updated data to API
    
    edit_post_form.addEventListener('submit', (event) => {
      event.preventDefault();

      const body = edit_textarea.value;
      const data = {
        body: body,
      };

      fetch(`/posts/${post_id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      .then(() =>{
        document.querySelector('#posts_view').innerHTML = '';
        
        edit_post.classList.remove('show');
        edit_post.innerHTML = '';
        load_folder('home', current_page);
      })
    })
  })  
}
