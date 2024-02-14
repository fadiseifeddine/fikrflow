// js

// consider putting all those vars in one object (Fadi)
let sessionId = null;
let userId = null;
let mindMapData = null;
let selectedFileName = null;
let currentSelectedUploadedFile = null; // Global variable to store the selected uploaded file name

// Define API base URL
let baseUrlfikrflowserver = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrlfikrflowserver = 'http://localhost:3000'; // Cloud Run URL
} else {
    baseUrlfikrflowserver = 'https://fikrflowserver-g74cb7lg5a-uc.a.run.app'; // Local URL
}

let nodetext = {
    length: {
        rectangle: 30,
        parallelogram: 40,
        diamond: 40,
        ellipse: 35
    },
    maxlines: {
        rectangle: 10,
        parallelogram: 6,
        diamond: 2,
        ellipse: 3
    }
}
let nodesize = {
    width: {
        rectangle: 250,
        parallelogram: 250,
        diamond: 350,
        ellipse: 150,
    },
    height: {
        rectangle: 50,
        parallelogram: 50,
        diamond: 75,
        ellipse: 50
    },
    icon: {
        iconSize: 24
    }
};



// Function to calculate the height of the node based on the shape and number of lines
function calculateNodeHeight(shape, numLines) {
    const baseHeight = 50; // Default base height
    const lineHeight = 20; // Height for each additional line

    switch (shape) {
        case 'rectangle':
            return calculateRectHeight(numLines);
        case 'ellipse':
            // Adjust dimensions as needed for ellipse
            return baseHeight + (lineHeight * (numLines - 1));
        case 'parallelogram':
            // Adjust dimensions as needed for parallelogram
            return calculateParallelogramHeight(numLines);
        case 'diamond':
            // Adjust dimensions as needed for diamond
            return calculateDiamondHeight(numLines);
        default:
            console.error('Invalid node shape:', shape);
            return baseHeight;
    }
}



// Function to calculate the width of the node based on the shape
function calculateNodeWidth(shape) {
    switch (shape) {
        case 'rectangle':
            return nodesize.width.rectangle;
        case 'ellipse':
            return nodesize.width.ellipse; // Adjust as needed
        case 'parallelogram':
            return nodesize.width.parallelogram; // Adjust as needed
        case 'diamond':
            return nodesize.width.diamond; // Adjust as needed
        default:
            console.error('Invalid node shape:', shape);
            return nodesize.width.rectangle; // Default width for unknown shape
    }
}


// Function to calculate the height of the rectangle based on the number of lines
function calculateRectHeight(numLines) {
    const baseHeight = 50; // Base height for one line
    const lineHeight = 20; // Height for each additional line
    return (lineHeight * numLines) + 15;
}

// Function to calculate the height of the parallelogram based on the number of lines
function calculateParallelogramHeight(numLines) {
    const baseHeight = 50; // Base height for one line
    const lineHeight = 20; // Height for each additional line
    // Adjust dimensions as needed for parallelogram
    return (lineHeight * numLines) + 10;
}

// Function to calculate the height of the diamond based on the number of lines
function calculateDiamondHeight(numLines) {
    const baseHeight = 50; // Base height for one line
    const lineHeight = 20; // Height for each additional line
    // Adjust dimensions as needed for diamond
    return (lineHeight * numLines) + 5;
}

function calculateDiamondPoints(numLines) {
    //console.log("numLines=", numLines);
    const totalHeight = nodesize.height.diamond;
    // console.log("totalHeight=", totalHeight);
    const halfWidth = nodesize.width.diamond / 2;
    // console.log("halfWidth=", halfWidth);
    const halfHeight = totalHeight / 2;
    // console.log("halfHeight=", halfHeight);

    // Assuming the top-left corner of the bounding box is at (0, 0)
    const topPoint = { x: halfWidth, y: 0 };
    const rightPoint = { x: nodesize.width.diamond, y: halfHeight };
    const bottomPoint = { x: halfWidth, y: totalHeight };
    const leftPoint = { x: 0, y: halfHeight };

    return [topPoint, rightPoint, bottomPoint, leftPoint];
}

function calculateParallelogramPoints(numLines) {
    const totalHeight = nodesize.height.parallelogram;

    const yOffset = totalHeight * Math.tan(20 * Math.PI / 180); // Adjust the angle if needed
    const plgrmWidth = nodesize.width.parallelogram;

    const points = [
        { x: 0, y: 0 },
        { x: nodesize.width.parallelogram - yOffset, y: 0 },
        { x: nodesize.width.parallelogram, y: totalHeight },
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

function setUploadedFileName(file) {
    currentSelectedUploadedFile = file;
}

function getUploadedFileName() {
    return currentSelectedUploadedFile;
}

function setMindMapData(vmindMapData) {
    mindMapData = vmindMapData;
}


async function retrieveSessionId(puserid) {
    try {
        console.log("The puserid in retrieveSessionId is ", puserid);
        userId = puserid;
        console.log("retreiving the sessionid for user = " + puserid);
        const response = await fetch(`${baseUrlfikrflowserver}/api/getsession?userid=${puserid}`, {
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
    //console.log("Before adjustment - textarea.scrollHeight: ", textarea.scrollHeight);
    textarea.style.height = 'auto'; // Reset the height to auto to shrink the textarea
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to the scrollHeight of the textarea
    // console.log("After adjustment - textarea.style.height: ", textarea.style.height);
}

function splitText(text, maxLength, maxLines) {
    if (typeof text !== 'string') {
        console.warn('Text is not a string:', text);
        return ''; // Return an empty string if text is not a string
    }

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
    let shape = d.shape || 'rectangle'; // Default to 'rectangle' if shape is undefined
    let maxLength = nodetext.length[shape];
    let maxLines = nodetext.maxlines[shape];

    if (!maxLength || !maxLines) {
        console.error('Unrecognized or undefined shape:', shape);
        return 0; // Handle this case as needed
    }

    // Now split the text according to the determined maxLength and maxLines
    const splitTextResult = splitText(label, maxLength, maxLines);

    // Return the count of the lines after the split
    return splitTextResult.split('\n').length;
}


function handleShapeText(d) {
    const shapeConfig = {
        diamond: { length: nodetext.length.diamond, maxlines: nodetext.maxlines.diamond },
        rectangle: { length: nodetext.length.rectangle, maxlines: nodetext.maxlines.rectangle },
        ellipse: { length: nodetext.length.ellipse, maxlines: nodetext.maxlines.ellipse },
        parallelogram: { length: nodetext.length.parallelogram, maxlines: nodetext.maxlines.parallelogram }
    };

    const { length, maxlines } = shapeConfig[d.shape] || {};

    if (length && maxlines) {
        d.label = splitText(d.label, length, maxlines);
    } else {
        console.error('Unrecognized shape:', d.shape);
    }

    return d.label; // Return the modified label
}

function determineMapType(mindMapData) {
    // Ensure that mindMapData.nodes and mindMapData.relationships are defined and are arrays
    if (!mindMapData || !Array.isArray(mindMapData.nodes) || !Array.isArray(mindMapData.relationships)) {
        console.error('Invalid mindMapData format', mindMapData);
        return "unknown"; // or handle this case as you see fit
    }

    // If all nodes have a single parent (except the root), it's a hierarchy
    let isHierarchy = true;

    console.log("determineMapType mindmapData = ", mindMapData);

    const nodeIds = new Set(mindMapData.nodes.map(node => node.id));
    const childCounts = new Map();

    mindMapData.relationships.forEach(rel => {
        if (!childCounts.has(rel.target)) {
            childCounts.set(rel.target, 0);
        }
        childCounts.set(rel.target, childCounts.get(rel.target) + 1);
    });

    childCounts.forEach((count, nodeId) => {
        if (count > 1 && nodeIds.has(nodeId)) {
            isHierarchy = false;
        }
    });

    return isHierarchy ? "hierarchy" : "network";
}

function transformToMindMapHierarchy(data) {
    let nodeMap = new Map();
    let root = null;

    // Create a map of all nodes with their ID as the key
    data.nodes.forEach(node => {
        nodeMap.set(node.id, {
            name: node.label,
            description: node.description,
            children: []
        });
    });

    // Find and assign children to each node
    data.relationships.forEach(rel => {
        let parent = nodeMap.get(rel.source);
        let child = nodeMap.get(rel.target);
        if (parent && child) {
            parent.children.push(child);
        }
    });

    // Find the root node (node without a parent)
    root = data.nodes.find(node => node.parentId === null);
    root = nodeMap.get(root.id);

    return [root];
}





function calculateNodePositions(data, currentTransform) {
    const type = determineMapType(data);
    if (type === 'network') {
        console.log("Network layout applied.");
        return calculateNetworkNodePositions(data, currentTransform);
    } else if (type === 'hierarchy') {
        console.log("Hierarchy layout applied.");
        return calculateHierarchyNodePositions(data, currentTransform);
    }
}


function calculateHierarchyNodePositions(data, currentTransform) {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.relationships)) {
        console.error('Invalid data format for hierarchy positioning', data);
        return data;
    }

    // Variables for layout
    const paddingX = 200; // Increase horizontal padding between nodes at the same level
    const paddingY = 100; // Vertical padding between levels
    const nodeWidth = 100; // Estimate width of a node, adjust based on actual content

    // Build a map of children for each node
    const childrenMap = new Map();
    data.relationships.forEach(rel => {
        if (!childrenMap.has(rel.source)) {
            childrenMap.set(rel.source, []);
        }
        childrenMap.get(rel.source).push(rel.target);
    });

    // Helper function to calculate width of each level
    const calculateLevelWidths = (nodeId, level, levelWidths, visited = new Set()) => {
        if (visited.has(nodeId)) {
            return; // To avoid cycles
        }
        visited.add(nodeId);

        // Initialize level width
        if (!levelWidths[level]) {
            levelWidths[level] = 0;
        }
        levelWidths[level] += nodeWidth + paddingX; // Increment width for this level

        // Recursively calculate for children
        const children = childrenMap.get(nodeId) || [];
        children.forEach(childId => {
            calculateLevelWidths(childId, level + 1, levelWidths, visited);
        });
    };

    // Calculate level widths
    const levelWidths = [];
    data.nodes.filter(node => !data.relationships.some(rel => rel.target === node.id)) // Root nodes
        .forEach(rootNode => calculateLevelWidths(rootNode.id, 0, levelWidths));

    // Helper function to calculate positions
    const calculatePositions = (nodeId, x, y, visited = new Set()) => {
        if (visited.has(nodeId)) {
            return; // To avoid cycles
        }
        visited.add(nodeId);

        // Apply current transform to positions
        const transformedX = (x - currentTransform.x) / currentTransform.k;
        const transformedY = (y - currentTransform.y) / currentTransform.k;

        // Find the node and set its position
        const node = data.nodes.find(n => n.id === nodeId);
        if (node) {
            node.x = transformedX;
            node.y = transformedY;
        }

        // Recursively position children
        const children = childrenMap.get(nodeId) || [];
        let offsetX = x - ((children.length - 1) * (nodeWidth + paddingX)) / 2; // Center children nodes
        children.forEach(childId => {
            calculatePositions(childId, offsetX, y + paddingY, visited);
            offsetX += nodeWidth + paddingX; // Move to the next horizontal position
        });
    };

    // Center root nodes and calculate positions
    const totalWidth = Math.max(...levelWidths);
    data.nodes.filter(node => !data.relationships.some(rel => rel.target === node.id)) // Root nodes
        .forEach((rootNode, index, array) => {
            const rootX = (totalWidth - levelWidths[0]) / 2; // Center the root node(s)
            const rootY = 0; // Root nodes start at the top (y = 0)
            calculatePositions(rootNode.id, rootX, rootY);
        });

    return data; // Return the data with updated node positions
}



function calculateNetworkNodePositions(data, currentTransform) {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.relationships)) {
        console.error('Invalid data format for network positioning', data);
        return data;
    }

    // Variables for layout
    const paddingX = 150; // Horizontal padding between nodes
    const paddingY = 100; // Vertical padding between levels

    // Create a map to keep track of node levels and positions
    const nodeLevels = new Map();

    // Initialize all nodes at level 0
    data.nodes.forEach(node => nodeLevels.set(node.id, { level: 0, x: 0, y: 0 }));

    // Function to update node levels based on relationships
    const updateNodeLevels = () => {
        data.relationships.forEach(rel => {
            const sourceLevel = nodeLevels.get(rel.source).level;
            const targetLevel = nodeLevels.get(rel.target).level;
            const newLevel = Math.max(sourceLevel + 1, targetLevel);
            nodeLevels.set(rel.target, {...nodeLevels.get(rel.target), level: newLevel });
        });
    };

    // Update node levels
    updateNodeLevels();

    // Function to calculate positions based on levels
    const calculatePositions = () => {
        nodeLevels.forEach((value, key) => {
            const nodeIndex = data.nodes.findIndex(node => node.id === key);
            if (nodeIndex !== -1) {
                const x = value.level * paddingX;
                const y = nodeIndex * paddingY;

                // Apply current transform
                const transformedX = (x - currentTransform.x) / currentTransform.k;
                const transformedY = (y - currentTransform.y) / currentTransform.k;

                data.nodes[nodeIndex].x = transformedX;
                data.nodes[nodeIndex].y = transformedY;
            }
        });
    };

    // Calculate positions
    calculatePositions();

    // Apply positions to relationships
    data.relationships.forEach(rel => {
        const sourceNode = data.nodes.find(node => node.id === rel.source);
        const targetNode = data.nodes.find(node => node.id === rel.target);
        if (sourceNode && targetNode) {
            rel.x1 = sourceNode.x;
            rel.y1 = sourceNode.y;
            rel.x2 = targetNode.x;
            rel.y2 = targetNode.y;
        }
    });

    return data; // Return the data with updated node positions
}



// functions used in tree hierarchy , fadi to consider doing it for network
// ===================================================================

function createParallelogramElement(d) {
    const numLines = countLines(d) + 1; // Assuming this function counts the number of lines in the text
    const plgrmPoints = calculateParallelogramPoints(numLines);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute("d", "M" + plgrmPoints.map(p => `${p.x},${p.y}`).join("L") + "Z");
    path.setAttribute("stroke", "red");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    return path;
}

function createDiamondElement(d) {
    const numLines = countLines(d) + 1;
    const diamondPoints = calculateDiamondPoints(numLines);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute("d", "M" + diamondPoints.map(p => `${p.x},${p.y}`).join("L") + "Z");
    path.setAttribute("stroke", "red");
    path.setAttribute("stroke-width", 2);
    path.setAttribute("fill", "none");
    return path;
}

function createShapeElement(nodeData) {
    let element;
    switch (nodeData.shape) {
        case 'rectangle':
            element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            // Set attributes for rectangle
            break;
        case 'ellipse':
            element = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            // Set attributes for ellipse
            break;
        case 'parallelogram':
            element = createParallelogramElement(nodeData); // Implement this function
            break;
        case 'diamond':
            element = createDiamondElement(nodeData); // Implement this function
            break;
        default:
            console.error('Unrecognized shape:', nodeData.shape);
            return null;
    }
    return element;
}

function getNodeSize(nodeData) {
    if (!nodeData || !nodeData.shape) {
        console.error('Missing data or shape for node:', nodeData);
        return [0, 0]; // Default size for missing data or shape
    }

    console.log('nodeData that i am calculating the size :', nodeData);

    const numLines = countLines(nodeData);
    return [
        calculateNodeWidth(nodeData.shape),
        calculateNodeHeight(nodeData.shape, numLines)
    ];
}

function transformDataToHierarchy(data) {
    if (!data || !data.nodes || !data.relationships) {
        console.error("Invalid data format:", data);
        return null;
    }

    let nodeMap = new Map();
    data.nodes.forEach(node => {
        nodeMap.set(node.id, {...node, children: [] });
    });

    data.relationships.forEach(rel => {
        let parent = nodeMap.get(rel.source);
        let child = nodeMap.get(rel.target);
        if (parent && child) {
            parent.children.push(child);
        } else {
            console.error("Invalid relationship:", rel);
        }
    });

    return nodeMap.get("root"); // Assuming 'root' is the id of the root node
}
// ===================================================================


// Add event listeners for keydown and keyup events
window.addEventListener('keydown', handleKeydown);
window.addEventListener('keyup', handleKeyup);




export { retrieveSessionId, getMindMapData, getSessionId, getFileName, getRandomColor, showMessage, setMindMapData, setFileName, isFieldEmpty, showFieldError, countLines, calculateNodeHeight, calculateDiamondPoints, calculateParallelogramPoints, nodesize, nodetext, splitText, adjustTextareaHeight, handleShapeText, calculateNodeWidth, createShapeElement, getNodeSize, transformDataToHierarchy, createParallelogramElement, createDiamondElement, calculateNodePositions, determineMapType, setUploadedFileName, getUploadedFileName, transformToMindMapHierarchy };