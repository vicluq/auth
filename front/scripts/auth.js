const loginForm = document.forms.loginForm;
const signupForm = document.forms.signupForm;
const logoutBtn = document.getElementById('logoutButton');

function login(e) {
  e.preventDefault();

  const formData = new FormData(loginForm);

  const loginData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  let redirectURL = '/login';

  fetch("http://localhost:8080/login", {
    method: "POST",
    headers: {
      // LEMBRAR DE SETAR O HEADER
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
    .then(res => {
      redirectURL = res.headers.get('Location');
      return res.json()
    })
    .then((data) => {

      if (!data.empty) {
        window.location = redirectURL;
      }

      document.getElementById("loginError").innerHTML = data.message;
    })
    .catch((err) => {
      console.log(err);
    });
}

function logout(e) {
  fetch("/logout", { method: "POST", })
    .then(res => { window.location = res.url })
    .catch(err => console.log(err));
}

function signup(e) {
  e.preventDefault();
  const newUserData = new FormData(signupForm);

  const userData = {
    email: newUserData.get('email'),
    name: newUserData.get('name'),
    password: newUserData.get('password'),
  }

  let redirectURL = '';

  fetch("/signup", {
    method: "POST",
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then(res => {
      redirectURL = res.headers.get('Location');
      return res.json();
    })
    .then(data => {
      if (!data.error) {
        window.location = redirectURL;
      }
    })
    .catch(err => {
      console.log(err); ß
    })
}

if (loginForm)
  loginForm.addEventListener("submit", login);
if (logoutBtn)
  logoutBtn.addEventListener("click", logout);
if (signupForm)
  signupForm.addEventListener("submit", signup);