// fikrcollab.js

// Import everything from common.js as a module
import * as common from './common.js';
import * as fikrmap from './fikrmap.js';


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



// Event listener for mouse move
document.addEventListener('mousemove', (e) => {

    // Emit your mouse move data to the server here (if needed)
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const vuserId = common.getUserId();
    socket.emit('mousemove', {
        sessionId: sessionId,
        userId: vuserId,
        x: mouseX,
        y: mouseY,
        color: userColor,
    });
});




function createPointer(sessionId, userId, x, y, color) {
    // Check if the pointer should be created for another user (not the current user)
    if (userId !== common.getUserId()) {
        // Create a custom cursor element
        const customCursor = document.createElement('div');
        customCursor.className = 'custom-cursor';
        customCursor.style.left = x + 'px';
        customCursor.style.top = y + 'px';
        document.body.appendChild(customCursor);

        // Create a span element for the userId
        const userIdElement = document.createElement('span');
        userIdElement.textContent = userId;
        userIdElement.style.color = color;
        customCursor.appendChild(userIdElement);

        // Create an SVG element for the icon
        const svgNS = "http://www.w3.org/2000/svg";
        const icon = document.createElementNS(svgNS, 'svg');
        icon.setAttributeNS(null, 'viewBox', '0 0 16 16');
        icon.setAttributeNS(null, 'fill', color);
        icon.classList.add('bi', 'bi-mouse-pointer-fill');

        // Create a path element for the icon shape
        const path = document.createElementNS(svgNS, 'path');
        path.setAttributeNS(null, 'd', 'M4.40701 3.41403C3.94876 3.27925 3.71963 3.21186 3.56363 3.27001C3.42768 3.32069 3.32045 3.42793 3.26977 3.56387C3.21162 3.71988 3.27901 3.949 3.41379 4.40726L7.61969 18.7073C7.74493 19.1332 7.80756 19.3461 7.93395 19.4449C8.04424 19.5312 8.18564 19.5672 8.32377 19.5443C8.48206 19.5181 8.639 19.3611 8.95286 19.0473L11.9999 16.0002L16.4343 20.4345C16.6323 20.6325 16.7313 20.7315 16.8454 20.7686C16.9459 20.8012 17.054 20.8012 17.1545 20.7686C17.2686 20.7315 17.3676 20.6325 17.5656 20.4345L20.4343 17.5659C20.6323 17.3679 20.7313 17.2689 20.7684 17.1547C20.801 17.0543 20.801 16.9461 20.7684 16.8457C20.7313 16.7315 20.6323 16.6325 20.4343 16.4345L15.9999 12.0002L19.047 8.95311C19.3609 8.63924 19.5178 8.48231 19.5441 8.32402C19.567 8.18589 19.5309 8.04448 19.4447 7.93419C19.3458 7.8078 19.1329 7.74518 18.7071 7.61993L4.40701 3.41403Z');
        icon.appendChild(path);

        customCursor.appendChild(icon);

        // Listen for mousemove events for this user
        socket.on('mousemove', (data) => {
            if (data.sessionId === sessionId && data.userId === userId) {
                // Update the custom cursor position
                customCursor.style.left = data.x + 'px';
                customCursor.style.top = data.y + 'px';
            }
        });

        // Remove the custom cursor after a certain time (e.g., 5 seconds)
        setTimeout(() => {
            document.body.removeChild(customCursor);
        }, 5000);
    }
}



// Listen for the initial mindMapData when a client connects
// receive ....


// Listen for updates to mindMapData from the server
socket.on('drawingUpdate', (updatedData) => {
    // Update your D3.js visualization with the latest data
    // This will reflect changes made by other clients
    console.log("Receiving the updated mindMapData ...", updatedData);
    fikrmap.renderMindMap(updatedData);
});

// Function to send updates to the server when changes are made
function sendUpdate(updatedData) {
    console.log("xx emit drawingUpdate");
    socket.emit('drawingUpdate', updatedData);
}

export { sendUpdate };