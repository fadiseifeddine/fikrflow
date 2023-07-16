let userInput = '';
let mindMapData = '';
let sessionID = ''; // Declare sessionID as a global variable
let selectedNode = null;
let isAddingRelation = false;
let sourceNode = null;

const drawingContainer = document.getElementById('drawingContainer');

function resizeDrawingContainer() {
    const windowHeight = window.innerHeight;
    const chatContainerHeight = document.getElementById('chatContainer').offsetHeight;
    drawingContainer.style.height = `${windowHeight - chatContainerHeight - 150}px`;
}

window.addEventListener('resize', resizeDrawingContainer);
resizeDrawingContainer();

getsessionid();


function getRightEdgeX(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const rect = node ? node.querySelector('rect') : null;
    return node && rect ? parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]) + parseFloat(rect.getAttribute('width')) : 0;
}



function getLeftEdgeX(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    return node ? parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]) : 0;
}

function getCenterY(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const rect = node ? node.querySelector('rect') : null;
    return node && rect ? parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]) + parseFloat(rect.getAttribute('height')) / 2 : 0;
}


function renderMindMap() {
    const mindMapContainer = document.getElementById('mindMapContainer');
    mindMapContainer.innerHTML = '';

    try {


        const svg = d3.select('#mindMapContainer');

        const nodes = svg
            .selectAll('.node')
            .data(mindMapData.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`) // Handle undefined coordinates
            .attr('id', (d) => `node-${d.id}`)
            .call(dragHandler)
            .on('click', (event, d) => selectNode(d.id));


        const rectNodes = nodes
            .append('rect')
            .attr('width', (d) => d.label.length * 10 + 20)
            .attr('height', 50)
            .attr('data-tag', 'rect');

        rectNodes
            .classed('completed', (d) => d.completed)
            .style('fill', (d) => (d.completed ? '#f2f2f2' : '#faffb8')); // Change the fill color based on the completed status

        // used in the edit box then get replaced
        const foreignObjects = nodes
            .append('foreignObject')
            .attr('x', 5)
            .attr('y', 12.5) // Adjust the y position to center the checkbox vertically
            .attr('width', 30) // Increase the width to make the checkbox at least twice as big
            .attr('height', 30); // Increase the height to make the checkbox at least twice as big

        const checkboxDivs = foreignObjects
            .append('xhtml:div')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .on('click', (event, d) => {
                event.stopPropagation(); // Prevent click event from bubbling to the parent nodes
            });

        checkboxDivs
            .append('input')
            .attr('type', 'checkbox')
            .attr('style', 'transform: scale(1.5)') // Scale the checkbox by a factor of 1.5
            .property('checked', (d) => d.completed)
            .on('change', (event, d) => toggleCompletion(mindMapData, d.id))
            .on('click', (event) => {
                event.stopPropagation(); // Prevent click event from bubbling to the parent nodes
            });

        nodes.classed('selected', (d) => d.id === selectedNode);

        nodes
            .append('text')
            .attr('x', (d) => (d.label.length * 10 + 20) / 2)
            .attr('y', 25)
            .text((d) => d.label)
            .attr('fill', (d) => (d.completed ? '#999999' : '#000')) // Change the text color based on the completed status
            .attr('text-decoration', (d) => (d.completed ? 'line-through' : 'none')) // Apply strike-through effect based on the completed status
            .attr('alignment-baseline', 'middle')
            .attr('data-tag', 'recttext'); // Add a data attribute to the rect element;

        nodes
            .append('circle')
            .attr('cx', 5)
            .attr('cy', 5)
            .attr('r', 10)
            .attr('fill', '#0000FF')
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 2);

        nodes
            .append('text')
            .attr('x', 6)
            .attr('y', 8)
            .text((d) => d.id)
            .attr('font-size', 10)
            .attr('fill', '#FFFFFF')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle');





        //d:     It represents the relationship object for which the curved path is being calculated. The relationship object contains information about the source node and the target node of the relationship.
        //nodes: It represents the selection of node elements in the SVG. It is used to access the node elements and retrieve their positions.
        //nodePositions: It represents a map that stores the calculated positions (x, y coordinates) of each node in the mind map. The map is used to retrieve the positions of the source and target nodes for calculating the curved path.



        // Append the <defs> element to the SVG
        const defs = svg.append('defs');

        // Create the arrowhead marker
        defs
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 0 10 10')
            .attr('refX', '10')
            .attr('refY', '5')
            .attr('markerUnits', 'strokeWidth')
            .attr('markerWidth', '6')
            .attr('markerHeight', '6')
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0 0 L 10 5 L 0 10 z')
            .attr('fill', '#000000');

        renderRelationships();




        svg.on('click', (event) => {
            if (!event.target || !event.target.closest('.node')) {
                selectNode(null);
            }
        });






        function dragHandler(selection) {
            const drag = d3.drag().on('start', dragStart).on('drag', dragMove);

            selection.call(drag);

            function dragStart(event, d) {
                d3.select(this).raise().classed('active', true);
            }



            function dragMove(event, d) {
                d3.select(this).attr('transform', `translate(${event.x - 50}, ${event.y - 25})`);

                const selectedNode = mindMapData.nodes.find((node) => node.id === d.id);
                if (selectedNode) {
                    selectedNode.x = event.x - 50;
                    selectedNode.y = event.y - 25;
                }

                console.log("node id" + d.id)
                console.log("selectedNode.x  and y" + selectedNode.x + ", " + selectedNode.y)
                console.log(mindMapData)

                renderMindMap();
            }

        }


        function updateSolidRelationships() {
            solidRelationships = svg
                .selectAll('.solid-relationship')
                .data(mindMapData.relationships.filter((relation) => relation.type === 'solid'));

            solidRelationships
                .enter()
                .append('line')
                .attr('class', 'solid-relationship')
                .merge(solidRelationships) // Merge enter and update selections
                .attr('x1', (d) => {
                    if (d.source.dragging) {
                        return d.source.x + getRightEdgeX(nodes, d.source);
                    } else {
                        return getRightEdgeX(nodes, d.source);
                    }
                })
                .attr('y1', (d) => {
                    if (d.source.dragging) {
                        return d.source.y + getCenterY(nodes, d.source);
                    } else {
                        return getCenterY(nodes, d.source);
                    }
                })
                .attr('x2', (d) => {
                    if (d.target.dragging) {
                        return d.target.x + getLeftEdgeX(nodes, d.target);
                    } else {
                        return getLeftEdgeX(nodes, d.target);
                    }
                })
                .attr('y2', (d) => {
                    if (d.target.dragging) {
                        return d.target.y + getCenterY(nodes, d.target);
                    } else {
                        return getCenterY(nodes, d.target)
                    }
                });


            solidRelationships.on("mouseover", function() {
                    console.log("overrrrrrrrrr");
                    d3.select(this).attr("class", "solid-relationship hover");
                })
                .on("mouseout", function() {
                    console.log("outtttttttt");
                    d3.select(this).attr("class", "solid-relationship");
                });

            solidRelationships.exit().remove();
        }

        function updateCurvedRelationships() {
            curvedRelationships = svg
                .selectAll('.dash-relationship')
                .data(mindMapData.relationships.filter((relation) => relation.type === 'dash'));

            curvedRelationships
                .enter()
                .append('line')
                .attr('class', 'dash-relationship')
                .merge(curvedRelationships) // Merge enter and update selections
                .attr('x1', (d) => {
                    if (d.source.dragging) {
                        return d.source.x + getRightEdgeX(nodes, d.source);
                    } else {
                        return getRightEdgeX(nodes, d.source);
                    }
                })
                .attr('y1', (d) => {
                    if (d.source.dragging) {
                        return d.source.y + getCenterY(nodes, d.source);
                    } else {
                        return getCenterY(nodes, d.source);
                    }
                })
                .attr('x2', (d) => {
                    if (d.target.dragging) {
                        return d.target.x + getLeftEdgeX(nodes, d.target);
                    } else {
                        return getLeftEdgeX(nodes, d.target);
                    }
                })
                .attr('y2', (d) => {
                    if (d.target.dragging) {
                        return d.target.y + getCenterY(nodes, d.target);
                    } else {
                        return getCenterY(nodes, d.target);
                    }
                }).on('mouseover', function() {
                    console.log('mouseover');
                    d3.select(this).attr('class', 'dash-relationship hover');
                })
                .on('mouseout', function() {
                    console.log('mouseout');
                    d3.select(this).attr('class', 'dash-relationship');
                });

            curvedRelationships.exit().remove();
        }

        // Update the renderRelationships() function as shown below
        function renderRelationships() {
            updateSolidRelationships();
            updateCurvedRelationships();

        }

    } catch (error) {
        console.error('Failed to render mind map:', error);
    }
}


// Function to handle checkbox toggle
function toggleCompletion(mindMapData, nodeId) {
    const node = mindMapData.nodes.find((node) => node.id === nodeId);
    if (node) {
        node.completed = !node.completed;
        if (node.completed) {
            node.compdate = Date.now(); // Set the compdate attribute to the current timestamp
        } else {
            node.compdate = null; // Clear the compdate attribute
        }
        renderMindMap();
    }
}


// Function to handle selecting a box =============================
function selectNode(nodeId) {

    console.log("Selecting a Node in graph ..." + nodeId);


    selectedNode = nodeId;
    renderMindMap(); // Re-render the mind map to apply the selection highlight

    const addButton = document.getElementById('addNodeButton');
    const editButton = document.getElementById('editButton');
    const deleteButton = document.getElementById('deleteButton');
    const relationButton = document.getElementById('addRelationButton');


    if (selectedNode) {
        addButton.disabled = false; // Enable the "Add Node" button
        editButton.disabled = false; // Enable the "Edit Node" button
        deleteButton.disabled = false; // Enable the "Delete Node" button
        relationButton.disabled = false;


    } else {
        addButton.disabled = true; // Disable the "Add Node" button
        editButton.disabled = true; // Enable the "Edit Node" button
        deleteButton.disabled = true; // Enable the "Delete Node" button
        relationButton.disabled = true;


    }

}

// Listeners =============================


document.getElementById('submitButton').addEventListener('click', handleInputSubmit);
document.getElementById('saveButton').addEventListener('click', handleInputSave);
document.getElementById('openButton').addEventListener('click', handleOpen);
document.getElementById('editButton').addEventListener('click', function() {
    handleRectEdit();
});
document.getElementById('addNodeButton').addEventListener('click', function() {
    handleAddNode();
});
document.getElementById('addRelationButton').addEventListener('click', function() {
    handleAddRelation();
});

function handleAddRelation() {
    const relationshipButton = document.getElementById('addRelationButton');

    const sourceNode = selectedNode;

    // Prompt the user to click the target node
    console.log('Please click the target node');


    // Listen for the click event on the mind map container for the target node
    const mindMapContainer = document.getElementById('mindMapContainer');
    mindMapContainer.addEventListener('click', handleTargetNodeClick);

    // Function to handle the click on the target node
    function handleTargetNodeClick(event) {
        const clickedNode = event.target.closest('.node');

        // Check if a valid target node was clicked and it's not the source node
        if (clickedNode && clickedNode.id && clickedNode.id !== `node-${sourceNode}`) {
            const newRelationship = {
                source: sourceNode,
                target: clickedNode.id.replace('node-', ''),
                type: 'dash'
            };

            // Add the new relationship to the mind map data
            mindMapData.relationships.push(newRelationship);

            // Re-render the mind map to show the new relationship
            renderMindMap();


            // Remove the click event listener from the target node
            mindMapContainer.removeEventListener('click', handleTargetNodeClick);

            // Deactivate the relationship button
            relationshipButton.classList.remove('active');
        }
    }

}


function getCurvedPath(relationship, nodes, nodePositions) {
    const sourcePosition = nodePositions.get(relationship.source);
    const targetPosition = nodePositions.get(relationship.target);

    const startX = getRightEdgeX(nodes, relationship.source);
    const startY = getCenterY(nodes, relationship.source);
    const endX = getLeftEdgeX(nodes, relationship.target);
    const endY = getCenterY(nodes, relationship.target);

    const curveX = startX + (endX - startX) / 2;
    const curveY = startY + (endY - startY) * 0.5;

    return `M ${startX},${startY} Q ${curveX},${curveY} ${endX},${endY}`;
}

function handleAddNode() {
    console.log("handleAddNode .... Start")
    if (selectedNode && mindMapData && mindMapData.nodes && mindMapData.nodes.length > 0) {
        const newNodeId = `s${mindMapData.nodes.length + 1}`;
        const selectedNodeData = mindMapData.nodes.find((node) => node.id === selectedNode);

        if (selectedNodeData) {
            const existingChildrenCount = selectedNodeData.children ? selectedNodeData.children.length : 0;
            const newNodeX = selectedNodeData.x + (existingChildrenCount + 1) * 100; // Adjust the x position of the new node

            // Find the next available position for the new node
            let nextX = newNodeX;
            while (mindMapData.nodes.some((node) => node.x === nextX && node.y === selectedNodeData.y + 100)) {
                nextX += 100;
            }

            const newNode = {
                id: newNodeId,
                label: 'Edit',
                color: selectedNodeData.color,
                textColor: selectedNodeData.textColor,
                x: nextX,
                y: selectedNodeData.y + 100, // Adjust the y position of the new node
                children: [],
            };

            mindMapData.nodes.push(newNode);
            mindMapData.relationships.push({
                source: selectedNode,
                target: newNodeId,
                type: 'solid'
            });

            selectedNode = newNodeId; // Select the new node

            // Re-render the mind map with the updated data
            renderMindMap();
        }
    }
}




function handleRectEdit() {
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

            inputElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    inputElement.blur(); // Trigger blur event to save the entered text
                }
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
            mindMapData = selectedJsondrw
            renderMindMap();

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

            mindMapData = calculateNodePositions(mindMapDataJson)
            console.log('Adjusted mind map data with positions:', mindMapData);

            renderMindMap();
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
                    jsondrw: mindMapData
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