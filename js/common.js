// js

// consider putting all those vars in one object (Fadi)
let sessionId = null;
let userId = null;
let mindMapData = null;
let selectedFileName = null;

let nodetext = {
    length: {
        rectchar: 30,
        parallelogramchar: 40,
        diamondchar: 40,
        ellipsechar: 35
    },
    maxlines: {
        rectlines: 10,
        parallelogramlines: 6,
        diamondlines: 4,
        ellipselines: 3
    }
}
let nodesize = {
    width: {
        rectWidth: 250,
        plgrmWidth: 250,
        diamondWidth: 350,
        ellipseRx: 150,
    },
    height: {
        rectHeight: 50,
        plgrmHeight: 50,
        diamondHeight: 75,
        ellipseRy: 50
    },
    icon: {
        iconSize: 24
    }
};



// Function to calculate the height of the rectangle based on the number of lines
function calculateRectHeight(numLines) {
    const baseHeight = 50; // Base height for one line
    const lineHeight = 20; // Height for each additional line
    //console.log("The numlines =", numLines);
    if (numLines > 1)
        return (lineHeight * numLines) + 15;
    else {
        return baseHeight;
    }
}

function calculateDiamondPoints(numLines) {
    console.log("numLines=", numLines);
    const totalHeight = calculateRectHeight(numLines); // Assuming this function returns the total height based on the number of lines
    console.log("totalHeight=", totalHeight);
    const halfWidth = nodesize.width.diamondWidth / 2;
    console.log("halfWidth=", halfWidth);
    const halfHeight = totalHeight / 2;
    console.log("halfHeight=", halfHeight);

    // Assuming the top-left corner of the bounding box is at (0, 0)
    const topPoint = { x: halfWidth, y: 0 };
    const rightPoint = { x: nodesize.width.diamondWidth, y: halfHeight };
    const bottomPoint = { x: halfWidth, y: totalHeight };
    const leftPoint = { x: 0, y: halfHeight };

    return [topPoint, rightPoint, bottomPoint, leftPoint];
}

function calculateParallelogramPoints(numLines) {
    const totalHeight = calculateRectHeight(numLines); // Assuming this function returns the total height based on the number of lines
    const yOffset = totalHeight * Math.tan(20 * Math.PI / 180); // Adjust the angle if needed
    const plgrmWidth = nodesize.width.plgrmWidth;

    const points = [
        { x: 0, y: 0 },
        { x: nodesize.width.plgrmWidth - yOffset, y: 0 },
        { x: nodesize.width.plgrmWidth, y: totalHeight },
        { x: yOffset, y: totalHeight }
    ];

    return points;
}



function getSessionId(userid) {

    return sessionId;
}

function getFileName() {

    return selectedFileName;
}


function getMindMapData(mindMapData) {

    return mindMapData;
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

// Function to check if a field is empty
function isFieldEmpty(fieldValue) {
    return fieldValue.trim() === '';
}


// Function to show or clear an error message for a field
function showFieldError(fieldId, errorMessage, clearError = false) {
    const fieldElement = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);

    if (clearError) {
        fieldElement.classList.remove('is-invalid');
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    } else {
        fieldElement.classList.add('is-invalid');
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
    }
}

// Function to handle keydown event
function handleKeydown(event) {
    if (event.key === 'Shift') {
        document.body.style.cursor = 'move'; // Change cursor to move cursor
    }
}

// Function to handle keyup event
function handleKeyup(event) {
    if (event.key === 'Shift') {
        document.body.style.cursor = ''; // Change cursor back to default
    }
}

// Function to adjust the height of the textarea element
function adjustTextareaHeight(textarea) {
    console.log("Before adjustment - textarea.scrollHeight: ", textarea.scrollHeight);
    textarea.style.height = 'auto'; // Reset the height to auto to shrink the textarea
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to the scrollHeight of the textarea
    console.log("After adjustment - textarea.style.height: ", textarea.style.height);
}

function splitText(text, maxLength, maxLines) {
    let lines = text.split('\n'); // Initial split by newline

    // Further split each line if it exceeds maxLength
    lines = lines.flatMap(line => {
        let words = line.split(' ');
        let currentLine = '';
        let newLines = [];

        words.forEach(word => {
            if ((currentLine + word).length > maxLength) {
                newLines.push(currentLine);
                currentLine = word;
            } else {
                currentLine += (currentLine === '' ? '' : ' ') + word;
            }
        });

        if (currentLine) {
            newLines.push(currentLine);
        }

        return newLines;
    });

    // Truncate to maxLines if necessary
    if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
    }

    // Join the lines back into a single string separated by newline characters
    return lines.join('\n');
}

function countLines(d) {
    let label = d.label; // Assuming 'label' is a property of 'd'
    let maxLength, maxLines;

    switch (d.shape) {
        case 'diamond':
            maxLength = nodetext.length.diamondchar;
            maxLines = nodetext.maxlines.diamondlines;
            break;
        case 'rectangle':
            maxLength = nodetext.length.rectchar;
            maxLines = nodetext.maxlines.rectlines;
            break;
        case 'ellipse':
            maxLength = nodetext.length.ellipsechar;
            maxLines = nodetext.maxlines.ellipselines;
            break;
        case 'parallelogram':
            maxLength = nodetext.length.parallelogramchar;
            maxLines = nodetext.maxlines.parallelogramlines;
            break;
        default:
            console.error('Unrecognized shape:', d.shape);
            return 0; // Handle this case as needed
    }

    // Now split the text according to the determined maxLength and maxLines
    const splitTextResult = splitText(label, maxLength, maxLines);

    // Return the count of the lines after the split
    return splitTextResult.split('\n').length;
}


function handleShapeText(d) {
    let label = d.label; // Assuming 'label' is a property of 'd'
    let maxLength;

    switch (d.shape) {
        case 'diamond':
            maxLength = nodetext.length.diamondchar;
            label = splitText(label, maxLength, nodetext.maxlines.diamondlines);
            break;
        case 'rectangle':
            // Define maxLength and maxLines for rectangle
            maxLength = nodetext.length.rectchar;
            label = splitText(label, maxLength, nodetext.maxlines.rectlines);
            break;
        case 'ellipse':
            // Define maxLength and maxLines for ellipse
            maxLength = nodetext.length.ellipsechar;
            label = splitText(label, maxLength, nodetext.maxlines.ellipselines);
            break;
        case 'parallelogram':
            // Define maxLength and maxLines for parallelogram
            maxLength = nodetext.length.parallelogramchar;
            label = splitText(label, maxLength, nodetext.maxlines.parallelogramlines);
            break;
        default:
            console.error('Unrecognized shape:', d.shape);
            break;
    }

    return label; // Return the modified label
}

// Add event listeners for keydown and keyup events
window.addEventListener('keydown', handleKeydown);
window.addEventListener('keyup', handleKeyup);




export { retrieveSessionId, getMindMapData, getSessionId, getFileName, getRandomColor, showMessage, setMindMapData, setFileName, isFieldEmpty, showFieldError, countLines, calculateRectHeight, calculateDiamondPoints, calculateParallelogramPoints, nodesize, nodetext, splitText, adjustTextareaHeight, handleShapeText };