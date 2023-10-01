// common.js

// consider putting all those vars in one object (Fadi)
let sessionId = null;
let userId = null;
let mindMapData = null;
let selectedFileName = null;





function getSessionId(userid) {

    return sessionId;
}

function getFileName() {

    return selectedFileName;
}

function getUserId(userid) {
    if (userId === null) {
        return "johndoe"; // Return "johndoe" if userId is null
    } else {
        return userId; // Return the actual userId if it's not null
    }
}

function getMindMapData(mindMapData) {

    return mindMapData;
}



function setUserId(newUserId) {
    userId = newUserId;
}

function setFileName(file) {
    selectedFileName = file;
}


function setMindMapData(vmindMapData) {
    mindMapData = vmindMapData;
}


async function retrieveSessionId(puserid) {
    try {
        console.log("The puserid in retrieveSessionId is ", puserid);
        userId = puserid;
        console.log("retreiving the sessionid for user = " + puserid);
        const response = await fetch(`http://localhost:3000/api/getsession?userid=${puserid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const responseData = await response.json();
            const { sessionID } = responseData;

            console.log('COMMON Session ID received:', sessionID);
            sessionId = sessionID;



        } else {
            console.error('Error getting session:', response.status);
        }
    } catch (error) {
        console.error('Error getting session:', error);
    }
}


// Generate a random color for the user's icon pointer
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}



// Function to display a message in the message bar and hide it after a delay
function showMessage(message, delay) {
    const messageBar = document.getElementById('messageBar');
    messageBar.textContent = message;
    messageBar.style.display = 'block';
    // Set the text color to red and make it bold
    messageBar.style.color = 'red';
    messageBar.style.fontWeight = 'bold';
    setTimeout(function() {
        messageBar.style.display = 'none';
    }, delay);
}


export { retrieveSessionId, getUserId, getMindMapData, getSessionId, getFileName, getRandomColor, showMessage, setUserId, setMindMapData, setFileName };