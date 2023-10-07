// Import everything from common.js as a module
import * as common from './common.js';
import * as fikruser from './fikruser.js';
import * as fikrdraw from './fikrdraw.js';
import * as fikrcollab from './fikrcollab.js';

let mindMapData = '';
let userInput = '';
let selectedNode = null;
let sourceNode = null;
let ismodified = 0;
let svg = null;

// Define a variable for the icon size (adjust as needed)
const iconSize = 24; // You can change this value to control the icon size

// Box itself
let rectWidth = 250;
let rectHeight = 50;

// Parallelogram
let plgrmWidth = 250; // Set the width for the Parallelogram shape
let plgrmHeight = 50; // Set the height for the Parallelogram shape

// Diamond
let diamondWidth = 300; // Set the width for the diamond shape
let diamondHeight = 75; // Set the height for the diamond shape


let cornerRadius = 10; // Adjust the corner radius as needed
// Define the ellipse dimensions
let ellipseRx = 120; // Set the horizontal radius of the ellipse
let ellipseRy = 40; // Set the vertical radius of the ellipse

let textlength = 28;

// Calculate the coordinates of the parallelogram points
var angleDegrees = 85
var angleRadians = (angleDegrees * Math.PI) / 180;
var yOffset = (plgrmWidth / Math.tan(angleRadians)) / 2;

// relationship Box
let relationshipToolBoxRef;
let selectedLine = null;
let relationshipToolBoxWidth = 160;
let relationshipToolBoxHeight = 100;

let BoxToolBoxRef;
let boxToolBoxWidth = 160;
let boxToolBoxHeight = 100;

let BoxShapeBoxRef;
let boxShapeBoxWidth = 180;
let boxShapeBoxHeight = 80;


let BoxIconBoxRef;
let boxIconBoxWidth = 180;
let boxIconBoxHeight = 100;

// Define the desired spacing between nodes
const spacingBetweenNodes = 20; // Adjust as needed


// 3dot Button
let dotCircle = null; // Define the variable to hold the dot circle element
let dotsText = null;

let nodes = null;

let addingrel = false;
let addingrelsource = null;
let addingreltarget = null;

// Define global variables to keep track of history and current version
let currentVersion = 0;

// The Edit Page Attribute Container
let ndid = null;
let ndshortDescription = null;
let ndlongDescription = null;
let ndicon = null;
let ndcompleted = null;
let ndcompletionDateTime = null;

// Initialize button states (all buttons dimmed by default)
let starButtonDimmed = false;
let heartButtonDimmed = false;
let smileyButtonDimmed = false;




const drawingContainer = document.getElementById('drawingContainer');

// Modal for Saving the Drawing under a File Name
const fileNameModal = new bootstrap.Modal(document.getElementById('fileNameModal'));
// Save Confirmation of the File
const saveconfirmationModal = new bootstrap.Modal(document.getElementById("saveconfirmationModal"));



// the File Name of the Drawing
const selectedFileNameElement = document.getElementById('selectedFileName');

// Initialize the dropdown
var dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'))
var dropdownList = dropdownElementList.map(function(dropdownToggleEl) {
    return new bootstrap.Dropdown(dropdownToggleEl)
})


// Retrieve the session ID when the page loads
window.addEventListener('load', async() => {
    try {
        await common.retrieveSessionId(fikruser.getUserId())
            .then(() => {
                const vsessionID = common.getSessionId();
                if (!vsessionID) {
                    // Handle the case where no session ID is retrieved
                    alert('Error: No session ID');
                }
            });
    } catch (error) {
        // Handle any errors that occur during session retrieval
        console.error('Error retrieving session:', error);
        alert('Error: Failed to retrieve session ID');
    }
});


document.addEventListener('DOMContentLoaded', function() {

    const dragDropArea = document.getElementById("dragDropArea");

    dragDropArea.addEventListener("dragover", function(event) {
        event.preventDefault();
        dragDropArea.classList.add("drag-over");
    });

    dragDropArea.addEventListener("dragleave", function() {
        dragDropArea.classList.remove("drag-over");
    });

    dragDropArea.addEventListener("drop", function(event) {
        event.preventDefault();
        dragDropArea.classList.remove("drag-over");
        const files = event.dataTransfer.files;
        handleFiles(files);
    });
});


// Handle click event on importxlsdropdown element
document.getElementById('importxls').addEventListener('click', function() {
    var importXlsModal = new bootstrap.Modal(document.getElementById('importxls'), {
        backdrop: true
    });
    importXlsModal.show();
});

// Handle click event on importxlsdropdown element
document.getElementById('exportxls').addEventListener('click', function() {
    generateXLSX(mindMapData);
});

// Add a click event listener to the drawingContainer
drawingContainer.addEventListener('click', function(event) {
    // Call the selectNode(null) function when the container is clicked
    selectNode(null);
});



// MAINNNNNNNNNNNNNNNNNNNNNNN
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

            //console.log('Received mind map data:', mindMapDataJson);
            //jsondrw = mindMapDataJson;

            mindMapData = calculateNodePositions(mindMapDataJson)
                //console.log('Adjusted mind map data with positions:', mindMapData);
            takeSnapshot(mindMapData); // the version 1
            renderMindMap(mindMapData);
        } else {
            console.error('Error sending chat message:', response.status);
        }
    } catch (error) {
        console.error('Error sending chat message:', error);
    }
}
//////////////////////

function handleDragOver(event) {
    event.preventDefault();
    dragDropArea.classList.add("drag-over");
}

function handleDragLeave() {
    dragDropArea.classList.remove("drag-over");
}

function handleDrop(event) {
    //console.log("In handleDrop ...... ");
    event.preventDefault();
    dragDropArea.classList.remove("drag-over");
    const files = event.dataTransfer.files;
    handleFiles(files);
}

async function handleFiles(files) {
    const file = files[0];
    if (
        file.type === "application/vnd.ms-excel" ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx")
    ) {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch('http://localhost:3000/api/upload', {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                //console.log(data.message); // Log the server's response
                //console.log('Hiding the Modal ....');
                $('#fileNameModal').modal('hide');
                const importxlsModal = bootstrap.Modal.getInstance(document.getElementById('importxls'));
                importxlsModal.hide();
            } else {
                console.error("Error uploading the file:", response.statusText);
            }
        } catch (error) {
            console.error("Error uploading the file:", error);
        }
    } else {
        alert("Please upload a valid XLS or XLSX file.");
    }
}


function resizeDrawingContainer() {
    const windowHeight = window.innerHeight;
    const chatContainerHeight = document.getElementById('chatContainer').offsetHeight;
    drawingContainer.style.height = `${windowHeight - chatContainerHeight - 150}px`;
}

window.addEventListener('resize', resizeDrawingContainer);
resizeDrawingContainer();


function getBottomEdgeY(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const shape = node ? node.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]') : null;

    if (shape) {
        if (shape.getAttribute('data-tag') === 'ellipse') {
            const cy = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]);
            const ry = parseFloat(shape.getAttribute('ry'));
            return cy + ry; // Return the bottom edge y-coordinate of the ellipse
        } else if (shape.getAttribute('data-tag') === 'rect') {
            const height = parseFloat(shape.getAttribute('height'));
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + height; // Return the bottom edge y-coordinate of the rectangle
        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
            const height = parseFloat(shape.getAttribute('height'));
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + height; // Return the bottom edge y-coordinate of the parallelogram
        } else if (shape.getAttribute('data-tag') === 'diamond') {
            //console.log("bottom diamond shape = ", shape);

            const height = parseFloat(shape.getAttribute('height'));
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + height / 2; // Return the bottom edge y-coordinate of the diamond
        } else {
            const height = parseFloat(shape.getAttribute('height'));
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]); // Return the top edge y-coordinate of the rectangle
        }
    }
    return 0;
}

function getTopEdgeY(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const shape = node ? node.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]') : null;

    if (shape) {
        if (shape.getAttribute('data-tag') === 'ellipse') {
            const cy = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]);
            const ry = parseFloat(shape.getAttribute('ry'));
            return cy - ry; // Return the top edge y-coordinate of the ellipse
        } else if (shape.getAttribute('data-tag') === 'rect') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]); // Return the top edge y-coordinate of the rectangle
        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]); // Return the top edge y-coordinate of the parallelogram
        } else if (shape.getAttribute('data-tag') === 'diamond') {
            //console.log("top diamond shape = ", shape);
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) - height / 2; // Return the top edge y-coordinate of the diamond
        } else {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]); // Return the top edge y-coordinate of the rectangle
        }
    }
    return 0;
}

function getRightEdgeX(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const shape = node ? node.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]') : null;

    if (shape) {
        if (shape.getAttribute('data-tag') === 'ellipse') {
            const cx = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
            const rx = parseFloat(shape.getAttribute('rx'));
            return cx + rx;
        } else if (shape.getAttribute('data-tag') === 'rect') {
            const width = parseFloat(shape.getAttribute('width'));
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]) + width;
        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
            const width = parseFloat(shape.getAttribute('width'));
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]) + width;
        } else if (shape.getAttribute('data-tag') === 'diamond') {
            const width = parseFloat(shape.getAttribute('width'));
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]) + width; // Right edge X-coordinate of the diamond
        } else {
            const width = parseFloat(shape.getAttribute('width'));
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]) + width;
        }
    }
    return 0;
}

function getLeftEdgeX(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const shape = node ? node.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"], [data-tag="diamond"]') : null;

    if (shape) {
        if (shape.getAttribute('data-tag') === 'ellipse') {
            const cx = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
            const rx = parseFloat(shape.getAttribute('rx'));
            return cx - rx - 10;
        } else if (shape.getAttribute('data-tag') === 'rect') {
            const x = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
            const arrowWidth = parseFloat(arrowhead.getAttribute('markerWidth'));
            return x + arrowWidth / 2 - 10;
        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
            const x = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
            const arrowWidth = parseFloat(arrowhead.getAttribute('markerWidth'));
            const leftEdgeX = x + arrowWidth / 2;
            //console.log("parallelo leftEdgeX =", leftEdgeX);
            return leftEdgeX;
        } else if (shape.getAttribute('data-tag') === 'diamond') {
            const x = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
            // console.log("diamond x =", x);
            return x;
            // const width = parseFloat(shape.getAttribute('width'));
            // const leftEdgeX = x - width / 2 - 10;
            // console.log("diamond leftEdgeX =", leftEdgeX);
            // return leftEdgeX;
        } else {
            const x = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
            const arrowWidth = parseFloat(arrowhead.getAttribute('markerWidth'));
        }
    }
    return 0;
}


function getCenterX(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const shape = node ? node.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"], [data-tag="diamond"]') : null;

    if (shape) {
        if (shape.getAttribute('data-tag') === 'ellipse') {
            const cx = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
            return cx;
        } else if (shape.getAttribute('data-tag') === 'rect') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
        } else if (shape.getAttribute('data-tag') === 'diamond') {
            //console.log("centerX diamond shape = ", shape);

            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[0]);
        }
    }
    return 0;
}

function getCenterY(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const shape = node ? node.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"], [data-tag="diamond"]') : null;

    if (shape) {
        if (shape.getAttribute('data-tag') === 'ellipse') {
            const cy = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]);
            const ry = parseFloat(shape.getAttribute('ry'));
            return cy;
        } else if (shape.getAttribute('data-tag') === 'rect') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + rectHeight / 2;
        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + plgrmHeight / 2;
        } else if (shape.getAttribute('data-tag') === 'diamond') {
            //console.log("centerY diamond shape = ", shape);
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + diamondHeight / 2;
            //return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]); // Center Y-coordinate of the diamond
        }
    }
    return 0;
}



function renderMindMap(mindMapData) {
    console.log("Rendering the mindMapData start ...");
    const mindMapContainer = document.getElementById('mindMapContainer');
    mindMapContainer.innerHTML = '';

    try {

        const width = mindMapContainer.clientWidth;
        const height = mindMapContainer.clientHeight;

        // Create the SVG element
        svg = d3.select('#mindMapContainer')
            .append('svg')
            .attr('width', width)
            .attr('height', height);



        svg.append('svg:defs').append('svg:marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 3) // Set refX to half of the marker width
            .attr('markerWidth', 6)
            .attr('markerHeight', 5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', 'black') // Arrow fill color is black
            .attr('stroke', 'white') // Add a white stroke to the arrow
            .attr('stroke-width', 1); // Set the stroke width as needed


        // Define a custom force to avoid overlap between relationships
        function avoidOverlapForce(strength = 0.1) {
            function force(alpha) {
                mindMapData.relationships.forEach((relation) => {
                    const sourceNode = mindMapData.nodes.find((node) => node.id === relation.source);
                    const targetNode = mindMapData.nodes.find((node) => node.id === relation.target);

                    if (sourceNode && targetNode) {
                        // Calculate the position of the relationship based on source and target node positions
                        const sourceX = sourceNode.x;
                        const targetX = targetNode.x;
                        const sourceY = sourceNode.y;
                        const targetY = targetNode.y;

                        // Calculate the midpoint between source and target nodes
                        const midX = (sourceX + targetX) / 2;
                        const midY = (sourceY + targetY) / 2;

                        // Adjust the position based on node shapes and sizes
                        // You can use the same logic you used for the nodes to determine offsets
                        // For example, if sourceNode is a parallelogram, you can adjust midX and midY accordingly

                        // Update the position of the relationship
                        relation.x = midX;
                        relation.y = midY;
                    }
                });
            }

            return force;
        }

        // Add the custom force to your simulation
        const simulation = d3
            .forceSimulation(mindMapData.nodes)
            .force('center', d3.forceCenter(mindMapContainer.clientWidth / 2, mindMapContainer.clientHeight / 2))
            .force('collision', d3.forceCollide()
                .strength(0.2) // Adjust the strength value as needed
                .radius((d) => (d.shape === 'ellipse' ? ellipseRx : d.shape === 'parallelogram' ? plgrmWidth / 2 : d.shape === 'diamond' ? diamondWidth / 2 : rectWidth / 2) + spacingBetweenNodes)
            ).force('collide', d3.forceCollide().radius( /* specify the desired separation radius */ ))
            .force('avoidOverlapRelationships', avoidOverlapForce(0.2)) // Adjust the strength value as needed
            .on('tick', ticked);





        function ticked() {
            nodes.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
            renderRelationships();
            // Also update the links (curved paths) here if you have them
        }




        nodes = svg
            .selectAll('.node')
            .data(mindMapData.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`) // Handle undefined coordinates
            .attr('id', (d) => `${d.id}`)
            .call(dragHandler);



        var plgrmpoints = [
            { x: 0, y: 0 },
            { x: plgrmWidth - yOffset, y: 0 },
            { x: plgrmWidth, y: plgrmHeight },
            { x: yOffset, y: plgrmHeight }
        ];


        // Calculate the coordinates of the diamond points
        var diamondpoints = [
            { x: diamondWidth / 2, y: 0 },
            { x: diamondWidth, y: diamondHeight / 2 },
            { x: diamondWidth / 2, y: diamondHeight },
            { x: 0, y: diamondHeight / 2 }
        ];

        const scaleX = 4; // Scale factor for horizontal scaling
        const scaleY = 0; // Scale factor for vertical scaling



        const rectNodes = nodes
            //.append('rect')
            .append((d) => {
                // If shape is 'ellipse', create an ellipse element; if 'parallelogram', create a parallelogram element; otherwise, create a rect element
                if (d.shape === 'ellipse') {
                    return document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                } else if (d.shape === 'parallelogram') {
                    // Create a path for the parallelogram
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute("d", "M" + plgrmpoints.map(p => `${p.x},${p.y}`).join("L") + "Z");
                    path.setAttribute("stroke", "red");
                    path.setAttribute("stroke-width", "2");
                    path.setAttribute("fill", "none");
                    // Append the path directly to the SVG container
                    //svgContainer.appendChild(path);
                    return path;
                } else if (d.shape === 'diamond') {
                    // Create a path for the diamond
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute("d", "M" + diamondpoints.map(p => `${p.x},${p.y}`).join("L") + "Z");
                    path.setAttribute("stroke", "red");
                    path.setAttribute("stroke-width", 2);
                    path.setAttribute("fill", "none");
                    // Append the path directly to the SVG container
                    //svgContainer.appendChild(path);
                    return path;
                } else {
                    return document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                }
            })
            .attr('transform', (d) => { // position of shape
                if (d.shape === 'parallelogram') {
                    //return `translate(${-plgrmWidth/2 - 10 }, ${-plgrmHeight*3})`;
                    return null;
                } else {
                    return null;
                }
            })
            .attr('width', (d) => {
                if (d.shape === 'ellipse') {
                    return ellipseRx * 2;
                } else if (d.shape === 'parallelogram') {
                    //console.log("setting the width to rectWidth....")
                    return plgrmWidth; // Set the width of the parallelogram shape
                } else if (d.shape === 'diamond') {
                    //console.log("setting the width to rectWidth....")
                    return diamondWidth; // Set the width of the diamond shape
                } else {
                    return rectWidth;
                }
            })
            .attr('height', (d) => {
                if (d.shape === 'ellipse') {
                    return ellipseRy * 2;
                } else if (d.shape === 'parallelogram') {
                    //console.log("setting the height to rectHeight....")
                    return plgrmWidth; // Set the height of the parallelogram shape
                } else {
                    return rectHeight;
                }
            })
            .attr('rx', (d) => {
                if (d.shape === 'ellipse') {
                    return ellipseRx;
                } else if (d.shape === 'parallelogram') {
                    return 0; // No rounded corners for parallelogram shape
                } else if (d.shape === 'diamond') {
                    return 0; // No rounded corners for diamond shape
                } else {
                    return cornerRadius;
                }
            })
            .attr('ry', (d) => {
                if (d.shape === 'ellipse') {
                    return ellipseRy;
                } else if (d.shape === 'parallelogram') {
                    return 0; // No rounded corners for parallelogram shape
                } else if (d.shape === 'diamond') {
                    return 0; // No rounded corners for diamond shape
                } else {
                    return cornerRadius;
                }
            })
            .attr('data-tag', (d) => (d.shape === 'ellipse' ? 'ellipse' : d.shape === 'parallelogram' ? 'parallelogram' : d.shape === 'diamond' ? 'diamond' : 'rect'))
            .attr("stroke-width", (d) => d.strokewidth);

        //.attr('width', (d) => d.label.length * 10 + 20)
        //.attr('height', 50)




        rectNodes
            .classed('completed', (d) => d.completed)
            .style('fill', (d) => {
                //console.log(`Node ID: ${d.id}, Completed: ${d.completed}`);
                return d.completed ? '#D3D3D3' : d.fill;
                // Completed True then 
            });
        // used in the edit box then get replaced // checkbox position
        // Modify the positioning of foreignObjects (checkboxes) and text
        // checknode position
        const foreignObjects = nodes
            .append('foreignObject')
            .attr('x', (d) => {
                if (d.shape === 'ellipse') {
                    return -ellipseRx + 15;
                } else if (d.shape === 'parallelogram') {
                    return 5
                } else if (d.shape === 'diamond') {
                    return diamondWidth / 4 - 40
                } else {
                    return 1;
                }
            })
            .attr('y', (d) => {
                if (d.shape === 'ellipse') {
                    return -15;
                } else if (d.shape === 'parallelogram') {
                    return 12.5;
                } else if (d.shape === 'diamond') {
                    return diamondHeight / 2 - 15;
                } else {
                    return 12.5;
                }
            })
            .attr('width', (d) => {

                return 30;
            })
            .attr('height', 30);

        const checkboxDivs = foreignObjects
            .append('xhtml:div')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center');

        checkboxDivs
            .append('input')
            .attr('type', 'checkbox')
            .attr('style', 'transform: scale(1.5)') // Scale the checkbox by a factor of 1.5
            .property('checked', (d) => d.completed)
            .on('change', (event, d) => toggleCompletion(mindMapData, d.id));


        // make selected nodes highlighted
        nodes.classed('selected', (d) => d.id === selectedNode);

        // text position
        const nodeText = nodes // text shape position
            .append('text')
            .attr("class", "pointer-cursor")
            .attr('x', (d) => {
                if (d.shape === 'ellipse') {
                    return -75;
                } else if (d.shape === 'parallelogram') {
                    return 35;

                } else if (d.shape === 'diamond') {
                    return 65;

                } else
                    return 30;
            })
            .attr('y', (d) => {
                if (d.shape === 'ellipse') {
                    return 0; // For ellipse and parallelogram, keep the y-coordinate at the center
                } else if (d.shape === 'parallelogram') {
                    return plgrmHeight / 2 + 4; // For rectangle, adjust the y-coordinate to be vertically centered within the rectangle

                } else if (d.shape === 'diamond') {
                    return diamondHeight / 2; // For rectangle, adjust the y-coordinate to be vertically centered within the rectangle

                } else {
                    return rectHeight / 2 + 3; // For rectangle, adjust the y-coordinate to be vertically centered within the rectangle
                }
            })
            .text((d) => d.label.substring(0, textlength))
            .attr('fill', (d) => (d.completed ? '#999999' : '#000'))
            .attr('text-decoration', (d) => (d.completed ? 'line-through' : 'none'))
            .style('text-anchor', 'start') // Change 'middle' to 'start' to left-align the text
            .attr('data-tag', (d) => {
                if (d.shape === 'ellipse') {
                    return 'ellipsetext';
                } else if (d.shape === 'parallelogram') {
                    return 'parallelogramtext';
                } else if (d.shape === 'diamond') {
                    return 'diamondtext';
                } else {
                    return 'recttext';
                }
            }); // Add a data attribute to the nodeText element

        // node id position circle + id text
        nodes
            .append('circle')
            .attr('cx', (d) => {
                if (d.shape === 'ellipse') {
                    // For ellipses, move the circle to the left side
                    return -ellipseRx + 10; // Adjust the value as needed
                } else if (d.shape === 'parallelogram') {
                    // For parallelogram, move the circle to the left side
                    return 5; // For rectangles, keep the x-coordinate as it was
                } else if (d.shape === 'diamond') {
                    // For parallelogram, move the circle to the left side
                    return 5; // For rectangles, keep the x-coordinate as it was
                } else {
                    return 5; // For rectangles, keep the x-coordinate as it was
                }
            })
            .attr('cy', (d) => {
                if (d.shape === 'ellipse') {
                    // For ellipses, move the circle up to the top side
                    return -ellipseRy + 10; // Adjust the value as needed
                } else if (d.shape === 'parallelogram') {
                    // For parallelogram, move the circle to the top side
                    return 5; // For rectangles and other shapes, keep the y-coordinate as it was
                } else if (d.shape === 'diamond') {
                    // For diamond, move the circle to the top side
                    return 20; // For rectangles and other shapes, keep the y-coordinate as it was
                } else {
                    return 5; // For rectangles and other shapes, keep the y-coordinate as it was
                }
            })
            .attr('r', 10) // Set the radius for the circle
            .attr('fill', '#0000FF') // Set the fill color
            .attr('stroke', '#FFFFFF') // Set the stroke color
            .attr('stroke-width', 2); // Set the stroke width




        nodes
            .append('text')
            .attr('x', (d) => {
                if (d.shape === 'ellipse') {
                    // For ellipses, move the text to the left side
                    return -ellipseRx + 10; // Adjust the value as needed
                } else if (d.shape === 'parallelogram') {
                    // For parallelogram, move the text to the left side
                    return 6; // For rectangles, keep the x-coordinate as it was
                } else if (d.shape === 'diamond') {
                    // For diamond, move the text to the left side
                    return 5; // For rectangles, keep the x-coordinate as it was
                } else {
                    return 6; // For rectangles, keep the x-coordinate as it was
                }
            })
            .attr('y', (d) => {
                if (d.shape === 'ellipse') {
                    // For ellipses, move the text up to the top side
                    return -ellipseRy + 13; // Adjust the value as needed
                } else if (d.shape === 'parallelogram') {
                    // For parallelogram, move the text to the top side
                    return 8; // For rectangles and other shapes, keep the y-coordinate as it was
                } else if (d.shape === 'diamond') {
                    // For diamond, move the text to the top side
                    return 20; // For rectangles and other shapes, keep the y-coordinate as it was
                } else {
                    return 8; // For rectangles and other shapes, keep the y-coordinate as it was
                }
            })
            .text((d) => d.id)
            .attr('font-size', 10)
            .attr('fill', '#FFFFFF')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle');

        // Create a new SVG group for nodeIcons on the right of existing nodeCircles
        // icon positions
        const nodeIcons = nodes
            .append('g')
            .attr('class', 'node-icon')
            .attr('transform', (d) => {
                if (d.shape === 'ellipse') {
                    return `translate(${ellipseRx / 2 + 25}, ${-ellipseRy / 2 + 5})`; // Top right corner of ellipse
                } else if (d.shape === 'parallelogram') {
                    return `translate(${plgrmWidth -45}, ${-plgrmHeight / 2+35})`; // Top right corner of parallelogram
                } else if (d.shape === 'diamond') {
                    return `translate(${diamondWidth / 2 - 10}, ${-diamondHeight / 2+30})`; // Top right corner of diamond
                } else {
                    return `translate(${rectWidth -30}, ${-rectHeight / 2 + 35})`; // Top right corner of rectangle
                }
            });
        // Append a foreignObject element within the nodeIcons group for the icon
        nodeIcons
            .append('foreignObject')
            .attr('width', iconSize) // Set the width of the foreignObject for the icon
            .attr('height', iconSize) // Set the height of the foreignObject for the icon
            .html((d) => {
                switch (d.icon) {
                    case 'smily':
                        return `<i class="bi bi-emoji-smile" style="font-size: ${iconSize}px;"></i>`;
                    case 'heart':
                        return `<i class="bi bi-heart" style="font-size: ${iconSize}px;"></i>`;
                    case 'star':
                        return `<i class="bi bi-star" style="font-size: ${iconSize}px;"></i>`;
                }
            });

        // Create a circle background for the icon
        nodeIcons
            .append('circle')
            .attr('cx', iconSize / 2) // Adjust the center X-coordinate based on icon size
            .attr('cy', iconSize / 2) // Adjust the center Y-coordinate based on icon size
            .attr('r', iconSize / 2) // Set the radius based on icon size
            .attr('fill', 'transparent') // Set the fill to transparent
            .attr('stroke', 'transparent'); // Set the stroke to transparent
        //d:     It represents the relationship object for which the curved path is being calculated. The relationship object contains information about the source node and the target node of the relationship.
        //nodes: It represents the selection of node elements in the SVG. It is used to access the node elements and retrieve their positions.
        //nodePositions: It represents a map that stores the calculated positions (x, y coordinates) of each node in the mind map. The map is used to retrieve the positions of the source and target nodes for calculating the curved path.


        ApplyFilterOnNodes();


        renderBoxToolBox();

        //console.log("To Render Relationships ....");
        // After creating the nodes and starting the simulation, update the relationships
        renderRelationships();

        // Change the order
        // Now, after creating and updating the relationships and nodes, adjust the SVG stack
        // to ensure that nodes appear on top of relationships
        svg.selectAll('.node').each(function() {
            const node = this;
            const parentNode = node.parentNode;
            parentNode.appendChild(node); // Move the node to the end of its parent (SVG) to bring it to the front
        });

        // adding the ToolBox on top
        renderRelationToolBox();
        svg.selectAll('.box-toolbox-box').each(function() {
            const node = this;
            const parentNode = node.parentNode;
            parentNode.appendChild(node); // Move the node to the end of its parent (SVG) to bring it to the front
        });

        nodes.on("mouseover", function(event, d) {
            // console.log("A- OVERRRRRR NODES");
            //event.stopPropagation(); // Stop the mousedown event from propagating
            //d3.select(this).attr("class", "solid-relationship hover");
            ToggleButtons(event, d);
        })


        // Add the mousedown event listener to the parent container
        // the click didn't fire on the first time / it is binding on first and firing on second
        rectNodes.on('mousedown', function(event) {
            //         console.log('LLLL2-Node clicked:');
            const clickedNode = event.target.closest('.node');
            //         console.log('LLLL3-Node clicked:', clickedNode.id);
            selectNode(clickedNode.id);

        });




        // Add the mousedown event listener to the parent container
        // the click didn't fire on the first time / it is binding on first and firing on second
        nodeText.on('mousedown', function(event) {
            // console.log('LLLL2-Node clicked:');
            const clickedNode = event.target.closest('.node');
            //   console.log('LLLL3-Node clicked:', clickedNode.id);
            selectNode(clickedNode.id);
        });


        svg.on('click', (event) => {
            //console.log("B - SVG CLICK");

            const targetClass = event.target.getAttribute("class");
            //console.log("Target Class = " + targetClass);

            if (targetClass === 'solid-relationship hover' || targetClass === 'dash-relationship hover') {
                // console.log("Hitting line, do nothing");
                return;
            } else {
                // console.log("Clicked outside nodes, deselecting...");
                selectNode(null);
            }

            // if (!event.target || !event.target.closest('.node')) {
            //     console.log("going with null selection")
            //     selectNode(null);
            // }
        });




        function dragHandler(selection) {

            const drag = d3.drag()
                .on('start', dragStart)
                .on('drag', dragMove)
                .on('end', dragEnd); // Add drag end event handler

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

                // console.log("node id" + d.id)
                // console.log("selectedNode.x  and y" + selectedNode.x + ", " + selectedNode.y)
                // console.log(mindMapData)

                // Update the positions of the associated lines in the mindMapData
                mindMapData.relationships.forEach((relation) => {
                    if (relation.source === d.id) {
                        relation.x1 = selectedNode.x + getRightEdgeX(nodes, selectedNode);
                        relation.y1 = selectedNode.y + getCenterY(nodes, selectedNode);
                    }
                    if (relation.target === d.id) {
                        relation.x2 = selectedNode.x + getLeftEdgeX(nodes, selectedNode);
                        relation.y2 = selectedNode.y + getCenterY(nodes, selectedNode);
                    }
                });

                const d3x = event.x;
                const d3y = event.y;

                //  console.log("d3x = " + d3x + ", d3y =" + d3y);
                renderMindMap(mindMapData);

                ToggleButtons(event, d); // so the 3 dots move with the box


            }

            function dragEnd(event, d) {
                d3.select(this).classed('active', false);
                // Update the positions of the node in mindMapData
                const selectedNode = mindMapData.nodes.find((node) => node.id === d.id);
                if (selectedNode) {

                    selectedNode.x = event.x - 50;
                    selectedNode.y = event.y - 25;
                }

                //console.log("x=", selectedNode.x);
                //console.log("y=", selectedNode.y);


                // Call takeSnapshot when drag ends
                // console.log('------------------------------------  DragEnd before taking the snaphot');
                // console.log('--- dragEnd after mindMapData', mindMapData);
                takeSnapshot(mindMapData);
                // console.log('------------------------------------  DragEnd after taking the snaphot');

            }

        }

        function updateSolidRelationships() {
            //console.log("In updateSolidRelationships Render the Solid Relationship ...", svg);
            const solidRelationships = svg
                .selectAll('.solid-relationship')
                .data(mindMapData.relationships.filter((relation) => relation.type === 'solid'));


            // x1 and y1 represent the starting point of the line.
            // x2 and y2 represent the ending point of the line, where the arrowhead will be drawn.

            solidRelationships.enter()
                .append('line')
                .attr("id", (d) => (d.source + '-' + d.target))
                .attr('class', 'relationship solid-relationship')
                .attr('stroke', (d) => d.stroke)
                .attr('marker-end', 'url(#arrowhead)') // Use marker-end instead of marker-mid
                .merge(solidRelationships)
                .attr('x1', (d) => {
                    const targetNode = nodes.filter((node) => node.id === d.target).node();
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();

                    if (targetNode && sourceNode) {
                        const targetShape = targetNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]');
                        const sourceShape = sourceNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"], [data-tag="diamond"]');
                        if (targetShape && sourceShape) {
                            const targetShapeTag = targetShape.getAttribute('data-tag');
                            const sourceShapeTag = sourceShape.getAttribute('data-tag');
                            //console.log("sourceShapeTag=", sourceShapeTag);
                            //console.log("targetShapeTag=", targetShapeTag);

                            const sourceRightEdgeX = getRightEdgeX(nodes, d.source);
                            const sourceLeftEdgeX = getLeftEdgeX(nodes, d.source);
                            const targetLeftEdgeX = getLeftEdgeX(nodes, d.target);

                            // Check if the target node is to the right of the source node
                            if (sourceRightEdgeX < targetLeftEdgeX) {
                                // Target is to the right of source
                                if (sourceShapeTag === 'ellipse') {
                                    const cx = parseFloat(sourceNode.getAttribute('transform').split('(')[1].split(',')[0]);
                                    const rx = parseFloat(sourceShape.getAttribute('rx'));
                                    //console.log("source ellipse on left");
                                    return cx + rx; // Set x2 to the left edge of the ellipse
                                } else if (sourceShapeTag === 'rect') {
                                    return sourceRightEdgeX - 3; // Set x2 to the left edge of the rectangle
                                } else if (sourceShapeTag === 'parallelogram') {
                                    // Assuming the left edge of the parallelogram is the end point of the relationship
                                    return sourceRightEdgeX - 3;
                                } else if (sourceShapeTag === 'diamond') {
                                    // Assuming the left edge of the diamond is the end point of the relationship
                                    return sourceRightEdgeX - 3;
                                }
                            } else {
                                // Target is to the left of source or on the same horizontal axis
                                if (sourceShapeTag === 'ellipse') {
                                    const cx = parseFloat(sourceNode.getAttribute('transform').split('(')[1].split(',')[0]);
                                    const rx = parseFloat(sourceShape.getAttribute('rx'));
                                    return cx - rx; // Set x2 to the right edge of the ellipse
                                } else if (sourceShapeTag === 'rect') {
                                    return sourceLeftEdgeX + 3; // Set x2 to the right edge of the rectangle
                                } else if (sourceShapeTag === 'parallelogram') {
                                    // Assuming the right edge of the parallelogram is the end point of the relationship
                                    return sourceLeftEdgeX + 3;
                                } else if (sourceShapeTag === 'diamond') {
                                    // Assuming the left edge of the diamond is the end point of the relationship
                                    return sourceLeftEdgeX + 3;
                                }
                            }
                        }

                    }
                    return 0;
                })
                .attr('y1', (d) => {
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();
                    const shape = sourceNode ? sourceNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]') : null;

                    if (shape) {
                        if (shape.getAttribute('data-tag') === 'ellipse') {
                            const cy = parseFloat(sourceNode.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]);
                            const ry = parseFloat(shape.getAttribute('ry'));
                            return cy; // Set y1 to the center of the top edge of the ellipse
                        } else if (shape.getAttribute('data-tag') === 'rect') {
                            return getCenterY(nodes, d.source); // Set y1 to the center of the top edge of the rectangle
                        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
                            // Assuming the top edge of the parallelogram is the start point of the relationship
                            return getCenterY(nodes, d.source);
                        } else if (shape.getAttribute('data-tag') === 'diamond') {
                            // Assuming the top edge of the diamond is the start point of the relationship
                            //console.log("diamond calling the center Y");
                            return getCenterY(nodes, d.source);
                        }
                    }
                    return 0;
                })
                .attr('x2', (d) => {
                    const targetNode = nodes.filter((node) => node.id === d.target).node();
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();

                    if (targetNode && sourceNode) {
                        const targetShape = targetNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]');
                        const sourceShape = sourceNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"], [data-tag="diamond"]');



                        if (targetShape && sourceShape) {
                            const targetShapeTag = targetShape.getAttribute('data-tag');
                            const sourceShapeTag = sourceShape.getAttribute('data-tag');
                            //console.log("sourceShapeTag=", sourceShapeTag);
                            //console.log("targetShapeTag=", targetShapeTag);

                            const sourceRightEdgeX = getRightEdgeX(nodes, d.source);
                            const targetLeftEdgeX = getLeftEdgeX(nodes, d.target);
                            const targetRightEdgeX = getRightEdgeX(nodes, d.target);

                            // Check if the target node is to the right of the source node
                            if (sourceRightEdgeX < targetLeftEdgeX) {
                                // Target is to the right of source
                                if (targetShapeTag === 'ellipse') {
                                    const cx = parseFloat(targetNode.getAttribute('transform').split('(')[1].split(',')[0]);
                                    const rx = parseFloat(targetShape.getAttribute('rx'));
                                    return cx - rx; // Set x2 to the left edge of the ellipse
                                } else if (targetShapeTag === 'rect') {
                                    return targetLeftEdgeX - 3; // Set x2 to the left edge of the rectangle
                                } else if (targetShapeTag === 'parallelogram') {
                                    // Assuming the left edge of the parallelogram is the end point of the relationship
                                    return targetLeftEdgeX - 3;
                                } else if (targetShapeTag === 'diamond') {
                                    // Assuming the left edge of the diamond is the end point of the relationship
                                    return targetLeftEdgeX - 3;
                                }
                            } else {
                                // Target is to the left of source or on the same horizontal axis
                                if (targetShapeTag === 'ellipse') {
                                    //console.log("The ellipse is target and on the left of source .....");
                                    const cx = parseFloat(targetNode.getAttribute('transform').split('(')[1].split(',')[0]);
                                    const rx = parseFloat(targetShape.getAttribute('rx'));
                                    return cx + rx + 5; // Set x2 to the right edge of the ellipse
                                } else if (targetShapeTag === 'rect') {
                                    return targetRightEdgeX + 3; // Set x2 to the right edge of the rectangle
                                } else if (targetShapeTag === 'parallelogram') {
                                    // Assuming the right edge of the parallelogram is the end point of the relationship
                                    return targetRightEdgeX + 3;
                                } else if (targetShapeTag === 'diamond') {
                                    // Assuming the left edge of the diamond is the end point of the relationship
                                    return targetRightEdgeX - 3;
                                }
                            }
                        }
                    }
                    return 0;
                })
                .attr('y2', (d) => {
                    const targetNode = nodes.filter((node) => node.id === d.target).node();
                    const shape = targetNode ? targetNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"], [data-tag="diamond"]') : null;

                    if (shape) {
                        if (shape.getAttribute('data-tag') === 'ellipse') {
                            const cy = parseFloat(targetNode.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]);
                            const ry = parseFloat(shape.getAttribute('ry'));
                            return cy; // Set y2 to the center of the top edge of the ellipse
                        } else if (shape.getAttribute('data-tag') === 'rect') {
                            return getCenterY(nodes, d.target); // Set y2 to the center of the top edge of the rectangle
                        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
                            // Assuming the top edge of the parallelogram is the end point of the relationship
                            return getCenterY(nodes, d.target);
                        } else if (shape.getAttribute('data-tag') === 'diamond') {
                            // Assuming the top edge of the diamond is the end point of the relationship
                            return getCenterY(nodes, d.target);
                        }
                    }
                    return 0;
                })
                .attr("stroke-width", (d) => d.strokewidth)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("class", "solid-relationship hover");
                    ToggleButtons(event, d);
                })
                .on("mouseout", function() {
                    d3.select(this).attr("class", "solid-relationship");
                })
                .on("click", function() {
                    //console.log("Line Clicked ....");
                    selectedLine = d3.select(this);
                });


            solidRelationships
                .merge(solidRelationships)
                .attr('class', (d) => {
                    // Check if the source node or target node is dimmed, and apply 'dimmed' class to the relationship line
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();
                    const targetNode = nodes.filter((node) => node.id === d.target).node();

                    if (sourceNode && targetNode) {
                        const sourceDimmed = sourceNode.classList.contains('dimmed');
                        const targetDimmed = targetNode.classList.contains('dimmed');

                        if (sourceDimmed || targetDimmed) {
                            return 'relationship solid-relationship dimmed';
                        }
                    }

                    // If neither source nor target is dimmed, apply the regular class
                    return 'relationship solid-relationship';
                });

            solidRelationships.exit().remove();
        }



        function updateCurvedRelationships() {
            const curvedRelationships = svg
                .selectAll('.dash-relationship')
                .data(mindMapData.relationships.filter((relation) => relation.type === 'dash'));

            curvedRelationships
                .enter()
                .append('line')
                .attr("id", (d) => (d.source + '-' + d.target))
                .attr('class', 'relationship dash-relationship')
                .attr('stroke', (d) => { return d.stroke }) // Set the color of the line to blue (you can use any color you like)
                .attr('marker-end', 'url(#arrowhead)') // Use marker-end instead of marker-mid
                .merge(curvedRelationships) // Merge enter and update selections
                .attr('x1', (d) => {
                    if (d.source.dragging) {
                        return d.source.x + getRightEdgeX(nodes, d.source);
                    } else {
                        const sourceNode = nodes.filter((node) => node.id === d.source).node();
                        const shape = sourceNode ? sourceNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"], [data-tag="diamond"]') : null;

                        if (shape) {
                            if (shape.getAttribute('data-tag') === 'ellipse') {
                                const cx = parseFloat(sourceNode.getAttribute('transform').split('(')[1].split(',')[0]);
                                const rx = parseFloat(shape.getAttribute('rx'));
                                return cx + rx; // Set x1 to the right edge of the ellipse
                            } else if (shape.getAttribute('data-tag') === 'rect') {
                                return getRightEdgeX(nodes, d.source); // Set x1 to the right edge of the rectangle
                            } else if (shape.getAttribute('data-tag') === 'parallelogram') {
                                // Assuming the left edge of the parallelogram is the start point of the relationship
                                return getLeftEdgeX(nodes, d.source);
                            } else if (shape.getAttribute('data-tag') === 'diamond') {
                                // Assuming the left edge of the diamond is the start point of the relationship
                                return getLeftEdgeX(nodes, d.source);
                            }
                        }
                        return 0;
                    }
                })
                .attr('y1', (d) => {
                    if (d.source.dragging) {
                        return d.source.y + getCenterY(nodes, d.source);
                    } else {
                        const sourceNode = nodes.filter((node) => node.id === d.source).node();
                        const shape = sourceNode ? sourceNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"], [data-tag="diamond"]') : null;

                        if (shape) {
                            if (shape.getAttribute('data-tag') === 'ellipse') {
                                const cy = parseFloat(sourceNode.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]);
                                const ry = parseFloat(shape.getAttribute('ry'));
                                return cy; // Set y1 to the center of the top edge of the ellipse
                            } else if (shape.getAttribute('data-tag') === 'rect') {
                                return getCenterY(nodes, d.source); // Set y1 to the center of the top edge of the rectangle
                            } else if (shape.getAttribute('data-tag') === 'parallelogram') {
                                // Assuming the top edge of the parallelogram is the start point of the relationship
                                return getCenterY(nodes, d.source);
                            } else if (shape.getAttribute('data-tag') === 'diamond') {
                                // Assuming the top edge of the diamond is the start point of the relationship
                                return getCenterY(nodes, d.source);
                            }
                        }
                        return 0;
                    }
                })
                .attr('x2', (d) => {
                    const targetNode = nodes.filter((node) => node.id === d.target).node();
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();

                    if (targetNode && sourceNode) {
                        const targetShape = targetNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]');
                        const sourceShape = sourceNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]');

                        if (targetShape && sourceShape) {
                            const targetShapeTag = targetShape.getAttribute('data-tag');
                            const sourceShapeTag = sourceShape.getAttribute('data-tag');

                            const sourceRightEdgeX = getRightEdgeX(nodes, d.source);
                            const targetLeftEdgeX = getLeftEdgeX(nodes, d.target);

                            // Check if the target node is to the right of the source node
                            if (sourceRightEdgeX < targetLeftEdgeX) {
                                // Target is to the right of source
                                if (targetShapeTag === 'ellipse') {
                                    const cx = parseFloat(targetNode.getAttribute('transform').split('(')[1].split(',')[0]);
                                    const rx = parseFloat(targetShape.getAttribute('rx'));
                                    return cx - rx; // Set x2 to the left edge of the ellipse
                                } else if (targetShapeTag === 'rect') {
                                    return targetLeftEdgeX - 3; // Set x2 to the left edge of the rectangle
                                } else if (targetShapeTag === 'parallelogram') {
                                    // Assuming the left edge of the parallelogram is the end point of the relationship
                                    return targetLeftEdgeX - 3;
                                }
                            } else {
                                // Target is to the left of source or on the same horizontal axis
                                if (targetShapeTag === 'ellipse') {
                                    const cx = parseFloat(targetNode.getAttribute('transform').split('(')[1].split(',')[0]);
                                    const rx = parseFloat(targetShape.getAttribute('rx'));
                                    return cx + rx; // Set x2 to the right edge of the ellipse
                                } else if (targetShapeTag === 'rect') {
                                    return getRightEdgeX(nodes, d.target) + 3; // Set x2 to the right edge of the rectangle
                                } else if (targetShapeTag === 'parallelogram') {
                                    // Assuming the right edge of the parallelogram is the end point of the relationship
                                    return getRightEdgeX(nodes, d.target) + 3;
                                } else if (targetShapeTag === 'diamond') {
                                    // Assuming the right edge of the diamond is the end point of the relationship
                                    return getRightEdgeX(nodes, d.target) + 3;
                                }
                            }
                        }
                    }
                    return 0;
                })
                .attr('y2', (d) => {
                    if (d.target.dragging) {
                        return d.target.y + getCenterY(nodes, d.target);
                    } else {
                        const targetNode = nodes.filter((node) => node.id === d.target).node();
                        const shape = targetNode ? targetNode.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"] ') : null;

                        if (shape) {
                            if (shape.getAttribute('data-tag') === 'ellipse') {
                                const cy = parseFloat(targetNode.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]);
                                const ry = parseFloat(shape.getAttribute('ry'));
                                return cy; // Set y2 to the center of the top edge of the ellipse
                            } else if (shape.getAttribute('data-tag') === 'rect') {
                                return getCenterY(nodes, d.target); // Set y2 to the center of the top edge of the rectangle
                            } else if (shape.getAttribute('data-tag') === 'parallelogram') {
                                // Assuming the top edge of the parallelogram is the end point of the relationship
                                return getCenterY(nodes, d.target);
                            } else if (shape.getAttribute('data-tag') === 'diamond') {
                                // Assuming the top edge of the diamond is the end point of the relationship
                                return getCenterY(nodes, d.target);
                            }
                        }
                        return 0;
                    }
                })
                .on("click", function() {
                    //console.log("Line Clicked ....");
                    selectedLine = d3.select(this);
                })
                .attr("stroke-width", (d) => {
                    return d.strokewidth;
                })
                .on('mouseover', function(event, d) {
                    // console.log('mouseover');
                    d3.select(this).attr('class', 'dash-relationship hover');
                    ToggleButtons(event, d);
                })
                .on('mouseout', function() {
                    //console.log('mouseout');
                    d3.select(this).attr('class', 'dash-relationship');
                });

            curvedRelationships
                .merge(curvedRelationships)
                .attr('class', (d) => {
                    // Check if the source node or target node is dimmed, and apply 'dimmed' class to the relationship line
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();
                    const targetNode = nodes.filter((node) => node.id === d.target).node();

                    if (sourceNode && targetNode) {
                        const sourceDimmed = sourceNode.classList.contains('dimmed');
                        const targetDimmed = targetNode.classList.contains('dimmed');

                        if (sourceDimmed || targetDimmed) {
                            return 'relationship dash-relationship dimmed';
                        }
                    }

                    // If neither source nor target is dimmed, apply the regular class
                    return 'relationship dash-relationship';
                });

            curvedRelationships.exit().remove();
        }



        function renderRelationToolBox() {
            //console.log("renderRelationToolBox ...... start");
            // Create the relationship box

            const rectMargin = 20;
            const lineStrokeWidth = 2;
            const relationshipLineLength = 80;
            // Create the relationship box
            const relationshipToolBox = svg
                .append("g")
                .attr("class", "relationship-toolbox")
                .style("display", "none");

            relationshipToolBox
                .append("rect")
                .attr("class", "relationship-toolbox-rect")
                .attr("width", relationshipToolBoxWidth)
                .attr("height", relationshipToolBoxHeight);

            const boxContainer = relationshipToolBox
                .append("foreignObject")
                .attr("width", relationshipToolBoxWidth)
                .attr("height", relationshipToolBoxHeight);

            const toolboxContent = boxContainer
                .append("xhtml:div")
                .attr("class", "relationship-toolbox-content");


            const icons = [
                { icon: "bi bi-palette", text: "Color" },
                { icon: "bi bi-arrow-left-right", text: "Type" },
                { icon: "bi bi-arrows-collapse", text: "Thinner" },
                { icon: "bi-arrows-expand", text: "Thicker" },
                { icon: "bi bi-trash", text: "Delete" },
                { icon: "bi bi-textarea-t", text: "Label" }
            ];
            // Create the nodes inside the relationship box
            const relationshipTooBoxNodes = toolboxContent
                .selectAll("div")
                .data(icons)
                .enter()
                .append("div")
                .on("click", handleRelationshipToolboxNodesClick);


            relationshipTooBoxNodes
                .append("i")
                .attr("class", d => `relationship-toolbox-icons ${d.icon}`)
                .style("display", "inline-block")
                .on("click", handleRelationshipToolboxNodesClick);


            relationshipTooBoxNodes
                .append("span")
                .text(d => d.text)
                .style("margin-left", "5px")
                .on("click", handleRelationshipToolboxNodesClick);



            relationshipToolBoxRef = relationshipToolBox;

        }

        function renderBoxToolBox() {
            //console.log("renderBoxToolBox ...... start");
            // Create the relationship bo

            const rectMargin = 20;
            const lineStrokeWidth = 2;
            const relationshipLineLength = 80;
            // Create the relationship box
            const BoxToolBox = svg
                .append("g")
                .attr("class", "box-toolbox-box")
                .style("display", "none");

            BoxToolBox
                .append("rect")
                .attr("class", "box-toolbox-rect")
                .attr("width", boxToolBoxWidth)
                .attr("height", boxToolBoxHeight);

            const boxContainer = BoxToolBox
                .append("foreignObject")
                .attr("width", boxToolBoxWidth)
                .attr("height", boxToolBoxWidth);

            const toolboxContent = boxContainer
                .append("xhtml:div")
                .attr("class", "box-toolbox-content");


            const icons = [
                { icon: "bi bi-palette", text: "Color" },
                { icon: "bi bi-arrow-left-right", text: "Shape" },
                { icon: "bi bi-arrows-collapse", text: "Thinner" },
                { icon: "bi-arrows-expand", text: "Thicker" },
                { icon: "bi bi-trash", text: "Delete" },
                { icon: "bi bi-emoji-smile", text: "Icons" }
            ];
            // Create the nodes inside the relationship box
            const boxTooBoxNodes = toolboxContent
                .selectAll("div")
                .data(icons)
                .enter()
                .append("div")
                .on("click", handleBoxToolboxNodesClick);


            boxTooBoxNodes
                .append("i")
                .attr("class", d => `relationship-toolbox-icons ${d.icon}`)
                .style("display", "inline-block")
                .on("click", handleBoxToolboxNodesClick);


            boxTooBoxNodes
                .append("span")
                .text(d => d.text)
                .style("margin-left", "5px")
                .on("click", handleBoxToolboxNodesClick);



            BoxToolBoxRef = BoxToolBox;

        }

        function renderBoxIconBox() {
            //console.log("renderBoxIconBox ...... start");
            const rectMargin = 20;
            const lineStrokeWidth = 2;
            const relationshipLineLength = 80;
            // Create the relationship box
            const BoxIconBox = svg
                .append("g")
                .attr("class", "box-iconbox-box")
                .style("display", "none");

            BoxIconBox
                .append("rect")
                .attr("class", "box-iconbox-rect")
                .attr("width", boxIconBoxWidth)
                .attr("height", boxIconBoxHeight);

            const boxContainer = BoxIconBox
                .append("foreignObject")
                .attr("width", boxIconBoxWidth)
                .attr("height", boxIconBoxHeight);

            const iconboxContent = boxContainer
                .append("xhtml:div")
                .attr("class", "box-toolbox-content");

            const icons = [
                { icon: "bi bi-heart", text: "Heart" },
                { icon: "bi bi-emoji-laughing", text: "Smily" },
                { icon: "bi bi-star", text: "Star" }
            ];

            const boxIconBoxNodes = iconboxContent
                .selectAll("div")
                .data(icons)
                .enter()
                .append("div")
                .on("click", handleBoxIconboxNodesClick);

            boxIconBoxNodes
                .append("i")
                .attr("class", d => `relationship-toolbox-icons ${d.icon}`)
                .style("display", "inline-block");

            boxIconBoxNodes
                .append("span")
                .text(d => d.text)
                .style("margin-left", "5px");

            // Add line breaks
            iconboxContent.append("br");
            iconboxContent.append("br");

            // Add a remove button at the bottom center of the rectangle
            const removeButton = iconboxContent
                .append("button")
                .text("Remove Icon")
                .style("position", "absolute")
                .style("bottom", "0")
                .style("left", "0")
                .style("width", "100%")
                .style("color", "red") // Change the remove character to red
                .on("click", handleRemoveIcon);

            //console.log("The new div for Shape Box rendered ....");

            BoxIconBoxRef = BoxIconBox;
        }


        function handleRemoveIcon() {
            //console.log('-----------------------------------');

            const nodeId = selectedNode.id;

            //console.log(`handleRemoveIcon Current/Target Box Id ${nodeId}`);

            //const nodeelement = d3.select(`#${nodeId}`);
            const nodeelement = d3.select(`#${nodeId}`);
            //console.log(nodeelement);
            //console.log(`nodeelement Box Id ${nodeelement.attr('id')}`);

            const selectedNode4ShapeChange = mindMapData.nodes.find(node => node.id === nodeId);
            selectedNode4ShapeChange.icon = null;
            renderMindMap(mindMapData);
        }

        function renderBoxShapeBox() {
            //console.log("renderBoxShapeBox ...... start");
            const rectMargin = 20;
            const lineStrokeWidth = 2;
            const relationshipLineLength = 80;
            // Create the relationship box
            const BoxShapeBox = svg
                .append("g")
                .attr("class", "box-shapebox-box")
                .style("display", "none");

            BoxShapeBox
                .append("rect")
                .attr("class", "box-shapebox-rect")
                .attr("width", boxShapeBoxWidth)
                .attr("height", boxShapeBoxHeight);

            const boxContainer = BoxShapeBox
                .append("foreignObject")
                .attr("width", boxShapeBoxWidth)
                .attr("height", boxShapeBoxHeight);

            const shapeboxContent = boxContainer
                .append("xhtml:div")
                .attr("class", "box-toolbox-content");


            const icons = [
                { icon: "&#9649;", text: "Parallelogram" }, // Add the parallelogram icon here
                { icon: "bi bi-square", text: "Rectangle" },
                { icon: "bi bi-circle", text: "Ellipse" },
                { icon: "bi bi-diamond", text: "Diamond" }

            ];
            const boxShapeBoxNodes = shapeboxContent
                .selectAll("div")
                .data(icons)
                .enter()
                .append("div")
                .on("click", handleBoxShapeboxNodesClick);


            boxShapeBoxNodes
                .append("i")
                .attr("class", d => `relationship-toolbox-icons ${d.icon}`)
                .style("display", "inline-block")
                .on("click", handleBoxShapeboxNodesClick);


            boxShapeBoxNodes
                .append("span")
                .text(d => d.text)
                .style("margin-left", "5px")
                .on("click", handleBoxShapeboxNodesClick);

            //console.log("The new div for Shape Box rendered ....");

            BoxShapeBoxRef = BoxShapeBox;

        }

        // Function to toggle the visibility of the dot button for a selected box
        function ToggleButtons(event, d) {
            //console.log(' Mouse Over ToggleButtons');
            var dotcalcX = 0
            var dotcalcY = 0
            var pluscalcX = 0
            var pluscalcY = 0
            var pencalcX = 0
            var pencalcY = 0


            // Remove any existing circles with the "below" classes
            svg.selectAll(".three-dots-group").remove();
            svg.selectAll(".plus-button").remove();
            svg.selectAll(".pen-button").remove();
            hideAttributeContainer();



            // Create a group for the circle and text
            const dotGroup = svg
                .append("g")
                .attr("class", "three-dots-group pointer-cursor")
                .attr("visibility", "visible")
                .on('mouseover', () => dotGroup.attr("cursor", "pointer"))
                .on('mouseout', () => dotGroup.attr("cursor", "default"))
                .on('click', (event, d) => click3dotbutton(event, d));


            // Get the id of the box or line and use it as the id for the circle
            const circleId = d.id || (d.source && d.target ? `${d.source}-${d.target}` : null);

            // Create the circle with "..." text in the middle of the line
            dotCircle = dotGroup
                .append("circle")
                .attr("id", circleId) // Set the id of the circle to the box or line id
                .attr("cx", 150) // Set the initial position, you can change this value if needed
                .attr("cy", 150) // Set the initial position, you can change this value if needed
                .attr("r", 15)
                .attr("fill", "yellow")
                .attr("stroke", "black")
                .attr("stroke-width", 2);

            // Append the "..." text to the circle's parent group
            // Append a foreignObject to the circle to embed HTML content
            // Append the text inside the circle
            dotsText = dotGroup
                .append("text")
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text("...");



            // Create the "+" button
            const plusGroup = svg
                .append("g")
                .attr("class", "plus-button pointer-cursor")
                .attr("visibility", "visible")
                .on('mouseover', () => dotGroup.attr("cursor", "pointer"))
                .on('mouseout', () => dotGroup.attr("cursor", "default"))
                .on('click', (event, d) => clickplusbutton(event, d));

            // Create the circle with "..." text in the middle of the line
            const plusCircle = plusGroup
                .append("circle")
                .attr("id", circleId) // Set the id of the circle to the box or line id
                .attr("cx", 150) // Set the initial position, you can change this value if needed
                .attr("cy", 150) // Set the initial position, you can change this value if needed
                .attr("r", 10)
                .attr("fill", "yellow")
                .attr("stroke", "black")
                .attr("stroke-width", 2);


            const plusText = plusGroup
                .append("text")
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text("+");


            // Create the "Pen" button
            const penGroup = svg
                .append("g")
                .attr("class", "pen-button pointer-cursor")
                .attr("visibility", "visible")
                .on("mouseover", () => penGroup.attr("cursor", "pointer"))
                .on("mouseout", () => penGroup.attr("cursor", "default"))
                .on("click", (event, d) => {
                    clickpenbutton(event, d);
                });
            // Create the circle
            const penCircle = penGroup
                .append("circle")
                .attr("id", circleId)
                .attr("cx", 150) // Set the initial position
                .attr("cy", 150) // Set the initial position
                .attr("r", 15) // Adjust the radius as needed
                .attr("fill", "yellow")
                .attr("stroke", "black")
                .attr("stroke-width", 2);

            // Create a foreignObject to embed HTML content

            const penIcon = penGroup
                .append("foreignObject")
                .attr("x", 150) // Does not change anything since it will be set below by pencalcX
                .attr("y", 150) // Does not change anything since it will be set below by pencalcY
                .attr("width", 30) // Adjust the size as needed
                .attr("height", 30); // Adjust the size as needed

            // Create a div inside the foreignObject and add the Bootstrap icon
            const div = penIcon
                .append("xhtml:div")
                .html('<i class="bi bi-pencil"></i>');

            // Adjust the icon's styles if needed
            div.select("i")
                .style("font-size", "18px") // Adjust the font size as needed
                .style("color", "black"); // Adjust the color as needed


            // setting the coordinates for the toggled icons

            if (d.label) // Rectangle / Box
            { // dot and plus shape position
                if (d.shape === 'ellipse') {
                    const bbox = dotGroup.node().getBBox();
                    dotcalcX = d.x;
                    dotcalcY = d.y - bbox.height / 2 + 35; // Adjust the value as needed for the vertical position above the ellipse
                    pluscalcX = d.x;
                    pluscalcY = d.y + rectHeight;
                    plusCircle.attr("cx", pluscalcX).attr("cy", pluscalcY).attr("visibility", "visible");
                    plusText.attr("x", pluscalcX).attr("y", pluscalcY - 2).attr("visibility", "visible");
                    pencalcX = d.x + 80;
                    pencalcY = d.y - bbox.height / 2 + 50;
                } else if (d.shape === 'parallelogram') {
                    dotcalcX = d.x + plgrmWidth / 2;
                    dotcalcY = d.y - ellipseRy + 25; // Adjust the value as needed for the vertical position above the ellipse
                    pluscalcX = d.x + plgrmWidth / 2;
                    pluscalcY = d.y + plgrmHeight;
                    plusCircle.attr("cx", pluscalcX).attr("cy", pluscalcY).attr("visibility", "visible");
                    plusText.attr("x", pluscalcX).attr("y", pluscalcY - 2).attr("visibility", "visible");
                    pencalcX = d.x + plgrmWidth - 25;
                    pencalcY = d.y - plgrmHeight / 2 + 15; // Adjust the value as needed for the vertical position above the ellipse
                } else if (d.shape === 'diamond') {
                    dotcalcX = d.x + diamondWidth / 2;
                    dotcalcY = d.y - ellipseRy + 25; // Adjust the value as needed for the vertical position above the ellipse
                    pluscalcX = d.x + diamondWidth / 2;
                    pluscalcY = d.y + diamondHeight;
                    plusCircle.attr("cx", pluscalcX).attr("cy", pluscalcY).attr("visibility", "visible");
                    plusText.attr("x", pluscalcX).attr("y", pluscalcY - 2).attr("visibility", "visible");
                    pencalcX = d.x + diamondWidth / 2 + 55;
                    pencalcY = d.y - ellipseRy / 2 + 30; // Adjust the value as needed for the vertical position above the ellipse

                } else {
                    dotcalcX = d.x + rectWidth / 2;
                    dotcalcY = d.y - ellipseRy + 25; // Adjust the value as needed for the vertical position above the ellipse
                    pluscalcX = d.x + rectWidth / 2;
                    pluscalcY = d.y + rectHeight;
                    plusCircle.attr("cx", pluscalcX).attr("cy", pluscalcY).attr("visibility", "visible");
                    plusText.attr("x", pluscalcX).attr("y", pluscalcY - 2).attr("visibility", "visible");
                    pencalcX = d.x + rectWidth - 15;
                    pencalcY = d.y - ellipseRy + 25; // Adjust the value as needed for the vertical position above the ellipse

                }



            }
            if (d.source) // line
            {
                // console.log(" My d.source = " + d.source)
                // console.log(" My d.target = " + d.target)
                // console.log(" My d.type = " + d.type)
                // console.log(" My d.lineid = " + d.source + '-' + d.target)

                // Find the source and target node objects
                const sourceNode = mindMapData.nodes.find((node) => node.id === d.source);
                const targetNode = mindMapData.nodes.find((node) => node.id === d.target);

                // console.log("sourceNode shape=" + sourceNode.shape);
                // console.log("targetNode shape=" + targetNode.shape);


                if ((sourceNode.shape === 'rectangle') && (targetNode.shape === 'rectangle')) {
                    console.log('both source and target are rectangle ');
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'rectangle') && (targetNode.shape === 'rectangle')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'rectangle') && (targetNode.shape === 'ellipse')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'rectangle') && (targetNode.shape === 'parallelogram')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'rectangle') && (targetNode.shape === 'diamond')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'ellipse') && (targetNode.shape === 'ellipse')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'ellipse') && (targetNode.shape === 'rectangle')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'ellipse') && (targetNode.shape === 'parallelogram')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'ellipse') && (targetNode.shape === 'diamond')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'parallelogram') && (targetNode.shape === 'ellipse')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'diamond') && (targetNode.shape === 'ellipse')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'parallelogram') && (targetNode.shape === 'parallelogram')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'diamond') && (targetNode.shape === 'diamond')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'parallelogram') && (targetNode.shape === 'rectangle')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else if ((sourceNode.shape === 'diamond') && (targetNode.shape === 'rectangle')) {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                } else {
                    // Calculate the middle point between the source and target nodes
                    const sourceX = sourceNode.x + rectWidth; // Assuming the width of the rectangle is "rectWidth"
                    const sourceY = sourceNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    const targetX = targetNode.x; // Assuming the width of the rectangle is "rectWidth"
                    const targetY = targetNode.y + rectHeight / 2; // Assuming the height of the rectangle is "rectHeight"
                    dotcalcX = (sourceX + targetX) / 2;
                    dotcalcY = (sourceY + targetY) / 2;
                }


            }

            //console.log("making the dotCircle visible");
            //console.log(calcX);
            // console.log(calcY);
            // console.log(dotCircle.attr('cx'));
            // console.log(dotCircle.attr('cy'));

            dotCircle.attr("cx", dotcalcX).attr("cy", dotcalcY).attr("visibility", "visible");
            dotsText.attr("x", dotcalcX).attr("y", dotcalcY - 2).attr("visibility", "visible");

            penCircle.attr("cx", pencalcX).attr("cy", pencalcY).attr("visibility", "visible");
            penIcon.attr("x", pencalcX - 8).attr("y", pencalcY - 12).attr("visibility", "visible");

            function clickpenbutton(event, d) {
                event.stopPropagation();
                // console.log('circleId ' + circleId);
                const targetobj = findBoxOrLine(circleId);
                //console.log("Found   id:", targetobj.id);

                // Check if the selectedNodeData is found
                if (targetobj) {
                    // Now you can access the attributes of the selected node
                    //console.log("Target obj", targetobj);
                    populateAttributeContainer(targetobj);
                    showAttributeContainer(targetobj);
                }
            }


            function clickplusbutton(event, d) {
                //console.log("Plus Button Clicked........................");
                event.stopPropagation();
                //console.log('circleId ' + circleId);
                selectedNode = circleId;
                handleAddNode();
            }


            function click3dotbutton(event, d) {
                //console.log("3 Dot Clicked........................");
                event.stopPropagation();

                //console.log('circleId ' + circleId);

                const targetobj = findBoxOrLine(circleId);
                if (circleId.includes('-')) { // line
                    // console.log("Found  Line id:", targetobj.id);
                    //  console.log("Found  Line x1:", targetobj.x1);

                    // console.log(targetobj);
                    toggleRelationshipToolBox(targetobj);
                } else {
                    //console.log("Found  Box:", targetobj.id);
                    toggleBoxToolBox(targetobj);
                }



                dotCircle.attr("visibility", "hidden");
                dotsText.attr("visibility", "hidden");

                penCircle.attr("visibility", "hidden");
                penIcon.attr("visibility", "hidden");


            }

        }

        function deleteNodeAndRelatedNodes(nodeId) {
            const nodeIndex = mindMapData.nodes.findIndex((node) => node.id === nodeId);
            if (nodeIndex === -1) {
                // Node not found, return or throw an error
                return;
            }

            // Find relationships originating from or targeting the node to be deleted
            const relationshipsToDelete = mindMapData.relationships.filter(
                (relationship) => relationship.source === nodeId || relationship.target === nodeId
            );

            // Delete the relationships
            relationshipsToDelete.forEach((relationship) => {
                const relationshipIndex = mindMapData.relationships.indexOf(relationship);
                if (relationshipIndex !== -1) {
                    mindMapData.relationships.splice(relationshipIndex, 1); // Remove the relationship
                    //console.log(`Deleted relationship: ${relationship.id}`);
                }
            });

            // Check if the node has any remaining relationships
            const remainingRelationships = mindMapData.relationships.some(
                (relationship) => relationship.source === nodeId || relationship.target === nodeId
            );

            // If there are no remaining relationships, delete the node
            if (!remainingRelationships) {
                mindMapData.nodes.splice(nodeIndex, 1); // Remove the node from the nodes array
                //console.log(`Deleted node: ${nodeId}`);
            }

            // After rendering, capture a snapshot
            takeSnapshot(mindMapData);
        }



        function handleBoxIconboxNodesClick(event, d) {
            //console.log(`Clicked ${d.text}`);
            //console.log('-----------------------------------');

            const nodeId = selectedNode.id;

            //console.log(`handleBoxIconboxNodesClick Current/Target Box Id ${nodeId}`);

            //const nodeelement = d3.select(`#${nodeId}`);
            const nodeelement = d3.select(`#${nodeId}`);
            //console.log(nodeelement);
            //console.log(`nodeelement Box Id ${nodeelement.attr('id')}`);
            var shp = null;
            if (d.text == "Heart") { shp = 'heart' };
            if (d.text == "Smily") { shp = 'smily' };
            if (d.text == "Star") { shp = 'star' };



            const selectedNode4ShapeChange = mindMapData.nodes.find(node => node.id === nodeId);
            selectedNode4ShapeChange.icon = shp;
            renderMindMap(mindMapData);

        }


        function handleBoxShapeboxNodesClick(event, d) {
            // console.log(`Clicked ${d.text}`);
            // console.log('-----------------------------------');

            const nodeId = selectedNode.id;

            //console.log(`Current/Target Box Id ${nodeId}`);

            //const nodeelement = d3.select(`#${nodeId}`);
            const nodeelement = d3.select(`#${nodeId}`);
            // console.log(nodeelement);
            // console.log(`nodeelement Box Id ${nodeelement.attr('id')}`);
            var shp = null;
            if (d.text == "Rectangle") { shp = 'rectangle' };
            if (d.text == "Ellipse") { shp = 'ellipse' };
            if (d.text == "Parallelogram") { shp = 'parallelogram' };
            if (d.text == "Diamond") { shp = 'diamond' };



            const selectedNode4ShapeChange = mindMapData.nodes.find(node => node.id === nodeId);
            selectedNode4ShapeChange.shape = shp;
            renderMindMap(mindMapData);

        }

        function handleBoxToolboxNodesClick(event, d) {
            // console.log(` -- Clicked ${d.text}`);
            //  console.log('-----------------------------------');

            var nodeId = selectedNode.id;
            var nodeData = mindMapData.nodes.find((node) => node.id === nodeId);



            // console.log(`Current/Target Box Id ${nodeId}`);
            // console.log("nodeData =", nodeData);

            const nodeelement = d3.select(`#${nodeId}`);

            // console.log(`nodeelement Box Id ${nodeelement.attr('id')}`);

            // console.log('nodeelement = ', nodeelement);

            if (d.text === "Thicker" || d.text === "Thinner") {
                //console.log('d.shape in Thicker / Thiner =');
                var existingStrokeWidth = parseFloat(nodeData.strokewidth);

                // console.log('-----------------------------------', existingStrokeWidth);
                var newStrokeWidth = 0;
                if (d.text === "Thicker") {
                    newStrokeWidth = existingStrokeWidth + 1;
                    console.log("takeSnapshot trigerred by Thicker Box");
                    takeSnapshot(mindMapData);
                } else if (d.text === "Thinner") {
                    newStrokeWidth = existingStrokeWidth - 1;
                    console.log("takeSnapshot trigerred by Thinner Box");
                    takeSnapshot(mindMapData);
                }

                //console.log("existingStrokeWidth=" + existingStrokeWidth);
                //console.log("newStrokeWidth=" + newStrokeWidth);

                // Update the strokewidth property of the node data
                if (nodeData) {
                    //console.log("updating mind map with new stroke width", newStrokeWidth)

                    nodeData.strokewidth = newStrokeWidth;
                    // console.log("Set Style to =" + newStrokeWidth);
                    nodeelement.style("stroke-width", `${newStrokeWidth}`);

                    renderMindMap(mindMapData);

                }

            } else if (d.text === "Color") {
                handleColorPalette('box', nodeId);
                console.log("takeSnapshot trigerred by Color Box");
                takeSnapshot(mindMapData);


            } else if (d.text === "Delete") {
                deleteNodeAndRelatedNodes(nodeId);
                renderMindMap(mindMapData);
                console.log("takeSnapshot trigerred by Delete Box");
                takeSnapshot(mindMapData);



            } else if (d.text === "Shape") {
                //console.log('rendering the shape options ....');
                console.log("takeSnapshot trigerred by Shape Box");
                takeSnapshot(mindMapData);

                event.stopPropagation();

                const targetobj = findBoxOrLine(nodeId);
                hideBoxToolBox();
                renderBoxShapeBox();
                toggleBoxShapeBox(targetobj);

            } else if (d.text === "Icons") {
                //console.log("rendering the Icons options .....");
                console.log("takeSnapshot trigerred by Icons Box");
                takeSnapshot(mindMapData);

                event.stopPropagation();

                const targetobj = findBoxOrLine(nodeId);
                hideBoxToolBox();
                renderBoxIconBox();
                toggleBoxIconBox(targetobj);

            }

            //console.log('Rendering the MindMap...')
            //renderMindMap();
        }


        function handleRelationshipToolboxNodesClick(event, d) {
            //console.log(`Clicked ${d.text}`);
            //console.log('-----------------------------------');

            const lineId = selectedLine.attr('id');

            //console.log(`Current/Target Line Id ${lineId}`);

            const lineElement = d3.select(`#${lineId}`);

            if (d.text === "Type") {
                //console.log("Type .... ");
            }

            if (d.text === "Thicker" || d.text === "Thinner") {

                const currentStrokeWidth = parseFloat(lineElement.style("stroke-width"));
                var newStrokeWidth = 0;
                if (d.text === "Thicker") {
                    newStrokeWidth = currentStrokeWidth + 1;
                    console.log("takeSnapshot trigerred by Thicker Box");
                    takeSnapshot(mindMapData);
                } else if (d.text === "Thinner") {
                    newStrokeWidth = currentStrokeWidth - 1;
                    console.log("takeSnapshot trigerred by Thinner Box");
                    takeSnapshot(mindMapData);
                }

                //console.log("currentStrokeWidth=" + currentStrokeWidth);
                //console.log("newStrokeWidth=" + newStrokeWidth);

                lineElement.style("stroke-width", `${newStrokeWidth}`);

                // Update the stroke-width in the mind map data
                const relationship = mindMapData.relationships.find((relation) => {
                    const slineId = `${relation.source}-${relation.target}`;
                    return slineId === lineId;
                });


                //console.log('relationship =' + relationship);
                if (relationship) {
                    relationship.strokewidth = newStrokeWidth;
                    //console.log('Setting the mindMapData width');
                }
                //console.log('-----------------------------------');

            } else if (d.text === "Color") {
                console.log("takeSnapshot trigerred by Line Color");
                takeSnapshot(mindMapData);
                handleColorPalette('line', lineId);

            }


        }


        // Function to find a box or line based on the circleId
        function findBoxOrLine(targetid) {
            var targetobj = null;
            // Check if the circleId contains a hyphen to identify it as a line
            if (targetid.includes('-')) { // line
                // console.log("findObject Line with ID =" + targetid);
                // Update the stroke-width in the mind map data

                targetobj = d3.select(`#${targetid}`);
                //console.log('targetobj=')
                //console.log(targetobj)

                // targetobj = mindMapData.relationships.find((relation) => {
                //     const slineId = `${relation.source}-${relation.target}`;
                //     return slineId === targetid;
                // });
                selectedLine = targetobj;
                //console.log("findObject Line Object has ID =", targetobj);

            } else { // box
                // If the circleId does not contain a hyphen, it is for a box
                // Find the box with the given id in the mindMapData
                //console.log("findObject Box with Target ID =" + targetid);
                targetobj = mindMapData.nodes.find((node) => node.id === targetid);
                selectedNode = targetobj;
            }
            return targetobj;
        }


        // Function to toggle the relationship tool box trigerred on 3 dots from line
        function toggleRelationshipToolBox(line) {
            //console.log("In the ToggleRelationshipToolBox ....");
            //console.log('line.id=' + line.attr('id'));
            //console.log(line);
            //console.log('line.x1=' + line.attr('x1'));

            // console.log('line.y1=' + line.y1);
            // console.log('line.y2=' + line.y2);

            const display = relationshipToolBoxRef.style("display");
            // console.log('display=' + display);

            if (display === "none") {
                const lineX1 = +line.attr('x1') + 130;
                const lineX2 = +line.attr('x2') + 130;
                const lineY1 = +line.attr('y1') + 30;
                const lineY2 = +line.attr('y2') + 30;
                const middleX = (lineX1 + lineX2) / 2;
                const middleY = (lineY1 + lineY2) / 2;

                relationshipToolBoxRef
                    .attr("transform", `translate(${middleX - relationshipToolBoxWidth / 2}, ${middleY - relationshipToolBoxHeight / 2})`)
                    .style("display", "block");

                //console.log("relationshipToolBoxRef should now be displayed");

            } else {
                relationshipToolBoxRef.style("display", "none");
            }
        }

        // Function to toggle the relationship tool box trigerred on 3 dots from line
        function toggleBoxToolBox(box) {
            // console.log("In the ToggleBoxToolBox ....");
            //console.log('box.id=' + box.id);


            const display = BoxToolBoxRef.style("display");
            // console.log('display=' + display);

            if (display === "none") {


                //calcX = d.x + (d.label.length * 10 + 20) / 2;
                var calcX = box.x + (rectWidth) / 2 - 70;
                var calcY = box.y - 70;


                BoxToolBoxRef
                    .attr("transform", `translate(${calcX}, ${calcY})`)
                    .style("display", "block");


            } else {
                BoxToolBoxRef.style("display", "none");
            }
        }


        // Function to toggle the BoxShapeBox tool box trigerred on 3 dots from line
        function toggleBoxShapeBox(box) {
            //console.log("In the toggleBoxShapeBox ....");
            //console.log('box.id=' + box.id);


            const display = BoxShapeBoxRef.style("display");
            //console.log('display=' + display);

            if (display === "none") {

                //console.log("Display of Shape is None, we are setting x and y to display ...");
                //calcX = d.x + (d.label.length * 10 + 20) / 2;
                var calcX = box.x + (rectWidth) / 2 - 70;
                var calcY = box.y - 70;

                //console.log('calcX', calcX);
                //console.log('calcY', calcY);

                BoxShapeBoxRef
                    .attr("transform", `translate(${calcX}, ${calcY})`)
                    .style("display", "block");

            } else {
                BoxShapeBoxRef.style("display", "none");
            }
        }


        // Function to toggle the BoxShapeBox tool box trigerred on 3 dots from line
        function toggleBoxIconBox(box) {
            //console.log("In the toggleBoxIconBox ....");
            //console.log('box.id=' + box.id);


            const display = BoxIconBoxRef.style("display");
            //console.log('display=' + display);

            if (display === "none") {

                //console.log("Display of Icon is None, we are setting x and y to display ...");
                //calcX = d.x + (d.label.length * 10 + 20) / 2;
                var calcX = box.x + (rectWidth) / 2 - 70;
                var calcY = box.y - 70;

                //console.log('calcX', calcX);
                //console.log('calcY', calcY);

                BoxIconBoxRef
                    .attr("transform", `translate(${calcX}, ${calcY})`)
                    .style("display", "block");


            } else {
                BoxIconBoxRef.style("display", "none");
            }
        }


        // Update the renderRelationships() function as shown below
        function renderRelationships() {
            //console.log('In Rendering the Relationships');
            updateSolidRelationships();
            updateCurvedRelationships();
        }


        // end of try renderMindMap
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
        takeSnapshot(mindMapData);
        renderMindMap(mindMapData);
    }
}


// Function to handle selecting a box =============================
function selectNode(nodeId) {

    //console.log("Selecting a Node in graph ..." + nodeId);
    //console.log("selectedNode=" + selectedNode);
    //console.log("addingrel=" + addingrel);

    var selectionType = '';
    if (addingrel == true) {
        selectionType = 'target';
    } else {
        selectionType = 'source';

    }

    //console.log("selectionType=" + selectionType);

    if (selectionType === 'source') {

        // first selection does not edit, second click will edit
        if (selectedNode == nodeId) {
            //console.log('Handling Edit ...');
            // Call handleRectEdit with a slight delay to ensure proper registration of the blur event listener
            setTimeout(function() {
                handleRectEdit();
            }, 100);
        }

        selectedNode = nodeId;

        // Close the relationship tool box when a node is selected
        if (nodeId === null) {
            hideRelationshipToolBox();
            hideBoxToolBox();
            hideBoxShapeBox();
            hideBoxIconBox();
            // Close the attribute container when nodeId is null
            hideAttributeContainer(); // Call a function to hide the attribute container

        } else {

            renderMindMap(mindMapData); // Re-render the mind map to apply the selection highlight

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

            addingrelsource = nodeId;

        }


        // Find the node in mindMapData based on nodeId
        const onexactnode = mindMapData.nodes.find((node) => node.id === selectedNode);
        // Check if the selectedNodeData is found
        if (onexactnode) {
            // Now you can access the attributes of the selected node

            populateAttributeContainer(onexactnode);

        }

    } else if (selectionType === 'target') {

        // Get the target node ID and return it to handleAddRelation
        addingreltarget = nodeId;

        const newRelationship = {
            id: `${addingrelsource}-${addingreltarget}`,
            source: addingrelsource,
            target: addingreltarget,
            type: 'dash',
            strokewidth: 1,
            stroke: 'black'
        };

        // Add the new relationship to the mind map data
        mindMapData.relationships.push(newRelationship);

        // Re-render the mind map to show the new relationship
        renderMindMap(mindMapData);
        addingrelsource = null;
        addingreltarget = null;
        addingrel = null;
    }


}


function populateAttributeContainer(nd) {
    //console.log("Container Node", nd);
    //console.log("Container Node ID ", nd.id);

    ndid = nd.id;
    ndshortDescription = nd.label;
    ndlongDescription = nd.description;
    ndicon = nd.icon;
    ndcompleted = nd.completed;
    ndcompletionDateTime = nd.compdate;

    updateAttributeContainer();

}

// Function to update the attribute container with the values of global variables
function updateAttributeContainer() {
    document.getElementById('ndid').textContent = ndid;
    document.getElementById('ndshortDescription').textContent = ndshortDescription;
    document.getElementById('ndlongDescription').value = ndlongDescription;

    document.getElementById('ndicon').textContent = ndicon;
    document.getElementById('ndcompleted').textContent = ndcompleted;
    document.getElementById('ndcompletionDateTime').textContent = ndcompletionDateTime;
}
// Add an event listener to the input field
const longDescriptionInput = document.getElementById('ndlongDescription');
const saveNodeDetails = document.getElementById('saveNodeDetails');

longDescriptionInput.addEventListener('input', function() {
    // Enable the Save button when the input value changes
    ndlongDescription = document.getElementById('ndlongDescription').value;
    saveNodeDetails.disabled = false;
});

saveNodeDetails.addEventListener('click', saveShapeDetails);

function saveShapeDetails() {
    const selectedNode = mindMapData.nodes.find((node) => node.id === ndid);
    selectedNode.description = ndlongDescription;
    takeSnapshot(mindMapData);
    // Update the color property in the mind map data
    // renderMindMap(mindMapData);
    hideAttributeContainer();
    common.showMessage('Saved ...', 2000);

}

// JavaScript to toggle the state of additional filter buttons

// Function to toggle button state between 'dimmed' and 'highlighted'
function toggleHighlight(button) {
    const buttonId = button.id;

    // Toggle the button state
    if (buttonId === 'starButton') {
        starButtonDimmed = !starButtonDimmed;
    } else if (buttonId === 'heartButton') {
        heartButtonDimmed = !heartButtonDimmed;
    } else if (buttonId === 'smileyButton') {
        smileyButtonDimmed = !smileyButtonDimmed;
    }

    // Toggle the button class for highlighting
    if (button.classList.contains('dimmed')) {
        button.classList.remove('dimmed');
        button.classList.add('highlighted');
    } else {
        button.classList.remove('highlighted');
        button.classList.add('dimmed');
    }
    // Update node styles based on button states
    ApplyFilterOnNodes();
}


// Add click event listeners to each button
heartButton.addEventListener('click', function() {
    toggleHighlight(this);
});

smileyButton.addEventListener('click', function() {
    toggleHighlight(this);
});

starButton.addEventListener('click', function() {
    toggleHighlight(this);
});

function ApplyFilterOnNodes() {
    // Select all nodes and update their styles based on button states
    nodes.each(function(d) {
        const node = d3.select(this);

        // Check the icon and button states to determine the class to apply
        if (d.icon === 'star' && starButtonDimmed) {
            node.classed('dimmed', true);
        } else if (d.icon === 'heart' && heartButtonDimmed) {
            node.classed('dimmed', true);
        } else if (d.icon === 'smily' && smileyButtonDimmed) {
            node.classed('dimmed', true);
        } else {
            node.classed('dimmed', false);
        }
    });
}




// Function to hide the relationship box
function hideRelationshipToolBox() {
    relationshipToolBoxRef.style("display", "none");
}
// Function to hide the relationship box
function hideBoxToolBox() {
    BoxToolBoxRef.style("display", "none");
}

function hideBoxShapeBox() {
    if (BoxShapeBoxRef) {
        BoxShapeBoxRef.style("display", "none");
    }
}

function hideBoxIconBox() {
    if (BoxIconBoxRef) {
        BoxIconBoxRef.style("display", "none");
    }
}

// Function to show the attribute container
function showAttributeContainer(selnode) {
    const attributeContainer = document.getElementById('attributeContainer');
    attributeContainer.style.display = 'block'; // Show the container

}


// Function to hide the attribute container
function hideAttributeContainer() {
    const attributeContainer = document.getElementById('attributeContainer');
    attributeContainer.style.display = 'none'; // Hide the container
}







// Listeners =============================
document.getElementById('submitButton').addEventListener('click', handleInputSubmit);
document.getElementById('r_savefile_Button').addEventListener('click', r_save_Button_handleSave);
document.getElementById('r_openfile_Button').addEventListener('click', r_open_Button_handleOpen);
// Attach undo and redo functions to Bootstrap buttons
document.getElementById('undoButton').addEventListener('click', undo);
document.getElementById('redoButton').addEventListener('click', redo);

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

    addingrel = true;

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
    //console.log("handleAddNode .... Start")
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
                label: 'Double Click to Edit',
                color: selectedNodeData.color,
                textColor: selectedNodeData.textColor,
                x: nextX,
                y: selectedNodeData.y + 100, // Adjust the y position of the new node
                children: [],
            };

            //console.log("newNodeID=" + newNodeId);
            //console.log("selectedNode=" + selectedNode);

            mindMapData.nodes.push(newNode);
            mindMapData.relationships.push({
                id: `${selectedNode}-${newNodeId}`,
                source: selectedNode,
                target: newNodeId,
                type: 'solid',
                strokewidth: 1,
                stroke: 'black'
            });


            selectedNode = newNodeId; // Select the new node

            // Re-render the mind map with the updated data
            renderMindMap(mindMapData);

            takeSnapshot(mindMapData);
        }
    }
}

function takeSnapshot(mindMapData) {
    console.log("Taking the Snapshot ....", mindMapData);
    // Fetch the latest current version or default to 0 if not found
    ismodified = 1;
    console.log("Current Version currentVersion before update = ", currentVersion);
    //console.log('--- mindMapData before  updateversion', mindMapData);
    common.setMindMapData(mindMapData);
    fikrcollab.sendUpdate(mindMapData);
    updateversion(common.getSessionId(), 'increment')
        .then(updatedCurrentVersion => {
            //console.log('mindMapData before delete ', mindMapData);
            currentVersion = updatedCurrentVersion;
            console.log("Current Version currentVersion after update = ", currentVersion);
            return deleteversions(common.getSessionId(), currentVersion);
        })
        .then(() => {
            console.log("Now taking the Snapshot .,,,");
            //console.log('mindMapData after delete', mindMapData);
            // Now, send the snapshot
            return fetch('http://localhost:3000/api/savesnapshot', {
                method: 'POST',
                body: JSON.stringify({
                    user: fikruser.getUserId(),
                    sessionid: common.getSessionId(),
                    jsondrw: mindMapData,
                    version: currentVersion
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        })
        .then(response => {
            if (response.ok) {
                console.log('Snapshot saved successfully');
                updateUndoRedoButtons();
            } else {
                console.error('Failed to save snapshot');
            }
        })
        .catch(error => {
            console.error('An error occurred:', error);
        });
}


// Function to fetch and render a specific versioned snapshot
async function fetchAndRenderVersion(version) {
    try {
        // console.log("searching for the element with fikruser.getUserId() = " + fikruser.getUserId())
        // console.log("searching for the element with common.getSessionId() = " + common.getSessionId())
        const vuserID = fikruser.getUserId();
        const vsessionID = common.getSessionId();
        const response = await fetch(`http://localhost:3000/api/getsnapshot?user=${vuserID}&sessionid=${vsessionID}&version=${version}`, {
            method: 'GET', // Use GET request
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const versionedSnapshot = await response.json();
            renderMindMap(versionedSnapshot.jsondrw);
            updateUndoRedoButtons();
        } else {
            console.error(`Failed to fetch versioned snapshot for version ${version}`);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function fetchcurrentdrawchainversion() {
    try {
        console.log("fetchcurrentdrawchainversion searching for the element with fikruser.getUserId() = " + fikruser.getUserId())
            //console.log("fetchcurrentdrawchainversion searching for the element with common.getSessionId() = " + common.getSessionId())
        const vuserID = fikruser.getUserId();
        const vsessionID = common.getSessionId();
        const response = await fetch(`http://localhost:3000/api/fetchcurrentdrawchainversion?user=${vuserID}&sessionid=${vsessionID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.currentVersion; // Assuming the API returns the current version
        } else {
            console.error('Failed to fetch current version');
            return null;
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return null;
    }
}

async function fetchcurrentdrawsessionversion() {
    try {
        //console.log("fetchcurrentdrawsessionversion searching for the element with fikruser.getUserId() = " + fikruser.getUserId())
        //console.log("fetchcurrentdrawsessionversion searching for the element with common.getSessionId() = " + common.getSessionId())
        const vuserID = fikruser.getUserId();
        const vsessionID = common.getSessionId();
        const response = await fetch(`http://localhost:3000/api/fetchcurrentdrawsessionversion?user=${vuserID}&sessionid=${vsessionID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.currentVersion; // Assuming the API returns the current version
        } else {
            console.error('Failed to fetch current version');
            return null;
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return null;
    }
}

async function undo() {
    console.log("Undoing ......");

    //currentVersion = await fetchcurrentdrawchainversion() || 0; // Fetch the latest current version
    //currentVersion = await fetchcurrentdrawsessionversion().catch(() => 0);
    //console.log("undo = currentVersion = " + currentVersion)
    currentVersion = await updateversion(common.getSessionId(), 'decrement');
    console.log("undo = currentVersion = " + currentVersion)
    await fetchAndRenderVersion(currentVersion);
    updateUndoRedoButtons();
}

async function redo(sessonID) {
    console.log("Redoing ......");

    //currentVersion = await fetchcurrentdrawchainversion() || 0; // Fetch the latest current version    
    //currentVersion = await fetchcurrentdrawsessionversion().catch(() => 0);
    // console.log("redo = currentVersion = " + currentVersion)

    currentVersion = await updateversion(common.getSessionId(), 'increment');
    console.log("redo = currentVersion = " + currentVersion)
    await fetchAndRenderVersion(currentVersion);

    updateUndoRedoButtons();
}



// Helper function to update undo and redo button states
async function updateUndoRedoButtons() {

    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');

    //console.log("Now getting the current version for session id = " + common.getSessionId());
    const chainVersion = await fetchcurrentdrawchainversion() || 0; // Fetch the latest current version
    console.log("updateUndoRedoButtons = currentVersion = " + currentVersion)
    console.log("updateUndoRedoButtons = chainVersion = " + chainVersion)

    undoButton.disabled = currentVersion <= 1;
    redoButton.disabled = currentVersion >= chainVersion;

}




function handleRectEdit() {
    //console.log('Handling Edit for ' + selectedNode);
    if (selectedNode) {
        const selectedNodeId = selectedNode;
        const selectedNodeElement = document.getElementById(`${selectedNodeId}`);
        const textElement = selectedNodeElement.querySelector('text[data-tag="recttext"], text[data-tag="ellipsetext"], [data-tag="parallelogramtext"]');
        // Open the attribute container when nodeId is not null
        showAttributeContainer(); // Call a function to show the attribute container

        if (textElement) {
            //console.log('Rect Text Foud ..');
            const currentText = textElement.textContent;
            //console.log(currentText);
            const rectextStyle = window.getComputedStyle(textElement);

            const rectextBox = textElement.getBBox();

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
            textElement.style.visibility = 'hidden';

            //console.log('handleEdit 1');
            // Apply focus and selection after the input element is rendered
            requestAnimationFrame(() => {
                //console.log('handleEdit 2');
                inputElement.focus();
                inputElement.select();
            });

            inputElement.addEventListener('blur', () => {
                // console.log('handleEdit 3');

                const newText = inputElement.value;
                textElement.textContent = newText;

                const selectedNodeData = mindMapData.nodes.find((node) => node.id === selectedNodeId);
                if (selectedNodeData) {
                    selectedNodeData.label = newText;
                }

                // Show the original text element after editing is done
                textElement.style.visibility = 'visible';

                selectedNodeElement.removeChild(foreignObject);
            });

            inputElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    hideAttributeContainer();
                    event.preventDefault();
                    inputElement.blur(); // Trigger blur event to save the entered text
                }
            });

            takeSnapshot(mindMapData);
        }
    }
}


function handleInputSubmit() {
    userInput = document.getElementById('textInput').value;
    sendChatMessage(userInput);
    common.showMessage('Generate Drawing ...', 2000);
    selectedFileNameElement.textContent = "";
    common.setFileName(null);


}


function r_open_Button_handleSave() {

    if (common.getFileName() === null)
        fileNameModal.show();
    else {
        r_open_Button_handleSaveDrawing();
        ismodified = 0;
    }
}


function r_save_Button_handleSave() {
    console.log("r_save_Button_handleSave common.getFileName() ...", common.getFileName());

    if (common.getFileName() === null) {
        console.log("r_save_Button_handleSave common filename is null ...");
        fileNameModal.show();
    } else {
        console.log("r_save_Button_handleSave common filename is not null ...");
        r_save_Button_conf_handleSaveDrawing();
        ismodified = 0;
    }
}


function handleColorPalette(type, id) {
    const colorPalette = document.getElementById("colorPalette");
    showColorPalette(type, id);

}

// Function to generate a random hexadecimal color code
function generateRandomColorCode() {
    const letters = "0123456789ABCDEF";
    let colorCode = "#";
    for (let i = 0; i < 6; i++) {
        colorCode += letters[Math.floor(Math.random() * 16)];
    }
    return colorCode;
}

function showColorPalette(type, id) {
    // Set the clicked box as the active box
    //console.log("showColorPalette for id =" + id, 'type =' + type);

    // Show the color palette
    colorPalette.innerHTML = "";

    for (let i = 0; i < 42; i++) {
        const colorCode = generateRandomColorCode();
        const colorPaletteColor = document.createElement("div");
        colorPaletteColor.className = "color-palette-color";
        colorPaletteColor.style.backgroundColor = colorCode;
        colorPaletteColor.addEventListener("click", function() {
            // Hide the color palette
            colorPalette.style.display = "none";

            if (type == 'line') {
                //console.log("Changing the Line Color");
                //console.log(`Current Line Id ${id}`);
                const lineElement = d3.select(`#${id}`);

                lineElement.style("stroke", colorCode);

                // Update the stroke-width in the mind map data
                const relationship = mindMapData.relationships.find((relation) => {
                    const slineId = `${relation.source}-${relation.target}`;
                    return slineId === id;
                });

                if (relationship) {
                    relationship.stroke = colorCode;
                    //console.log('Setting the mindMapData Color');
                }

            } else {
                // Set the selected color as the fill color of the active box
                if (id) {
                    //console.log("Change Color - Changing the Node Color id=" + id);
                    const boxElement = d3.select(`#${id} rect`);
                    boxElement.style("fill", colorCode);

                    // Update the color property in the mind map data
                    const nodeData = mindMapData.nodes.find((node) => node.id === id);
                    if (nodeData) {
                        //console.log('Updating mindMapData Color for Id =' + id);
                        nodeData.fill = colorCode;
                    }
                    renderMindMap(mindMapData);
                }
            }

            takeSnapshot(mindMapData);
        });
        colorPalette.appendChild(colorPaletteColor);
    }

    // Calculate the midpoint of the line or box
    if (type === 'line') {
        const lineId = id;
        const lineElement = d3.select(`#${id}`);
        const x1 = parseFloat(lineElement.attr("x1"));
        const y1 = parseFloat(lineElement.attr("y1"));
        const x2 = parseFloat(lineElement.attr("x2"));
        const y2 = parseFloat(lineElement.attr("y2"));
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // Position the color palette next to the midpoint of the line
        const paletteX = midX - 70; //- colorPalette.offsetWidth / 2;
        const paletteY = midY - 70; //- colorPalette.offsetHeight / 2;

        colorPalette.style.top = paletteY + "px";
        colorPalette.style.left = paletteX + "px";
    } else {
        // Position the color palette on top of the box
        const boxElement = d3.select(`#${id}`);
        //console.log("boxElement =" + boxElement.attr('id'))
        // Get the x and y attributes
        const x = parseFloat(boxElement.attr('transform').split(',')[0].split('(')[1]);
        const y = parseFloat(boxElement.attr('transform').split(',')[1].split(')')[0]);

        const paletteX = x + rectHeight;
        const paletteY = y - rectHeight;

        colorPalette.style.top = paletteY + "px";
        colorPalette.style.left = paletteX + "px";
    }

    // Show the color palette
    colorPalette.style.display = "block";
}



async function r_open_Button_handleOpen() {


    console.log("common.getFileName() = ", common.getFileName());
    console.log("ismodified = ", ismodified);


    if (common.getFileName()) {
        ////////////////////// File Already Selected 
        console.log("File Already Selected Ask to Save Before showing File Selection ...");

        if (ismodified == 1) {
            ////////////////////// File Already Selected and Modified ====> SAVE or IGNORE
            console.log("file is not null and ismodified is already equal 1");

            showSaveConfirmationModal();
        } else {
            displayfilelist();

        }


    } else {
        if (ismodified == 1)
        //////////////////////  File not there and is Modified
        {

            console.log("file is null and ismodified is already equal 1");

            showSaveConfirmationModal();

        } else // ismodified == 0 and file is null
        {
            displayfilelist();

        }

    }



    // Handle the "Save Changes" button click on the confirmation modal trigerred by open File button
    document.getElementById("r_open_Button_conf_saveDrawingButton").addEventListener("click", function() {
        // Perform your save changes logic here
        r_open_Button_conf_handleSaveDrawing();
        console.log("... Changes saved Now.");
        hideSaveConfirmationModal();
        console.log("... common.getFileName() =", common.getFileName());
        console.log("... ismodified =", ismodified)

        // saved existing file. Now shoe the list of existing files to switch to another file.
        if (common.getFileName() === null && ismodified == 1) {
            console.log("... File Empty and ismodified == 1")
            const fileNameInput = document.getElementById('fileNameInput');
            fileNameInput.value = "";
            fileNameModal.show(); // show the dialog where u need to enter the file name.
        }
        ismodified = 0;
    });
}

async function displayfilelist() {
    ////////////////////// File Not There Select File and Save
    console.log("File Not There Select File then Save...");

    const fileList = await fikrdraw.getDrawings();
    //console.log("printing the array to populate ...");
    //console.log("File List = ", fileList);
    populateFileList(fileList);

    const filelistmodalElement = document.getElementById('fileListModal');
    const filelistmodal = new bootstrap.Modal(filelistmodalElement);

    const fileListSelect = document.getElementById('fileListSelect');

    fileListSelect.addEventListener('change', () => {
        common.setFileName(fileListSelect.value);
    });

    const selectFileNameButton = document.getElementById('selectFileButton');
    const cancelFileNameButton = document.querySelector('[data-bs-dismiss="modal"]');

    selectFileNameButton.addEventListener('click', () => {
        if (fileListSelect.value) {
            filelistmodal.hide();
            const selectedFile = fileList.find((file) => file.fileName === fileListSelect.value);
            const selectedJsondrw = selectedFile.jsondrw;
            //console.log('Selected jsondrw file', selectedFile.fileName);
            //console.log('Selected jsondrw:', selectedJsondrw);
            //console.log("selectedFileNameElement.textContent fileListSelect.value = ", fileListSelect.value);
            selectedFileNameElement.textContent = fileListSelect.value;
            mindMapData = selectedJsondrw
            renderMindMap(mindMapData);

        } else {
            alert('Please select a file.'); // Show an alert to prompt the user to select a file
        }
    });

    cancelFileNameButton.addEventListener('click', () => {
        filelistmodal.hide();
    });

    filelistmodal.show();

}


// Function to show the Save confirmation modal
function showSaveConfirmationModal() {
    saveconfirmationModal.show();
}

// Function to hide the Save confirmation modal
function hideSaveConfirmationModal() {
    console.log("Hiding now the Confirmation Dialog ....");
    saveconfirmationModal.hide();
}





async function updateversion(vsessionid, voperation) {
    try {

        //console.log("calling updateversion API on the server ...");
        //console.log("--- mindMapData in update version before updating ... ", mindMapData);
        const response = await fetch('http://localhost:3000/api/updateversion', {
            method: 'POST',
            body: JSON.stringify({
                sessionid: vsessionid,
                operation: voperation
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            //console.log("--- mindMapData in update version after updating ... ", mindMapData);

            const data = await response.json(); // Parse the JSON response
            if (data.success) {
                // console.log("updateversion get back with success and result");
                const result = data.result; // Access the result property
                console.log('Version Updated Successfully');
                console.log(data);
                // Perform any necessary UI updates or redirects after successful saving
                return result; // Return the result
            } else {
                console.error('Failed to update Version');
                // Handle the error and provide appropriate user feedback
                return null; // Return null for unsuccessful operation
            }
        } else {
            console.error('Failed to update Version');
            // Handle the error and provide appropriate user feedback
            return null; // Return null for unsuccessful operation
        }
    } catch (error) {
        console.error('An error occurred:', error);
        // Handle the error and provide appropriate user feedback
        return null; // Return null for error
    }
}


// delete the interrupted version, after adding new position after undo, all other versions after to be deleted
async function deleteversions(vsessionid, vversion) {
    const targetdelete = vversion
    console.log("Deleting All Versions after or equal ..." + targetdelete);
    // Proceed with saving using the file name
    try {
        const response = await fetch('http://localhost:3000/api/deleteversions', {
            method: 'POST',
            body: JSON.stringify({
                sessionid: vsessionid,
                targetVersion: targetdelete
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Versions Deleted Successfully');
            // Perform any necessary UI updates or redirects after successful saving
        } else {
            console.error('Failed to Delete Versions');
            // Handle the error and provide appropriate user feedback
        }
    } catch (error) {
        console.error('An error occurred:', error);
        // Handle the error and provide appropriate user feedback
    }
}


// Function to populate the file list select options
function populateFileList(fileList) {
    const fileListSelect = document.getElementById('fileListSelect');
    // Clear existing options
    fileListSelect.innerHTML = '';

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


document.addEventListener("DOMContentLoaded", function() {

    // Add a click event listener to the "Save" button (add name to drawing and save)
    const r_save_Button_conf_saveDrawingButton = document.getElementById("r_save_Button_conf_saveDrawingButton");


    const fileNameInput = document.getElementById("fileNameInput");
    let drawingExistsInBlur = false; // Initialize a flag
    let blurEventPromise = Promise.resolve(); // Initialize a resolved promise

    // Add a blur event listener to the userIdInput field
    fileNameInput.addEventListener("blur", async() => {
        console.log("on blur of duplicate drawing field - Start - ....");
        const drawingname = fileNameInput.value;
        console.log("on blur of duplicate drawing field drawingname.... ", drawingname);
        if (!common.isFieldEmpty(drawingname)) {
            console.log("on blur of duplicate drawing field drawingname is not empty ", drawingname);
            // Check if the user already exists
            blurEventPromise = fikrdraw.getDrawings(drawingname)
                .then(drawingExists => {
                    console.log("drawingExists", drawingExists);
                    if (drawingExists.status == "drawing_found") {
                        // Show an error message with the suggestion
                        common.showFieldError('fileNameInput', 'Drawing Exist Already, Choose another Name ...');
                        drawingExistsInBlur = true;
                        return;
                    } else {
                        common.showFieldError('fileNameInput', '', true); // Clear the error
                        console.log("Blur - Drawing Name entered is not found, so continue");
                        drawingExistsInBlur = false;

                    }
                })
                .catch(error => {
                    console.error('Error getting drawing:', error);
                });
        } else {
            common.showFieldError('fileNameInput', 'File Name is required.');
        }

        console.log("on blur of duplicate drawing field - End - ....");
    });

    if (r_save_Button_conf_saveDrawingButton) {
        // console.log("Save Drawing - Clicked Save Button");
        r_save_Button_conf_saveDrawingButton.addEventListener("click", r_save_Button_conf_handleSaveDrawing);
    }

    async function r_save_Button_conf_handleSaveDrawing() {
        console.log("r_save_Button_conf_handleSaveDrawing Clicked - Start - ..");


        // Wait for the blur event promise to resolve
        await blurEventPromise;


        // if drawing exist in Blur then don't continue
        if (drawingExistsInBlur == true)
            return;
        if (common.getFileName()) {
            console.log("r_save_Button_conf_handleSaveDrawing = common.getFileName: " + common.getFileName());

            // Now you can use the fileName for your save operation
            if (fikrdraw.saveDrawing(common.getFileName(), mindMapData, fikruser.getUserId(), common.getSessionId())) {
                ismodified = 0;

            }
        } else if (fileNameInput.value) { // File Name is null but User has gave already the name to set 
            console.log("r_save_Button_conf_handleSaveDrawing = Selected File Name: " + fileNameInput.value);

            // Now you can use the fileName for your save operation
            if (fikrdraw.saveDrawing(fileNameInput.value, mindMapData, fikruser.getUserId(), common.getSessionId())) {
                common.setFileName(fileNameInput.value);
                console.log("fileNameInputhas been saved under : ", common.getFileName());
                //console.log("selectedFileNameElement.textContent from fileName = ", fileName);
                //selectedFileNameElement.textContent = fileName; // the Banner Selected File Updated
                // now ensure always that the "Select File Name" form has no value when selecting again to save
                fileNameInput.value = "";
                selectedFileNameElement.textContent = common.getFileName();
                ismodified = 0;
            }
        } else {
            console.error("fileNameInput not found or is null");
            common.showFieldError('fileNameInput', 'File Name is required.');
        }





    }



    // Add a click event listener to the "Save" button (add name to drawing and save)
    const r_duplicate_Button_conf_duplicateDrawingButton = document.getElementById("r_duplicate_Button_conf_duplicateDrawingButton");

    if (r_duplicate_Button_conf_duplicateDrawingButton) {
        //console.log("Duplicate Drawing - Clicked Duplicate Form Button");
        r_duplicate_Button_conf_duplicateDrawingButton.addEventListener("click", r_duplicate_Button_conf_handleDuplicateDrawing);
    }

    // Add a click event listener to the "Duplicate" button (MENU DUPLICATE)
    const duplicateButton = document.getElementById("duplicate");
    if (duplicateButton) {
        duplicateButton.addEventListener("click", function() {
            // Clear the form fields when opening the modal
            document.getElementById("fileNameDuplicateInput").value = "";

            // Trigger the modal to show
            const fileNameDuplicateModal = new bootstrap.Modal(document.getElementById('fileNameDuplicateModal'));
            fileNameDuplicateModal.show();
        });
    }


    const fileNameDuplicateInput = document.getElementById("fileNameDuplicateInput");
    drawingExistsInBlur = false; // Initialize a flag
    blurEventPromise = Promise.resolve(); // Initialize a resolved promise

    // Add a blur event listener to the userIdInput field
    fileNameDuplicateInput.addEventListener("blur", async() => {
        console.log("on blur of duplicate drawing field - Start - ....");
        const drawingname = fileNameDuplicateInput.value;
        console.log("on blur of duplicate drawing field drawingname.... ", drawingname);
        if (!common.isFieldEmpty(drawingname)) {
            console.log("on blur of duplicate drawing field drawingname is not empty ", drawingname);
            // Check if the user already exists
            blurEventPromise = fikrdraw.getDrawings(drawingname)
                .then(drawingExists => {
                    console.log("drawingExists", drawingExists);
                    if (drawingExists.status == "drawing_found") {
                        // Show an error message with the suggestion
                        common.showFieldError('fileNameDuplicateInput', 'Drawing Exist Already, Choose another Name ...');
                        drawingExistsInBlur = true;
                        return;
                    } else {
                        common.showFieldError('fileNameDuplicateInput', '', true); // Clear the error
                        console.log("Blur - Drawing Name entered is not found, so continue");
                        drawingExistsInBlur = false;

                    }
                })
                .catch(error => {
                    console.error('Error getting drawing:', error);
                });
        } else {
            common.showFieldError('fileNameDuplicateInput', 'File Name is required.');
        }

        console.log("on blur of duplicate drawing field - End - ....");
    });


    async function r_duplicate_Button_conf_handleDuplicateDrawing() {
        console.log("r_duplicate_Button_conf_handleDuplicateDrawing Clicked - Start - ..");


        // Wait for the blur event promise to resolve
        await blurEventPromise;


        // if drawing exist in Blur then don't continue
        if (drawingExistsInBlur == true)
            return;

        if (fileNameDuplicateInput.value) { // File Name is null but User has gave already the name to set 
            console.log("r_duplicate_Button_conf_handleDuplicateDrawing = Selected File Name: " + fileNameDuplicateInput.value);
            common.setFileName(fileNameDuplicateModal.value);

            // Now you can use the fileName for your save operation
            if (fikrdraw.duplicateDrawing(fileNameDuplicateInput.value, mindMapData, fikruser.getUserId(), common.getSessionId())) {
                common.setFileName(fileNameDuplicateInput.value);
                console.log("fileNameDuplicateInput has been saved under : ", common.getFileName());
                //console.log("selectedFileNameElement.textContent from fileName = ", fileName);
                //selectedFileNameElement.textContent = fileName; // the Banner Selected File Updated
                // now ensure always that the "Select File Name" form has no value when selecting again to save
                fileNameDuplicateInput.value = "";
                selectedFileNameElement.textContent = common.getFileName();
                ismodified = 0;
                $('#fileNameDuplicateModal').modal('hide');

            }
        } else {
            console.error("fileNameDuplicateInput not found or is null");
            common.showFieldError('fileNameDuplicateInput', 'File Name is required.');
        }
    }

});





function r_open_Button_conf_handleSaveDrawing() {
    // Get the file name from the input field
    console.log("r_open_Button_conf_handleSaveDrawing FileName : ", common.getFileName());

    if (common.getFileName()) {
        console.log("r_open_Button_conf_handleSaveDrawing = Selected File Name: " + common.getFileName());

        // Now you can use the fileName for your save operation
        if (fikrdraw.saveDrawing(common.getFileName(), mindMapData, fikruser.getUserId(), common.getSessionId())) {
            console.log("fileNameInputhas been saved under : ", common.getFileName());
            //console.log("selectedFileNameElement.textContent from fileName = ", fileName);
            //selectedFileNameElement.textContent = fileName; // the Banner Selected File Updated
            // now ensure always that the "Select File Name" form has no value when selecting again to save
            const fileNameInput = document.getElementById('fileNameInput');
            fileNameInput.value = "";
        }
    } else {
        console.error("FileName not found or is null");
    }
}

// Function to send a POST request to generate the XLSX file
async function generateXLSX(mindMapData) {
    try {
        const response = await fetch('http://localhost:3000/api/export-xlsx', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mindMapData),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("data returned =", data);
            if (data) {
                // If the request was successful, initiate the download
                console.log("Got downloadable link :", data.downloadLink);
                // Construct the full URL with the host and port of your container
                const fullUrl = "http://localhost:3000/" + data.downloadLink;

                // Set the href attribute of the download link
                const downloadLink = document.getElementById('downloadLink');
                downloadLink.href = fullUrl;

                // Show the modal
                $('#downloadModal').modal('show');
            } else {
                console.error('Error:', data.error);
            }
        } else {
            console.error('Request failed with status:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


export { renderMindMap };