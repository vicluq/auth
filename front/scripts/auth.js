const loginForm = document.forms.loginForm;
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
      console.log(data);
      window.location = redirectURL;
    })
    .catch((e) => console.log(e));
}

function logout(e) {
  fetch("/logout", { method: "POST" })
    .then(res => { window.location = res.url })
    .catch(err => console.log(err));
}

if (loginForm)
  loginForm.addEventListener("submit", login);
if (logoutBtn)
  logoutBtn.addEventListener("click", logout);
