let userInput = '';
let jsondrw = '';
let sessionID = ''; // Declare sessionID as a global variable
let selectedNode = null;


const drawingContainer = document.getElementById('drawingContainer');

function resizeDrawingContainer() {
    const windowHeight = window.innerHeight;
    const chatContainerHeight = document.getElementById('chatContainer').offsetHeight;
    drawingContainer.style.height = `${windowHeight - chatContainerHeight - 150}px`;
}

window.addEventListener('resize', resizeDrawingContainer);
resizeDrawingContainer();

getsessionid();

function renderMindMap(mindMapData) {

    const mindMapContainer = document.getElementById('mindMapContainer');
    mindMapContainer.innerHTML = '';

    try {
        const svg = d3.select('#mindMapContainer');

        const nodes = svg.selectAll('.node')
            .data(mindMapData.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            //.attr('transform', (d) => `translate(${Math.random() * 600}, ${Math.random() * 400})`)
            .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
            .attr('id', (d) => `node-${d.id}`) // Assign an id to each node
            .call(dragHandler)
            .on('click', (event, d) => selectNode(d.id)); // Attach click event listener to select the box


        nodes.append('rect')
            .attr('width', (d) => d.label.length * 10 + 20) // Adjust the box width based on the text length
            .attr('height', 50)
            .attr('fill', (d) => d.color)
            .attr('stroke', (d) => d.textColor)
            .attr('data-tag', 'rect'); // Add a data attribute to the rect element;

        nodes.classed('selected', (d) => d.id === selectedNode);

        nodes.append('text')
            .attr('x', (d) => (d.label.length * 10 + 20) / 2) // Center the text horizontally
            .attr('y', 25)
            .text((d) => d.label)
            .attr('fill', '#000')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('data-tag', 'recttext'); // Add a data attribute to the rect element;

        nodes.append('circle')
            .attr('cx', 5)
            .attr('cy', 5)
            .attr('r', 10)
            .attr('fill', '#0000FF') // Blue color for the circle
            .attr('stroke', '#FFFFFF') // White color for the circle stroke
            .attr('stroke-width', 2);

        nodes.append('text')
            .attr('x', 5)
            .attr('y', 8)
            .text((d) => d.id)
            .attr('font-size', 10)
            .attr('fill', '#FFFFFF') // White color for the text
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle');

        const relationships = svg.selectAll('.relationship')
            .data(mindMapData.relationships)
            .enter()
            .append('line')
            .attr('class', 'relationship')
            .attr('x1', (d) => getCenterX(nodes, d.source))
            .attr('y1', (d) => getCenterY(nodes, d.source))
            .attr('x2', (d) => getCenterX(nodes, d.target))
            .attr('y2', (d) => getCenterY(nodes, d.target));

        function dragHandler(selection) {
            const drag = d3.drag()
                .on('start', dragStart)
                .on('drag', dragMove);

            selection.call(drag);

            function dragStart(event, d) {
                d3.select(this).raise().classed('active', true);
            }

            // Update the x and y positions in the mindMapData

            function dragMove(event, d) {
                d3.select(this)
                    .attr('transform', `translate(${event.x - 50}, ${event.y - 25})`);

                // Update the x and y positions in the mindMapData
                const selectedNode = mindMapData.nodes.find((node) => node.id === d.id);
                if (selectedNode) {
                    selectedNode.x = event.x - 50;
                    selectedNode.y = event.y - 25;
                }

                updateRelationships();
            }

        }

        function getCenterX(selection, nodeId) {
            const node = selection.filter((d) => d.id === nodeId).node();
            const rect = node.querySelector('rect');
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]) + parseFloat(rect.getAttribute('width')) / 2;
        }

        function getCenterY(selection, nodeId) {
            const node = selection.filter((d) => d.id === nodeId).node();
            const rect = node.querySelector('rect');
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]) + parseFloat(rect.getAttribute('height')) / 2;
        }

        function updateRelationships() {
            relationships
                .attr('x1', (d) => getCenterX(nodes, d.source))
                .attr('y1', (d) => getCenterY(nodes, d.source))
                .attr('x2', (d) => getCenterX(nodes, d.target))
                .attr('y2', (d) => getCenterY(nodes, d.target));
        }
    } catch (error) {
        console.error('Failed to render mind map:', error);
    }
}



// Function to handle selecting a box =============================
function selectNode(nodeId) {
    console.log("Selecting a Node in graph ..." + nodeId);
    selectedNode = nodeId;
    renderMindMap(jsondrw); // Re-render the mind map to apply the selection highlight


}

// Listeners =============================


document.getElementById('submitButton').addEventListener('click', handleInputSubmit);
document.getElementById('saveButton').addEventListener('click', handleInputSave);
document.getElementById('openButton').addEventListener('click', handleOpen);
document.getElementById('editButton').addEventListener('click', function() {
    handleEdit(jsondrw);
});

function handleEdit(mindMapData) {
    if (selectedNode) {
        const selectedNodeId = selectedNode;
        const selectedNodeElement = document.getElementById(`node-${selectedNodeId}`);
        const rectext = selectedNodeElement.querySelector('text[data-tag="recttext"]');

        if (rectext) {
            const currentText = rectext.textContent;
            const rectextStyle = window.getComputedStyle(rectext);

            const rectextBox = rectext.getBBox();

            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            const inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.value = currentText;

            // Set attributes to match the width, height, x, and y of the original text element
            foreignObject.setAttribute('width', rectextBox.width);
            foreignObject.setAttribute('height', rectextBox.height);
            foreignObject.setAttribute('x', rectextBox.x);
            foreignObject.setAttribute('y', rectextBox.y);
            foreignObject.setAttribute('style', 'overflow: visible');

            // Apply the same style as the original text element
            inputElement.style.fontSize = rectextStyle.fontSize;
            inputElement.style.fontWeight = rectextStyle.fontWeight;
            inputElement.style.fontFamily = rectextStyle.fontFamily;
            inputElement.style.textAnchor = rectextStyle.textAnchor;
            inputElement.style.alignmentBaseline = rectextStyle.alignmentBaseline;

            // Set the font color to black in the input element
            inputElement.style.color = 'black';

            foreignObject.appendChild(inputElement);
            selectedNodeElement.appendChild(foreignObject);

            // Hide the original text element while editing
            rectext.style.visibility = 'hidden';

            // Apply focus and selection after the input element is rendered
            requestAnimationFrame(() => {
                inputElement.focus();
                inputElement.select();
            });

            inputElement.addEventListener('blur', () => {
                const newText = inputElement.value;
                rectext.textContent = newText;

                const selectedNodeData = mindMapData.nodes.find((node) => node.id === selectedNodeId);
                if (selectedNodeData) {
                    selectedNodeData.label = newText;
                }

                // Show the original text element after editing is done
                rectext.style.visibility = 'visible';

                selectedNodeElement.removeChild(foreignObject);
            });
        }
    }
}




function handleInputSubmit() {
    userInput = document.getElementById('textInput').value;
    sendChatMessage(userInput);
}


function handleInputSave() {

    const fileNameModal = new bootstrap.Modal(document.getElementById('fileNameModal'));
    fileNameModal.show();

    // Get the file name from the input field
    const fileNameInput = document.getElementById('fileNameInput');
    const fileName = fileNameInput.value.trim();
    saveDrawing(fileName);
}

async function handleOpen() {
    const fileList = await getDrawings();
    console.log("printing the array to populate ...");
    console.log(fileList);
    populateFileList(fileList);

    const modalElement = document.getElementById('fileListModal');
    const modal = new bootstrap.Modal(modalElement);

    const fileListSelect = document.getElementById('fileListSelect');
    let selectedFileName = null;

    fileListSelect.addEventListener('change', () => {
        selectedFileName = fileListSelect.value;
    });

    const selectButton = document.getElementById('selectFileButton');
    const cancelButton = document.querySelector('[data-bs-dismiss="modal"]');

    selectButton.addEventListener('click', () => {
        if (selectedFileName) {
            modal.hide();
            const selectedFile = fileList.find((file) => file.fileName === selectedFileName);
            const selectedJsondrw = selectedFile.jsondrw;
            console.log('Selected jsondrw file', selectedFile.fileName);
            console.log('Selected jsondrw:', selectedJsondrw);
            const selectedFileNameElement = document.getElementById('selectedFileName');
            selectedFileNameElement.textContent = selectedFileName;
            renderMindMap(selectedJsondrw);

        } else {
            alert('Please select a file.'); // Show an alert to prompt the user to select a file
        }
    });

    cancelButton.addEventListener('click', () => {
        selectedFileName = null;
        modal.hide();
    });

    modal.show();
}


async function getsessionid() {
    try {
        const response = await fetch('http://localhost:3000/api/getsession', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const responseData = await response.json();
            const { sessionID } = responseData;

            console.log('Session ID received:', sessionID);

        } else {
            console.error('Error getting session:', response.status);
        }
    } catch (error) {
        console.error('Error getting session:', error);
    }
}


async function sendChatMessage(message) {
    try {
        const response = await fetch('http://localhost:3000/api/sendprompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: message
            })
        });

        if (response.ok) {
            const responseData = await response.json();
            const {
                mindMapDataJson
            } = responseData;

            console.log('Received mind map data:', mindMapDataJson);
            //jsondrw = mindMapDataJson;

            jsondrw = calculateNodePositions(mindMapDataJson)
            console.log('Adjusted mind map data with positions:', jsondrw);

            renderMindMap(jsondrw);
        } else {
            console.error('Error sending chat message:', response.status);
        }
    } catch (error) {
        console.error('Error sending chat message:', error);
    }
}


async function saveDrawing() {
    // Get the file name from the input field
    const fileNameInput = document.getElementById('fileNameInput');
    const fileName = fileNameInput.value.trim();

    // Check if the user provided a file name
    if (fileName !== "") {
        console.log("Handle saving with file name:", fileName);

        // Remove the modal from the DOM
        const fileNameModal = bootstrap.Modal.getInstance(document.getElementById('fileNameModal'));
        fileNameModal.hide();
        document.body.removeChild(document.getElementById('fileNameModal'));

        // Proceed with saving using the file name
        try {
            const response = await fetch('http://localhost:3000/api/savedraw', {
                method: 'POST',
                body: JSON.stringify({
                    fileName: fileName,
                    jsondrw: jsondrw
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Drawing saved successfully');
                // Perform any necessary UI updates or redirects after successful saving
            } else {
                console.error('Failed to save drawing');
                // Handle the error and provide appropriate user feedback
            }
        } catch (error) {
            console.error('An error occurred:', error);
            // Handle the error and provide appropriate user feedback
        }
    } else {
        console.log("File name not provided. Saving canceled.");
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


// Function to populate the file list select options
function populateFileList(fileList) {
    const fileListSelect = document.getElementById('fileListSelect');

    fileList.forEach((file) => {
        const option = document.createElement('option');
        option.value = file.fileName;
        option.text = file.fileName;
        fileListSelect.appendChild(option);
    });
}

function calculateNodePositions(response) {
    const nodes = response.nodes;
    const relationships = response.relationships;

    const nodePositions = new Map(); // Map to store the calculated positions

    const nodeOrder = []; // Array to keep track of the node order

    // Sort nodes based on the order of source nodes appearing first
    nodes.sort((a, b) => {
        const aIsSource = relationships.some((relationship) => relationship.source === a.id);
        const bIsSource = relationships.some((relationship) => relationship.source === b.id);

        if (aIsSource && !bIsSource) {
            return -1;
        } else if (!aIsSource && bIsSource) {
            return 1;
        } else {
            return 0;
        }
    });

    // Calculate x and y positions for each node
    nodes.forEach((node, index) => {
        const rectWidth = node.label.length * 10 + 20; // Adjust the box width based on the text length
        const rectHeight = 50;

        const paddingX = 100; // Horizontal padding between nodes
        const paddingY = 100; // Vertical padding between nodes

        const row = Math.floor(index / 3); // Number of rows (adjust the value to control the layout)

        const x = (index % 3) * (rectWidth + paddingX); // Calculate x position
        const y = row * (rectHeight + paddingY); // Calculate y position

        node.x = x; // Set x position
        node.y = y; // Set y position

        nodePositions.set(node.id, { x, y }); // Store the calculated position

        nodeOrder.push(node.id); // Add node to the node order array
    });

    // Sort the nodes based on the node order
    nodes.sort((a, b) => nodeOrder.indexOf(a.id) - nodeOrder.indexOf(b.id));

    // Update the relationships with the calculated positions
    relationships.forEach((relationship) => {
        const sourcePosition = nodePositions.get(relationship.source);
        const targetPosition = nodePositions.get(relationship.target);

        relationship.x1 = sourcePosition.x; // Set x position for the relationship source
        relationship.y1 = sourcePosition.y; // Set y position for the relationship source
        relationship.x2 = targetPosition.x; // Set x position for the relationship target
        relationship.y2 = targetPosition.y; // Set y position for the relationship target
    });

    return response;
}