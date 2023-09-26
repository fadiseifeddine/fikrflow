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
    const vuserId = common.getUserId();

    console.log('Emit userId', vuserId);
    console.log('Emit sessionid ', sessionId);

    // Emit your mouse move data to the server
    socket.emit('mousemove', {
        sessionId: sessionId,
        userId: vuserId, // Replace with your user ID logic
        x: mouseX,
        y: mouseY,
        color: userColor,
    });
});


function createPointer(sessionId, userId, x, y, color) {
    // Check if the pointer should be created for another user (not the current user)
    console.log(" xyz_userId = ", userId);
    console.log(" xyz_common.userId = ", common.userId);

    if (userId !== common.getUserId()) {
        console.log("Creating Pointer for user id", userId);
        console.log("x:", x, "y:", y, "color:", color, "userId:", userId, "sessionId:", sessionId);

        // Create an icon pointer element
        const pointer = document.createElement('div');
        pointer.className = 'pointer';
        pointer.style.backgroundColor = color;
        pointer.style.left = x + 'px';
        pointer.style.top = y + 'px';
        pointer.textContent = userId;
        document.body.appendChild(pointer);

        // Remove the pointer after a certain time (e.g., 5 seconds)
        setTimeout(() => {
            console.log("Removing Pointer for user id", userId);
            document.body.removeChild(pointer);
        }, 5000);
    }
}