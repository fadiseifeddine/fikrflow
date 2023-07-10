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
            .attr('transform', (d) => `translate(${Math.random() * 600}, ${Math.random() * 400})`)
            .call(dragHandler)
            .on('click', (event, d) => selectNode(d.id)); // Attach click event listener to select the box


        nodes.append('rect')
            .attr('width', (d) => d.label.length * 10 + 20) // Adjust the box width based on the text length
            .attr('height', 50)
            .attr('fill', (d) => d.color)
            .attr('stroke', (d) => d.textColor);

        nodes.classed('selected', (d) => d.id === selectedNode);

        nodes.append('text')
            .attr('x', (d) => (d.label.length * 10 + 20) / 2) // Center the text horizontally
            .attr('y', 25)
            .text((d) => d.label)
            .attr('fill', '#000')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle');

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
            .attr('x1', (d) => getCenterX(nodes, d.from))
            .attr('y1', (d) => getCenterY(nodes, d.from))
            .attr('x2', (d) => getCenterX(nodes, d.to))
            .attr('y2', (d) => getCenterY(nodes, d.to));

        function dragHandler(selection) {
            const drag = d3.drag()
                .on('start', dragStart)
                .on('drag', dragMove);

            selection.call(drag);

            function dragStart(event, d) {
                d3.select(this).raise().classed('active', true);
            }

            function dragMove(event, d) {
                d3.select(this)
                    .attr('transform', `translate(${event.x - 50}, ${event.y - 25})`);

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
                .attr('x1', (d) => getCenterX(nodes, d.from))
                .attr('y1', (d) => getCenterY(nodes, d.from))
                .attr('x2', (d) => getCenterX(nodes, d.to))
                .attr('y2', (d) => getCenterY(nodes, d.to));
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

// Function to handle editing the text of a selected box
function editSelectedBoxText() {
    if (selectedNodeId) {
        const textElement = d3.select(`#${selectedNodeId} text`);
        const newText = prompt('Enter new text:', textElement.text());
        if (newText !== null) {
            textElement.text(newText);

            // Update the mindMapData with the new text
            const selectedNode = mindMapData.nodes.find((node) => node.id === selectedNodeId);
            if (selectedNode) {
                selectedNode.label = newText;
            }

            // Render the updated mind map
            renderMindMap(mindMapData);
        }
    }
}


// Listeners =============================


document.getElementById('submitButton').addEventListener('click', handleInputSubmit);
document.getElementById('saveButton').addEventListener('click', handleInputSave);
document.getElementById('openButton').addEventListener('click', handleOpen);
document.getElementById('editButton').addEventListener('click', handleEdit);




function handleEdit() {
    console.log(" In handle Edit ...");
    if (selectedNodeId) {
        console.log(" Node Selected ...");

        const textElement = d3.select(`#${selectedNodeId} text`);
        const newText = prompt('Enter new text:', textElement.text());
        if (newText !== null) {
            textElement.text(newText);

            // Update the mindMapData with the new text
            const selectedNode = mindMapData.nodes.find((node) => node.id === selectedNodeId);
            if (selectedNode) {
                selectedNode.label = newText;
            }

            // Render the updated mind map
            renderMindMap(mindMapData);
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
            jsondrw = mindMapDataJson;
            renderMindMap(mindMapDataJson);
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