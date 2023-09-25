// Import everything from common.js as a module
import * as common from './common.js';

async function saveDrawing(fileName, mindMapData) {
    // Check if the user provided a file name
    if (fileName !== "") {
        console.log("Handle saving with file name:", fileName);

        // Hide the modal
        $('#fileNameModal').modal('hide');

        // Proceed with saving using the file name
        try {
            const response = await fetch('http://localhost:3000/api/savedraw', {
                method: 'POST',
                body: JSON.stringify({
                    fileName: fileName,
                    jsondrw: mindMapData
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Drawing saved successfully');
                common.showMessage('Drawing saved successfully ...', 2000);
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
        console.log("File name not provided. Saving canceled.");
        return false; // Return false if the file name is not provided
    }
}


async function getDrawings() {
    try {
        console.log('getDrawings fron server ......');

        const response = await fetch('http://localhost:3000/api/getdraw', {
            method: 'GET'
        });

        if (response.ok) {
            const drawings = await response.json();
            console.log('Drawings received:', drawings);
            return drawings;

        } else {
            console.error('Error getting drawings:', response.status);
            return response.statusText;
        }
    } catch (error) {
        console.error('Error getting drawingss:', error);
        return response.error.text;
    }
}


export { getDrawings, saveDrawing };