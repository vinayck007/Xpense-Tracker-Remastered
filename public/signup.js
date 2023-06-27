const form = document.getElementById('signup-form')

form.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevents the form from submitting normally
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const userData = {
    name: name,
    email: email,
    password: password
  };
  
  axios.post('http://localhost:3000/user/signup', userData)
    .then((response) => {
      console.log(response.data);
      alert('Successfully signed up!');
      window.location.href = "http://localhost:3000/login.html";
    })
    .catch((error) => {
      console.error(error);
      alert('Error signing up. Please try again.');
    });
});