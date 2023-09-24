// fikrcollab.js

// Import everything from common.js as a module
import * as common from './common.js';

// Connect to the Socket.io server
const socket = io('http://localhost:3000'); // Replace with your server URL

// Store the user's session ID and color

const sessionId = common.getSessionId(); // Implement your own session ID generation logic
const userColor = common.getRandomColor();

// Listen for other users' mouse moves
socket.on('mousemove', (data) => {
    // Handle incoming mouse move data here
    console.log('Received mouse move from another user:', data);

    // Create a pointer for the other user with their session ID and color
    createPointer(data.sessionId, data.userId, data.x, data.y, data.color);
});

// Emit your mouse move data to the server
document.addEventListener('mousemove', (e) => {

    console.log('Emit mouse move to Server');

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Emit your mouse move data to the server
    socket.emit('mousemove', {
        sessionId: sessionId,
        userId: 'johndoef' || sessionId, // Replace with your user ID logic
        x: mouseX,
        y: mouseY,
        color: userColor,
    });
});


// Function to create a pointer for another user
function createPointer(sessionId, userId, x, y, color) {
    console.log("Creating Pointer for user id", userId);
    // Create an icon pointer element
    const pointer = document.createElement('div');
    pointer.className = 'pointer';
    pointer.style.backgroundColor = color;
    pointer.style.left = x + 'px';
    pointer.style.top = y + 'px';
    pointer.textContent = userId + ' (' + sessionId + ')';
    document.body.appendChild(pointer);

    // Remove the pointer after a certain time (e.g., 5 seconds)
    setTimeout(() => {
        document.body.removeChild(pointer);
    }, 5000);
}