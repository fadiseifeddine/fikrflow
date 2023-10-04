// Import everything from common.js as a module
import * as common from './common.js';


async function duplicateDrawing(fileName, mindMapData, userId, sessionId) {
    // Check if the user provided a file name
    if (fileName !== "") {
        //console.log("Handle saving with file name:", fileName);

        // Hide the modal
        $('#fileNameModal').modal('hide');

        // Proceed with saving using the file name
        try {
            const response = await fetch('http://localhost:3000/api/savedraw', {
                method: 'POST',
                body: JSON.stringify({
                    userid: userId,
                    fileName: fileName,
                    jsondrw: mindMapData
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                //console.log('Drawing saved successfully');
                common.showMessage('Drawing saved successfully ...', 2000);
                common.setFileName(fileName);
                return true; // Return true on success
            } else {
                console.error('Failed to save drawing');
                // Handle the error and provide appropriate user feedback
                return false; // Return false on failure
            }
        } catch (error) {
            console.error('An error occurred:', error);
            // Handle the error and provide appropriate user feedback
            return false; // Return false on error
        }
    } else {
        //console.log("File name not provided. Saving canceled.");
        return false; // Return false if the file name is not provided
    }
}


async function saveDrawing(fileName, mindMapData, userId, sessionId) {
    // Check if the user provided a file name
    if (fileName !== "") {
        //console.log("Handle saving with file name:", fileName);

        // Hide the modal
        $('#fileNameModal').modal('hide');

        // Proceed with saving using the file name
        try {
            const response = await fetch('http://localhost:3000/api/savedraw', {
                method: 'POST',
                body: JSON.stringify({
                    userid: userId,
                    fileName: fileName,
                    jsondrw: mindMapData
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                //console.log('Drawing saved successfully');
                common.showMessage('Drawing saved successfully ...', 2000);
                common.setFileName(fileName);
                return true; // Return true on success
            } else {
                console.error('Failed to save drawing');
                // Handle the error and provide appropriate user feedback
                return false; // Return false on failure
            }
        } catch (error) {
            console.error('An error occurred:', error);
            // Handle the error and provide appropriate user feedback
            return false; // Return false on error
        }
    } else {
        //console.log("File name not provided. Saving canceled.");
        return false; // Return false if the file name is not provided
    }
}



async function getDrawings(drawingName = null) {
    try {
        // Determine the API endpoint based on whether a drawing name is provided
        let apiUrl = 'http://localhost:3000/api/getdraw';
        if (drawingName) {
            apiUrl += `?name=${encodeURIComponent(drawingName)}`;
        }

        const response = await fetch(apiUrl, {
            method: 'GET'
        });

        if (response.ok) {
            const drawings = await response.json();
            return drawings;
        } else {
            console.error('Error getting drawings:', response.status);
            return response.statusText;
        }
    } catch (error) {
        console.error('Error getting drawings:', error);
        return error.message;
    }
}






export { getDrawings, saveDrawing, duplicateDrawing };