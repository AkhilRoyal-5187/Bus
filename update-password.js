import fetch from 'node-fetch';

async function updatePassword() {
  try {
    const response = await fetch('http://localhost:3000/api/users/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john@123',
        rollNumber: '1'
      })
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

updatePassword(); 