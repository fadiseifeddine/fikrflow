// Import everything from common.js as a module
import * as common from './common.js';
import * as fikruser from './fikruser.js';

// Define API base URL
let baseUrlfikrflowserver = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrlfikrflowserver = 'http://localhost:3000'; // Cloud Run URL
} else {
    baseUrlfikrflowserver = 'https://fikrflowserver-g74cb7lg5a-uc.a.run.app'; // Local URL
}


async function duplicateDrawing(fileName, mindMapData, userId, sessionId) {
    // Check if the user provided a file name
    if (fileName !== "") {
        //console.log("Handle saving with file name:", fileName);

        // Hide the modal
        $('#fileNameModal').modal('hide');

        // Proceed with saving using the file name
        try {
            const response = await fetch('${baseUrlfikrflowserver}/api/savedraw', {
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


async function saveDrawing(fileName, mindMapData, userId, sessionId, zoomScale, translateX, translateY) {
    // Check if the user provided a file name
    if (fileName !== "") {
        console.log("saveDrawing Handle saving with file name:", fileName);

        // Hide the modal
        $('#fileNameModal').modal('hide');

        // Proceed with saving using the file name
        try {
            const response = await fetch('${baseUrlfikrflowserver}/api/savedraw', {
                method: 'POST',
                body: JSON.stringify({
                    userid: userId,
                    fileName: fileName,
                    jsondrw: mindMapData,
                    zoomScale: zoomScale,
                    translateX: translateX,
                    translateY: translateY
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

async function saveUpload(filename, username) {
    // Check if the user provided a file name
    if (filename !== "") {
        console.log("saveUpload Handle uploading with file name:", filename);

        // Proceed with uploading using the file name
        try {
            const response = await fetch('${baseUrlfikrflowserver}/api/fikr_upload', {
                method: 'POST',
                body: JSON.stringify({
                    filename: filename,
                    username: username
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Upload saved successfully');
                // Display a success message or handle the success scenario
                return true; // Return true on success
            } else {
                console.error('Failed to save upload');
                // Handle the error and provide appropriate user feedback
                return false; // Return false on failure
            }
        } catch (error) {
            console.error('An error occurred:', error);
            // Handle the error and provide appropriate user feedback
            return false; // Return false on error
        }
    } else {
        console.log("File name not provided. Uploading canceled.");
        return false; // Return false if the file name is not provided
    }
}

function onListItemClick(filename) {
    common.setUploadedFileName(filename); // Update the selected file name
    const fileListItems = document.querySelectorAll('#fileList li');
    fileListItems.forEach(item => {
        if (item.textContent === filename) {
            item.classList.add('selected'); // Highlight this item
        } else {
            item.classList.remove('selected'); // Remove highlight from other items
        }
    });
}

async function getUploads() {
    try {

        const vuserID = fikruser.getUserId();

        const response = await fetch(`${baseUrlfikrflowserver}/api/getuploads?user=${vuserID}`);
        if (response.ok) {
            const files = await response.json();
            const fileListElement = document.getElementById('fileList');
            fileListElement.innerHTML = ''; // Clear existing list

            files.forEach(filename => {
                const listItem = document.createElement('li');
                listItem.textContent = filename;
                listItem.addEventListener('click', () => {
                    // Add your logic for when a file is clicked
                    onListItemClick(filename);
                    console.log('File selected:', filename);
                });

                fileListElement.appendChild(listItem);
            });
        } else {
            console.error('Failed to fetch uploaded files');
        }
    } catch (error) {
        console.error('Error fetching uploaded files:', error);
    }
}
async function getDrawings(drawingName = null) {
    try {
        // Determine the API endpoint based on whether a drawing name is provided
        let apiUrl = '${baseUrlfikrflowserver}/api/getdraw';
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






export { getDrawings, saveDrawing, duplicateDrawing, saveUpload, getUploads };