function validateAndRegister() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
      alert('Please fill in all the fields before submitting.');
    } else {
      // If all fields are filled, proceed with registration logic (e.g., register() function)
      register();
    }
  }

  function register() {
    var data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    }
    var xh = new XMLHttpRequest();
    // Update the URL to your backend API for registration
    xh.open("POST", "http://localhost:8800/user/signup", true); // URL to your signup route
    xh.setRequestHeader('Content-Type', 'application/json');
    xh.send(JSON.stringify(data));
    xh.onload = function () {
        if (this.status == 200) {
            alert('Registered successfully! Login to continue');
            window.location.replace('login.html');
        }
        else {
            alert('Failed! Try again');
            window.location.replace('signup.html');
        }
    }
}


function login() {
    var data = {
        "email": document.getElementById('email').value,
        "password": document.getElementById('password').value
    }
    var xh = new XMLHttpRequest();
    // Update the URL to your backend API for login
    xh.open("POST", "http://localhost:8800/user/login", true); // URL to your login route
    xh.setRequestHeader('Content-Type', 'application/json');
    xh.send(JSON.stringify(data));
    xh.onload = function () {
        if (this.status == 200) {
            var data = JSON.parse(this.responseText);
            
            // Store the JWT token and user details in localStorage
            localStorage.setItem("JWT_Token", "JWT " + data.token);
            localStorage.setItem("userId", data.userDetails.name);
            window.location.replace('selection.html');
        }
        else {
            alert('Invalid login credentials');
            window.location.replace('login.html');
        }
    }
}


function getuser() {
    var jwt = localStorage.getItem('JWT_Token')
    const name= localStorage.getItem('userId')
    var xh = new XMLHttpRequest();
    xh.open("GET", "http://localhost:8800/user/login", true)
    xh.setRequestHeader('Content-Type', 'application/json')
    xh.setRequestHeader('Authorization', jwt)
    xh.send()
    xh.onload = function () {
        if (this.status == 200) {
         
                $('#useritem').append(` <p>Logged In as:</p><p><b>${name}</b></p>`)
       
        }
        else if(this.status==400){
            alert('Error in getting items')
        }
        else if(this.status==401){
            alert('Please authenticate user')
        }
    }

}

