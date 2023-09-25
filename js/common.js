// common.js

let sessionId = null;



async function getSessionId(userid) {
    if (sessionId === null) {
        await retrieveSessionId(userid); // Call retrieveSessionId if sessionId is null
    }
    return sessionId;
}


async function retrieveSessionId(userid) {
    try {
        console.log("retreiving the sessionid for user = " + userid);
        const response = await fetch(`http://localhost:3000/api/getsession?userid=${userid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const responseData = await response.json();
            const { sessionID } = responseData;

            console.log('COMMON Session ID received:', sessionID);



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


export { getSessionId, getRandomColor };