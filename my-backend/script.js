fetch('https://your-backend-url.com/api/youtube')
    .then(response => response.json())
    .then(data => console.log(data));