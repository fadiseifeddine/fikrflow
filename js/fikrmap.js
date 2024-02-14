// Import everything from common.js as a module
import * as common from './common.js';
import * as fikruser from './fikruser.js';
import * as fikrdraw from './fikrdraw.js';
import * as fikrcollab from './fikrcollab.js';

let mindMapData = '';
let selectedNode = null;
let sourceNode = null;
let ismodified = 0;
let svg = null;
let graphGroup = null;
let rectNodes = null;

let blurEventPromise = null;
let drawingExistsInBlur = false; // Initialize a flag


// Define API base URL
let baseUrlfikrflowserver = '';
console.log("window.location.hostname =" + window.location.hostname);
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrlfikrflowserver = 'https://fikrflowserver-g74cb7lg5a-uc.a.run.app'; // Cloud Run URL
} else {
    baseUrlfikrflowserver = 'http://localhost:3000'; // Local URL
}
console.log("baseUrlfikrflowserver =" + baseUrlfikrflowserver);

// Define API base URL
let baseUrlfikrmapserver = '';
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    baseUrlfikrmapserver = 'https://fikrmapserver-g74cb7lg5a-uc.a.run.app'; // Cloud Run URL
} else {
    baseUrlfikrmapserver = 'http://localhost:3005'; // Local URL
}


// prevent dragging when clicking the checkbox in the node
let allowDrag = true;

let cornerRadius = 10; // Adjust the corner radius as needed


// Calculate the coordinates of the parallelogram points
var angleDegrees = 85
var angleRadians = (angleDegrees * Math.PI) / 180;
var yOffset = (common.nodesize.width.parallelogram / Math.tan(angleRadians)) / 2;

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
let dotGroup = null;
let dotCircle = null; // Define the variable to hold the dot circle element
let dotsText = null;

// BoxToolBox
let BoxToolBox = null;

let nodes = null;
let solidRelationships = null;
let label = null;
let curvedRelationships = null;

let simulation = null;

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

// scale
let currentTransform = { k: 1, x: 0, y: 0 };


const drawingContainer = document.getElementById('drawingContainer');

// Modal for Saving the Drawing under a File Name
const fileNameModal = new bootstrap.Modal(document.getElementById('fileNameModal'));
// Save Confirmation of the File
const saveconfirmationModal = new bootstrap.Modal(document.getElementById("saveconfirmationModal"));


let transformManager = {
    get currentTransform() {
        return currentTransform;
    },
    set currentTransform(transform) {
        currentTransform = transform;
    }
};

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

                fikrdraw.getUploads(); // get the uploaded files into the list
            });
    } catch (error) {
        // Handle any errors that occur during session retrieval
        console.error('Error retrieving session:', error);
        alert('Error: Failed to retrieve session ID');
    }
});


document.addEventListener('DOMContentLoaded', function() {

    // File Import Start ------------------------------------------------------------
    const dragDropArea = document.getElementById("dragDropArea");

    dragDropArea.addEventListener("dragover", function(event) {
        event.preventDefault();
        dragDropArea.classList.add("drag-over");
    });

    dragDropArea.addEventListener("dragleave", function() {
        dragDropArea.classList.remove("drag-over");
    });

    dragDropArea.addEventListener("drop", function(event) {
        console.log("drop");
        event.preventDefault();
        dragDropArea.classList.remove("drag-over");
        const files = event.dataTransfer.files;
        handleFiles(files);
    });

    // Event listener for the Import button
    document.getElementById('importButton').addEventListener('click', async function() {
        const fileInput = document.getElementById('xlsInput');
        const file = fileInput.files[0];
        if (file) {
            try {
                await handleFiles(file);
                // You now have the mindMapData object from the XLSX file
            } catch (error) {
                console.error('Error:', error);
            }
        }

        // File Import End ------------------------------------------------------------


    });

    // Event listener for the Import button
    document.getElementById('uploadButton').addEventListener('click', async function() {
        const fileInput = document.getElementById('docInput');
        const file = fileInput.files[0];
        if (file) {
            try {
                await uploadFiles(file);
                // You now have the mindMapData object from the XLSX file
            } catch (error) {
                console.error('Error:', error);
            }
        }

        // File Import End ------------------------------------------------------------


    });


});

// Handle click event on uploaddocdropdown element
document.getElementById('uploaddoc').addEventListener('click', function() {
    console.log("Upload Modal ....");

    const uploaddocElement = document.getElementById('uploaddocmodal');
    console.log("uploaddocElement", uploaddocElement);
    const uploaddocModal = new bootstrap.Modal(uploaddocElement, {
        backdrop: true
    });
    uploaddocModal.show();
});


document.getElementById('sample_nt_visual').addEventListener('click', function() {
    console.log("samplevisual ....");

    // const mindMapDataJson = {
    //     "nodes": [{
    //             "id": "s1",
    //             "parentId": null,
    //             "label": "Node 1 Shape represents the first node label",
    //             "description": "This is the long description",
    //             "fill": "#FFFFE0",
    //             "textColor": "#000",
    //             "fontFamily": "Arial",
    //             "fontSize": "12px",
    //             "completed": false,
    //             "compdate": null,
    //             "strokewidth": 1,
    //             "shape": "rectangle",
    //             "icon": "heart",
    //             "x": 0,
    //             "y": 0,
    //             "index": 0,
    //             "vy": 0,
    //             "vx": 0
    //         },
    //         {
    //             "id": "s2",
    //             "parentId": null,
    //             "label": "Node 2 Shape represents the second node label",
    //             "description": "This is the long description",
    //             "fill": "#FFFFE0",
    //             "textColor": "#000",
    //             "fontFamily": "Arial",
    //             "fontSize": "12px",
    //             "completed": false,
    //             "compdate": null,
    //             "strokewidth": 1,
    //             "shape": "diamond",
    //             "icon": "star",
    //             "x": 0,
    //             "y": 0,
    //             "index": 0,
    //             "vy": 0,
    //             "vx": 0
    //         },
    //         {
    //             "id": "s3",
    //             "parentId": null,
    //             "label": "Node 3 Shape represents the third node label",
    //             "description": "This is the long description",
    //             "fill": "#FFFFE0",
    //             "textColor": "#000",
    //             "fontFamily": "Arial",
    //             "fontSize": "12px",
    //             "completed": false,
    //             "compdate": null,
    //             "strokewidth": 1,
    //             "shape": "rectangle",
    //             "icon": "smily",
    //             "x": 0,
    //             "y": 0,
    //             "index": 0,
    //             "vy": 0,
    //             "vx": 0
    //         },
    //         {
    //             "id": "s4",
    //             "parentId": null,
    //             "label": "Node 4 Shape represents the fourth node label",
    //             "description": "This is the long description",
    //             "fill": "lightblue",
    //             "textColor": "#000",
    //             "fontFamily": "Arial",
    //             "fontSize": "12px",
    //             "completed": false,
    //             "compdate": null,
    //             "strokewidth": 3,
    //             "shape": "ellipse",
    //             "icon": null,
    //             "x": 0,
    //             "y": 0,
    //             "index": 0,
    //             "vy": 0,
    //             "vx": 0
    //         },
    //         {
    //             "id": "s5",
    //             "parentId": null,
    //             "label": "Node 5 Shape represents the fifth node label",
    //             "description": "This is the long description",
    //             "fill": "red",
    //             "textColor": "#000",
    //             "fontFamily": "Arial",
    //             "fontSize": "12px",
    //             "completed": false,
    //             "compdate": null,
    //             "strokewidth": 1,
    //             "shape": "parallelogram",
    //             "icon": null,
    //             "x": 0,
    //             "y": 0,
    //             "index": 0,
    //             "vy": 0,
    //             "vx": 0
    //         },
    //         {
    //             "id": "s6",
    //             "parentId": null,
    //             "label": "Node 6 Shape represents the sixth node label",
    //             "description": "This is the long description",
    //             "fill": "#FFFFE0",
    //             "textColor": "#000",
    //             "fontFamily": "Arial",
    //             "fontSize": "12px",
    //             "completed": false,
    //             "compdate": null,
    //             "strokewidth": 3,
    //             "shape": "parallelogram",
    //             "icon": null,
    //             "x": 0,
    //             "y": 0,
    //             "index": 0,
    //             "vy": 0,
    //             "vx": 0
    //         },
    //         {
    //             "id": "s7",
    //             "parentId": null,
    //             "label": "Node 7 Shape represents the seventh node label",
    //             "description": "This is the long description",
    //             "fill": "#FFFFE0",
    //             "textColor": "#000",
    //             "fontFamily": "Arial",
    //             "fontSize": "12px",
    //             "completed": false,
    //             "compdate": null,
    //             "strokewidth": 3,
    //             "shape": "parallelogram",
    //             "icon": null,
    //             "x": 0,
    //             "y": 0,
    //             "index": 0,
    //             "vy": 0,
    //             "vx": 0
    //         },
    //         {
    //             "id": "s8",
    //             "parentId": null,
    //             "label": "Node 8 Shape represents the eighth node label",
    //             "description": "This is the long description",
    //             "fill": "#FFFFE0",
    //             "textColor": "#000",
    //             "fontFamily": "Arial",
    //             "fontSize": "12px",
    //             "completed": false,
    //             "compdate": null,
    //             "strokewidth": 3,
    //             "shape": "parallelogram",
    //             "icon": null,
    //             "x": 0,
    //             "y": 0,
    //             "index": 0,
    //             "vy": 0,
    //             "vx": 0
    //         }
    //     ],
    //     "relationships": [{
    //             "id": "s1-s2",
    //             "source": "s1",
    //             "target": "s2",
    //             "type": "solid",
    //             "stroke": "black",
    //             "strokewidth": 3,
    //             "relation_label": { "label": "connected to", "color": "red" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         },
    //         {
    //             "id": "s2-s3",
    //             "source": "s2",
    //             "target": "s3",
    //             "type": "solid",
    //             "stroke": "black",
    //             "strokewidth": 1,
    //             "relation_label": { "label": null, "color": "blue" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         },
    //         {
    //             "id": "s3-s4",
    //             "source": "s3",
    //             "target": "s4",
    //             "type": "solid",
    //             "stroke": "black",
    //             "strokewidth": 1,
    //             "relation_label": { "label": null, "color": "blue" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         },
    //         {
    //             "id": "s4-s5",
    //             "source": "s4",
    //             "target": "s5",
    //             "type": "solid",
    //             "stroke": "black",
    //             "strokewidth": 1,
    //             "relation_label": { "label": null, "color": "blue" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         },
    //         {
    //             "id": "s5-s6",
    //             "source": "s5",
    //             "target": "s6",
    //             "type": "solid",
    //             "stroke": "black",
    //             "strokewidth": 2,
    //             "relation_label": { "label": null, "color": "blue" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         },
    //         {
    //             "id": "s5-s3",
    //             "source": "s5",
    //             "target": "s3",
    //             "type": "dash",
    //             "stroke": "black",
    //             "strokewidth": 2,
    //             "relation_label": { "label": null, "color": "blue" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         },
    //         {
    //             "id": "s6-s7",
    //             "source": "s6",
    //             "target": "s7",
    //             "type": "solid",
    //             "stroke": "black",
    //             "strokewidth": 2,
    //             "relation_label": { "label": null, "color": "green" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         },
    //         {
    //             "id": "s7-s8",
    //             "source": "s7",
    //             "target": "s8",
    //             "type": "solid",
    //             "stroke": "black",
    //             "strokewidth": 2,
    //             "relation_label": { "label": null, "color": "green" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         },
    //         {
    //             "id": "s8-s1",
    //             "source": "s8",
    //             "target": "s1",
    //             "type": "solid",
    //             "stroke": "black",
    //             "strokewidth": 2,
    //             "relation_label": { "label": null, "color": "orange" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         },
    //         {
    //             "id": "s7-s2",
    //             "source": "s7",
    //             "target": "s2",
    //             "type": "solid",
    //             "stroke": "black",
    //             "strokewidth": 2,
    //             "relation_label": { "label": null, "color": "purple" },
    //             "x1": 0,
    //             "y1": 0,
    //             "x2": 0,
    //             "y2": 0
    //         }
    //     ]
    // }

    const mindMapDataJson = {
        "nodes": [{
                "compdate": null,
                "completed": false,
                "description": "The WLC9800 is a high-performance wireless controller designed for large-scale enterprise networks.",
                "fill": "#FFFFE0",
                "fontFamily": "Arial",
                "fontSize": "12px",
                "icon": null,
                "id": "s1",
                "index": 0,
                "label": "WLC9800 Specifications",
                "parentId": null,
                "shape": "rectangle",
                "strokewidth": 1,
                "textColor": "#000",
                "vx": 0.0007738850773528688,
                "vy": 0.0047176349678893755,
                "x": 405.55959917409587,
                "y": 395.4345372002832
            },
            {
                "compdate": null,
                "completed": false,
                "description": "The WLC9800 can support up to 100,000 clients and 10,000 access points.",
                "fill": "#FFFFE0",
                "fontFamily": "Arial",
                "fontSize": "12px",
                "icon": null,
                "id": "s2",
                "index": 1,
                "label": "Performance",
                "parentId": "s1",
                "shape": "rectangle",
                "strokewidth": 1,
                "textColor": "#000",
                "vx": -0.005397826045633838,
                "vy": -0.00039854876609599283,
                "x": 310.31272129734634,
                "y": 380.5087618181211
            },
            {
                "compdate": null,
                "completed": false,
                "description": "The WLC9800 can be scaled up to support multiple sites and thousands of access points.",
                "fill": "#FFFFE0",
                "fontFamily": "Arial",
                "fontSize": "12px",
                "icon": null,
                "id": "s3",
                "index": 2,
                "label": "Scalability",
                "parentId": "s1",
                "shape": "rectangle",
                "strokewidth": 1,
                "textColor": "#000",
                "vx": 0.004221072804917199,
                "vy": -0.000752863194486197,
                "x": 468.46421426755813,
                "y": 336.5368048037027
            },
            {
                "compdate": null,
                "completed": false,
                "description": "The WLC9800 offers a variety of security features, including firewall, intrusion detection, and VPN.",
                "fill": "#FFFFE0",
                "fontFamily": "Arial",
                "fontSize": "12px",
                "icon": null,
                "id": "s4",
                "index": 3,
                "label": "Security",
                "parentId": "s1",
                "shape": "rectangle",
                "strokewidth": 1,
                "textColor": "#000",
                "vx": -0.005291618636220945,
                "vy": 0.00282885045317756,
                "x": 176.71275379137953,
                "y": 471.44304507021593
            },
            {
                "compdate": null,
                "completed": false,
                "description": "The WLC9800 can be managed through a web-based interface or a command-line interface.",
                "fill": "#FFFFE0",
                "fontFamily": "Arial",
                "fontSize": "12px",
                "icon": null,
                "id": "s5",
                "index": 4,
                "label": "Management",
                "parentId": "s1",
                "shape": "rectangle",
                "strokewidth": 1,
                "textColor": "#000",
                "vx": 0.005863275401081568,
                "vy": -0.00628790132777938,
                "x": 520.8527610199234,
                "y": 259.8716530950587
            }
        ],
        "relationships": [{
                "id": "s1-s2",
                "relation_label": {
                    "color": "#000",
                    "label": "Performance"
                },
                "source": "s1",
                "stroke": "black",
                "strokewidth": 3,
                "target": "s2",
                "type": "solid",
                "x1": 0,
                "x2": 0,
                "y1": 0,
                "y2": 0
            },
            {
                "id": "s1-s3",
                "relation_label": {
                    "color": "#000",
                    "label": "Scalability"
                },
                "source": "s1",
                "stroke": "black",
                "strokewidth": 3,
                "target": "s3",
                "type": "solid",
                "x1": 0,
                "x2": 0,
                "y1": 0,
                "y2": 0
            },
            {
                "id": "s1-s4",
                "relation_label": {
                    "color": "#000",
                    "label": "Security"
                },
                "source": "s1",
                "stroke": "black",
                "strokewidth": 3,
                "target": "s4",
                "type": "solid",
                "x1": 0,
                "x2": 0,
                "y1": 0,
                "y2": 0
            },
            {
                "id": "s1-s5",
                "relation_label": {
                    "color": "#000",
                    "label": "Management"
                },
                "source": "s1",
                "stroke": "black",
                "strokewidth": 3,
                "target": "s5",
                "type": "solid",
                "x1": 0,
                "x2": 0,
                "y1": 0,
                "y2": 0
            }
        ]
    }

    mindMapData = common.calculateNodePositions(mindMapDataJson, currentTransform);
    console.log('Adjusted mind map data with positions:', mindMapData);
    renderMindMap(mindMapData);
    common.showMessage('Generate Drawing ...', 2000);

});

document.getElementById('sample_hr_visual').addEventListener('click', function() {
    console.log("samplevisualhr ....");


    const mindMapDataJson = [{
        "name": "RootD344444444",
        "children": [{
                "name": "Child 1",
                "children": [
                    { "name": "HTML & CSS1" },
                    { "name": "JavaScript" },
                    { "name": "DOM" },
                    { "name": "SVG" },
                    { "name": "test\ntest" }
                ]
            },
            {
                "name": "安装",
                "collapse": true,
                "children": [
                    { "name": "折叠节点" }
                ]
            },
            {
                "name": "入门",
                "children": [
                    { "name": "选择集" },
                    { "name": "test" },
                    { "name": "绑定数据" },
                    { "name": "添加删除元素 ADD" },
                    {
                        "name": "简单图形",
                        "children": [
                            { "name": "柱形图" },
                            { "name": "折线图" },
                            { "name": "散点图" }
                        ]
                    },
                    { "name": "比例尺" },
                    { "name": "生成器" },
                    { "name": "过渡" }
                ],
                "left": true
            },
            {
                "name": "进阶",
                "left": true
            },
            {
                "name": "一级节点",
                "children": [
                    { "name": "子节点1" },
                    { "name": "子节点2" },
                    { "name": "子节点3" }
                ]
            }
        ]
    }]

    //mindMapData = common.calculateNodePositions(mindMapDataJson, currentTransform);
    //console.log('Adjusted mind map data with positions:', mindMapData);
    //renderMindMap(mindMapData);
    generateMindmap(mindMapDataJson);
    common.showMessage('Generate Drawing ...', 2000);

});


// Handle click event on importxlsdropdown element
document.getElementById('importxls').addEventListener('click', function() {
    console.log("Importing Modal ....");

    const importXlsElement = document.getElementById('importxlsmodal');
    console.log("importXlsElement", importXlsElement);
    const importXlsModal = new bootstrap.Modal(importXlsElement, {
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
async function sendChatMessage(message, search_doc) {
    try {
        console.log("sendChatMessage with message =", message, "search_doc =", search_doc);
        const response = await fetch(`${baseUrlfikrflowserver}/api/sendprompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: message,
                searchdoc: search_doc
            })
        });


        const llmResult = await response.json();
        console.log("Upload Result:", llmResult);

        if (llmResult) {
            const {
                mindMapDataJson
            } = llmResult;

            console.log('Received mind map data:', mindMapDataJson);
            //jsondrw = mindMapDataJson;

            mindMapData = common.calculateNodePositions(mindMapDataJson, currentTransform);
            console.log('Adjusted mind map data with positions:', mindMapData);
            renderMindMap(mindMapData);
            common.showMessage('Generate Drawing ...', 2000);

            console.log("Takesnapshot trigerred by sendchatmessage ...");
            takeSnapshot(mindMapData); // the version 1

        } else {
            console.error('Error sending chat message:', response.status);
            common.showMessage('Error sending chat message ...', 2000);

        }
    } catch (error) {
        console.error('Error sending chat message:', error);
        common.showMessage('Error sending chat message ...', 2000);
    }
}
//////////////////////

async function handleFiles(file) { // import drawing
    console.log("Handling the files ....", file);
    if (
        file.type === "application/vnd.ms-excel" ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx")
    ) {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${baseUrlfikrflowserver}/api/upload_importdrawing`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log("data", data); // Log the server's response
                //console.log('Hiding the Modal ....');
                $('#fileNameModal').modal('hide');
                const importxlsModal = bootstrap.Modal.getInstance(document.getElementById('importxlsmodal'));
                importxlsModal.hide();
                renderMindMap(data.result);
            } else {
                console.error("Error uploading  for import the file:", response.statusText);
            }
        } catch (error) {
            console.error("Error uploading  for import the file:", error);
        }
    } else {
        alert("Please upload for import a valid XLS or XLSX file.");
    }
}



async function uploadFiles(file) { // upload for LLM
    console.log("Upload the files ...", file);

    const allowedTypes = [
        "application/vnd.ms-excel", // XLS
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
        "application/pdf", // PDF
        "application/msword", // DOC
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // DOCX
    ];

    if (allowedTypes.includes(file.type) || file.name.endsWith(".xlsx")) {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${baseUrlfikrflowserver}/api/upload_llm`, {
                method: "POST",
                body: formData,
            });

            const uploaddocModal = bootstrap.Modal.getInstance(document.getElementById('uploaddocmodal'));

            if (response.ok) {
                const data = await response.json();
                console.log("data", data); // Log the server's response
                //console.log('Hiding the Modal ....');
                $('#fileNameModal').modal('hide');
                uploaddocModal.hide();
                common.showMessage('File Uploaded / Vectorized', 2000);
                await fikrdraw.saveUpload(file.name, fikruser.getUserId());


            } else {
                uploaddocModal.hide();
                console.error("Error uploading the file:", response.statusText);
                common.showMessage(`Error uploading the file: ${response.statusText}`, 2000);

            }
        } catch (error) {
            console.error("Error uploading the file:", error);
        }

        // Add here the logic to send formData to your server...
    } else {
        console.log("File type not supported.");
    }
}

function resizeDrawingContainer() {
    const windowHeight = window.innerHeight;
    const chatContainerHeight = document.getElementById('chatContainer').offsetHeight;

    const drawingContainer = document.getElementById('drawingContainer'); // Get the drawingContainer element
    drawingContainer.style.height = `${windowHeight - chatContainerHeight - 150}px`;


    const svg = document.getElementById('mindMapContainer');
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
}

window.addEventListener('resize', resizeDrawingContainer);
resizeDrawingContainer();

//Purpose: Calculate the y-coordinate of the bottom edge of a node.
function getBottomEdgeY(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const shape = node ? node.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]') : null;

    if (shape) {
        if (shape.getAttribute('data-tag') === 'ellipse') {
            const cy = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]);
            const ry = parseFloat(shape.getAttribute('ry'));
            return cy + ry; // Return the bottom edge y-coordinate of the ellipse
        } else if (shape.getAttribute('data-tag') === 'rect') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + shape.getAttribute('height'); // Return the bottom edge y-coordinate of the rectangle
        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + shape.getAttribute('height'); // Return the bottom edge y-coordinate of the parallelogram
        } else if (shape.getAttribute('data-tag') === 'diamond') {
            //console.log("bottom diamond shape = ", shape);
            const height = parseFloat(shape.getAttribute('height'));
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + height / 2; // Return the bottom edge y-coordinate of the diamond
        } else {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]); // Return the top edge y-coordinate of the rectangle
        }
    }
    return 0;
}

//Purpose: Calculate the y-coordinate of the top edge of a node.
function getTopEdgeY(selection, nodeId) {
    const node = selection.filter((d) => d.id === nodeId).node();
    const shape = node ? node.querySelector('[data-tag="rect"], [data-tag="ellipse"], [data-tag="parallelogram"],[data-tag="diamond"]') : null;

    if (shape) {
        if (shape.getAttribute('data-tag') === 'ellipse') {
            console.log("calculating cy");
            const cy = parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1].split(')')[0]);
            const ry = parseFloat(shape.getAttribute('ry'));
            console.log("getTopEdgeY cy", cy);
            console.log("getTopEdgeY ry", ry);

            return cy - ry; // Return the top edge y-coordinate of the ellipse
        } else if (shape.getAttribute('data-tag') === 'rect') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]); // Return the top edge y-coordinate of the rectangle
        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]); // Return the top edge y-coordinate of the parallelogram
        } else if (shape.getAttribute('data-tag') === 'diamond') {
            //console.log("top diamond shape = ", shape);
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) - shape.getAttribute('height') / 2; // Return the top edge y-coordinate of the diamond
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

//getCenterX: The center x-coordinate of the node.
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
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + common.nodesize.height.rectangle / 2;
        } else if (shape.getAttribute('data-tag') === 'parallelogram') {
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + common.nodesize.height.parallelogram / 2;
        } else if (shape.getAttribute('data-tag') === 'diamond') {
            //console.log("centerY diamond shape = ", shape);
            return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]) + common.nodesize.height.diamond / 2;
            //return parseFloat(node.getAttribute('transform').split('(')[1].split(',')[1]); // Center Y-coordinate of the diamond
        }
    }
    return 0;
}

function generateMindmap(mindmapData) {
    fetch(`${baseUrlfikrmapserver}/generate-mindmap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mindmapData),
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            createAndDisplayIframe(); // Call inside the .then block
        })
        .catch(error => console.error('Error:', error));
}



function createAndDisplayIframe() {

    // Get the iframe container
    var iframeContainer = document.getElementById('iframeTabContent');

    // Clear existing content in the iframe container
    iframeContainer.innerHTML = '';

    // Create the iframe
    var iframe = document.createElement('iframe');

    iframe.src = `${baseUrlfikrmapserver}`;
    iframe.width = "100%"; // Set width to 100%
    iframe.height = "600";
    iframe.style.border = "none";

    // Append the iframe to the iframeTabContent
    var iframeContainer = document.getElementById('iframeTabContent');
    iframeContainer.appendChild(iframe);
}


function renderMindMap(mindMapData) {
    console.log("Rendering the min Map =", mindMapData);

    const mapType = common.determineMapType(mindMapData);

    if (mapType === "hierarchy") {

        console.log("Rendering the min Map as Hierarchy");


        // Assuming mindMapDataJson is defined as provided
        // let hierarchicalData = common.transformDataToHierarchy(mindMapData);
        // console.log("hierarchicalData =", hierarchicalData);
        //renderHierarchyMindMap(hierarchicalData); // Fadi to check later

        renderNetworkMindMap(mindMapData);


        console.log("Original hierarchicalData =", mindMapData);
        let hierarchyData = common.transformToMindMapHierarchy(mindMapData);
        console.log("Target hierarchicalData =", hierarchyData);
        generateMindmap(hierarchyData);

    } else {

        console.log("Rendering the min Map as Network");

        renderNetworkMindMap(mindMapData);
    }
}

function renderNetworkMindMap(mindMapData) {
    console.log("LLL renderNetworkMindMap mindMapData", mindMapData);

    // Variables to Fine-Tune
    const centerStrength = 0.08; // Strength of center pulling force
    const minCenterDistance = 300; // Minimum distance from center for repulsion
    const maxCenterDistance = 450; // Maximum distance from center for attraction
    const chargeStrength = -200; // Strength of node repulsion
    const linkDistance = 100; // Distance between nodes connected by a link
    const linkStrength = 0.5; // Strength of the links
    const alphaTarget = 0.3; // Alpha target for simulation during dragging
    const nodeRadius = 5; // Radius of the nodes

    const mindMapContainer = document.getElementById('mindMapContainer');
    mindMapContainer.innerHTML = '';

    try {

        const width = mindMapContainer.clientWidth;
        const height = mindMapContainer.clientHeight;
        console.log('Width:', width, 'Height:', height);

        // Create the SVG element
        svg = d3.select('#mindMapContainer')
            .append('svg')
            .attr('width', width)
            .attr('height', height);


        // Create a group element to contain nodes and relationships
        graphGroup = svg.append('g')
            .attr('id', 'graphGroup')
            .attr('transform', `translate(${currentTransform.x},${currentTransform.y}) scale(${currentTransform.k})`); // Apply the current transform here
        ;


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


        svg.on("wheel", function(event) {
            // Prevent the default behavior of the wheel event
            console.log("on wheel 1");
            event.preventDefault();

            // Check if the shift key is held down
            if (event.shiftKey) {
                console.log("on wheel 1");

                // Get the current mouse coordinates
                const [vx, vy] = d3.pointer(event);

                // Calculate the zoom scale based on the deltaY property of the event
                const zoomScale = event.deltaY > 0 ? 1.1 : 0.9;

                // Get the current zoom transform
                currentTransform = d3.zoomTransform(this);
                console.log("Wheel1 currentTransform =", currentTransform);

                // Create a new zoom transform by scaling around the current mouse coordinates
                const newTransform = currentTransform.scale(zoomScale).translate(
                    (vx - currentTransform.x) * (1 - zoomScale),
                    (vy - currentTransform.y) * (1 - zoomScale)
                );

                // Apply the new zoom transform to the graphGroup
                graphGroup.attr("transform", newTransform);

                x = (vx - currentTransform.x) * (1 - zoomScale);
                y = (vy - currentTransform.y) * (1 - zoomScale);
            }
        });

        // Add a red circle at the center
        svg.append("circle")
            .attr("cx", mindMapContainer.clientWidth / 2)
            .attr("cy", mindMapContainer.clientHeight / 2)
            .attr("r", 5) // Adjust the radius as needed
            .style("fill", "red");


        // Custom center force
        function centerForce() {
            return function force(alpha) {
                mindMapData.nodes.forEach(node => {
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const dx = node.x - centerX;
                    const dy = node.y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > maxCenterDistance) {
                        node.vx -= dx * centerStrength * alpha;
                        node.vy -= dy * centerStrength * alpha;
                    } else if (distance < minCenterDistance) {
                        node.vx += dx * centerStrength * alpha;
                        node.vy += dy * centerStrength * alpha;
                    }
                });
            };
        }

        // Create force simulation
        const simulation = d3.forceSimulation(mindMapData.nodes)
            .force('link', d3.forceLink(mindMapData.links)
                .id(d => d.id)
                .distance(linkDistance)
                .strength(linkStrength))
            // .force("charge", d3.forceManyBody().strength(chargeStrength))
            // .force('center', centerForce())
            // .force("collide", d3.forceCollide().radius(function(d) {
            //     return d.radius + 2; // d.radius should be your node's radius; add a small value to create padding
            // }))
            .on("tick", ticked);


        //centerStrength, minCenterDistance, maxCenterDistance, relationStrength, maxRelationDistance
        //minCenterDistance: Nodes closer to the center than this distance will experience a force pushing them away from the center.
        //maxCenterDistance: Nodes farther from the center than this distance will experience a force pulling them toward the center.
        //relationStrength: It represents the strength of the force between nodes that are connected by a relationship. A higher value would mean a stronger attraction or repulsion between connected nodes.
        //maxRelationDistance: It represents the maximum distance at which the force between connected nodes is applied. Nodes connected by a relationship that is shorter than this distance will experience an attraction force, while nodes connected by a relationship longer than this distance will experience a repulsion force.

        //.force('center', d3.forceCenter(mindMapContainer.clientWidth / 2, mindMapContainer.clientHeight / 2));


        function ticked() {
            // Update the position attributes of nodes and links
            nodes.attr("cx", d => d.x)
                .attr("cy", d => d.y);

            links.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }

        nodes = graphGroup
            .selectAll('.node')
            .data(mindMapData.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`) // Handle undefined coordinates
            .attr('id', (d) => `${d.id}`)
            .call(dragHandler);



        const scaleX = 4; // Scale factor for horizontal scaling
        const scaleY = 0; // Scale factor for vertical scaling

        rectNodes = nodes
            //.append('rect')
            .append((d) => {
                // If shape is 'ellipse', create an ellipse element; if 'parallelogram', create a parallelogram element; otherwise, create a rect element
                if (d.shape === 'ellipse') {
                    return document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                }
                if (d.shape === 'parallelogram') {
                    return common.createParallelogramElement(d);
                } else if (d.shape === 'diamond') {
                    return common.createDiamondElement(d);
                } else {

                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

                    const numLines = common.countLines(d) + 1;
                    // console.log("---------------------- XX S");
                    // console.log("d.label=", d.label);
                    // console.log("Number of Lines = ", numLines);
                    // console.log("---------------------- XX E");

                    const rectangle = common.calculateNodeHeight(d.shape, numLines);

                    rect.setAttribute('height', rectangle);

                    return rect;

                }
            })
            .attr('transform', (d) => { // position of shape
                if (d.shape === 'parallelogram') {
                    //return `translate(${-parallelogram/2 - 10 }, ${-common.nodesize.height.parallelogram*3})`;
                    return null;
                } else {
                    return null;
                }
            })
            .attr('width', (d) => {
                if (d.shape === 'ellipse') {
                    return common.nodesize.width.ellipse * 2;
                } else if (d.shape === 'parallelogram') {
                    //console.log("setting the width to rectangle....")
                    return common.nodesize.width.parallelogram; // Set the width of the parallelogram shape
                } else if (d.shape === 'diamond') {
                    //console.log("setting the width to rectangle....")
                    return common.nodesize.width.diamond; // Set the width of the diamond shape
                } else {
                    return common.nodesize.width.rectangle;
                }
            })
            .attr('height', (d) => { // for rect
                const numLines = common.countLines(d); // Assume d.label contains the text
                //console.log("d.label=", d.label);
                //console.log("Number of Lines = ", numLines);
                // adjust node height
                return common.calculateNodeHeight(d.shape, numLines);
            })
            .attr('rx', (d) => {
                if (d.shape === 'ellipse') {
                    return common.nodesize.width.ellipse;
                } else if (d.shape === 'parallelogram') {
                    return 0; // No rounded corners for parallelogram shape
                } else if (d.shape === 'diamond') {
                    return 0; // No rounded corners for diamond shape
                } else {
                    return cornerRadius;
                }
            })
            .attr('ry', (d) => {
                if (d.shape === 'ellipse') { // for elipse
                    const numLines = common.countLines(d);
                    // console.log("Number of Lines = ", numLines);
                    const totalHeight = common.calculateNodeHeight(d.shape, numLines);
                    return totalHeight / 2; // divide by 2 since ry is a radius, not a diameter
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
                    return -common.nodesize.width.ellipse + 15;
                } else if (d.shape === 'parallelogram') {
                    return 10
                } else if (d.shape === 'diamond') {
                    return common.nodesize.width.diamond / 4 - 40
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
                    return common.nodesize.height.diamond / 2 - 15;
                } else {
                    return 10;
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
            .attr('style', 'transform: scale(1.5)')
            .property('checked', (d) => d.completed)
            .on('mousedown', () => {
                allowDrag = false; // Disable dragging
            })
            .on('mouseup', () => {
                allowDrag = true; // Re-enable dragging
            })
            .on('mouseout', () => {
                allowDrag = true; // Re-enable dragging
            })
            .on('change', (event, d) => {
                toggleCompletion(mindMapData, d.id);
            });

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
                    return 75;

                } else
                    return 30;
            })
            .attr('y', (d) => {
                if (d.shape === 'ellipse') {
                    return -10; // For ellipse and parallelogram, keep the y-coordinate at the center
                } else if (d.shape === 'parallelogram') {
                    return common.nodesize.height.parallelogram / 2 - 8; // For rectangle, adjust the y-coordinate to be vertically centered within the rectangle

                } else if (d.shape === 'diamond') {
                    return common.nodesize.height.diamond / 2; // For rectangle, adjust the y-coordinate to be vertically centered within the rectangle

                } else {
                    return common.nodesize.height.rectangle / 2 - 8; // For rectangle, adjust the y-coordinate to be vertically centered within the rectangle
                }
            })
            //.text((d) => d.label.substring(0, textlength))
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
            }) // label text node text
            .each(function(d) {
                const textElement = d3.select(this);
                let label = common.handleShapeText(d);
                // console.log("LABEL = ", label);
                const lines = label.split('\n'); // Split the label into lines
                for (let i = 0; i < lines.length; i++) {
                    textElement.append('tspan') // Append a tspan for each line
                        .attr('x', textElement.attr('x')) // Set the x position the same as the text element
                        .attr('dy', i === 0 ? 0 : '1.2em') // Adjust the y position based on the line number
                        .text(lines[i]);
                }
            });
        // node id position circle + id text
        nodes
            .append('circle')
            .attr('cx', (d) => {
                if (d.shape === 'ellipse') {
                    // For ellipses, move the circle to the left side
                    return -common.nodesize.width.ellipse + 10; // Adjust the value as needed
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
                    return -common.nodesize.height.ellipse + 10; // Adjust the value as needed
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
                    return -common.nodesize.width.ellipse + 10; // Adjust the value as needed
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
                    return -common.nodesize.height.ellipse + 13; // Adjust the value as needed
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
                    return `translate(${common.nodesize.width.ellipse / 2 + 25}, ${-common.nodesize.height.ellipse / 2 + 5})`; // Top right corner of ellipse
                } else if (d.shape === 'parallelogram') {
                    return `translate(${common.nodesize.width.parallelogram -45}, ${-common.nodesize.height.parallelogram / 2+35})`; // Top right corner of parallelogram
                } else if (d.shape === 'diamond') {
                    return `translate(${common.nodesize.width.diamond / 2 - 10}, ${-common.nodesize.height.diamond / 2+30})`; // Top right corner of diamond
                } else {
                    return `translate(${common.nodesize.width.rectangle -30}, ${-common.nodesize.height.rectangle / 2 + 35})`; // Top right corner of rectangle
                }
            });
        // Append a foreignObject element within the nodeIcons group for the icon
        nodeIcons
            .append('foreignObject')
            .attr('width', common.nodesize.icon.iconSize) // Set the width of the foreignObject for the icon
            .attr('height', common.nodesize.icon.iconSize) // Set the height of the foreignObject for the icon
            .html((d) => {
                switch (d.icon) {
                    case 'smily':
                        return `<i class="bi bi-emoji-smile" style="font-size: ${common.nodesize.icon.iconSize}px;"></i>`;
                    case 'heart':
                        return `<i class="bi bi-heart" style="font-size: ${common.nodesize.icon.iconSize}px;"></i>`;
                    case 'star':
                        return `<i class="bi bi-star" style="font-size: ${common.nodesize.icon.iconSize}px;"></i>`;
                }
            });

        // Create a circle background for the icon
        nodeIcons
            .append('circle')
            .attr('cx', common.nodesize.icon.iconSize / 2) // Adjust the center X-coordinate based on icon size
            .attr('cy', common.nodesize.icon.iconSize / 2) // Adjust the center Y-coordinate based on icon size
            .attr('r', common.nodesize.icon.iconSize / 2) // Set the radius based on icon size
            .attr('fill', 'transparent') // Set the fill to transparent
            .attr('stroke', 'transparent'); // Set the stroke to transparent
        //d:     It represents the relationship object for which the curved path is being calculated. The relationship object contains information about the source node and the target node of the relationship.
        //nodes: It represents the selection of node elements in the SVG. It is used to access the node elements and retrieve their positions.
        //nodePositions: It represents a map that stores the calculated positions (x, y coordinates) of each node in the mind map. The map is used to retrieve the positions of the source and target nodes for calculating the curved path.


        ApplyFilterOnNodes();


        renderBoxToolBox();

        //console.log("To Render Relationships ....");
        // After creating the nodes and starting the simulation, update the relationships
        console.log("LLLLLLLLL Render Relations .......");
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
            console.log("A- OVERRRRRR NODES");
            //event.stopPropagation(); // Stop the mousedown event from propagating
            //d3.select(this).attr("class", "solid-relationship hover");
            ToggleButtons(event, d);
        })

        nodes.on("mouseout", function(event, d) {
            console.log("out");
            //RemoveToggleButtons();
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
            event.stopPropagation();
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
                .on('end', dragEnd);

            selection.call(drag);

            function dragStart(event, d) {
                // if (!allowDrag) return;

                if (!event.active) simulation.alphaTarget(alphaTarget).restart();
                d.fx = d.x;
                d.fy = d.y;

            }

            function dragMove(event, d) {

                // if (!allowDrag) return;

                d.fx = event.x;
                d.fy = event.y;

                // renderMindMap(mindMapData);
                // ToggleButtons(event, d);
            }

            function dragEnd(event, d) {

                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;



                if (!allowDrag) return;

                // Restart the simulation with a higher alpha target for quick stabilization
                //simulation.alphaTarget(0.3).restart();

                // takeSnapshot(mindMapData);
            }

            simulation.on("tick", () => {

                // Set the position attributes of links and nodes each time the simulation ticks.
                // Modify the tick function to adjust the positions of dragged nodes
                nodes.attr('transform', (d) => `translate(${d.fx || d.x},${d.fy || d.y})`);
                renderRelationships();

                // Keep the current zoom
                graphGroup.attr('transform', `translate(${currentTransform.x},${currentTransform.y}) scale(${currentTransform.k})`);

                if (simulation.alpha() < 0.005) {
                    simulation.stop();
                    console.log('Simulation stabilized');
                }


                //     // rectNodes
                //     //     .attr("x", d => d.x)
                //     //     .attr("y", d => d.y);

                //     // label
                //     //     .attr("x", d => d.x)
                //     //     .attr("y", d => d.y);



            });

            return drag;
        }


        function updateSolidRelationships() {
            //console.log("In updateSolidRelationships Render the Solid Relationship ...", svg);

            solidRelationships = graphGroup
                .selectAll('.solid-relationship')
                .data(mindMapData.relationships.filter((relation) => relation.type === 'solid'));


            // x2 and y2 represent the ending point of the line, where the arrowhead will be drawn.

            // Define the threshold for alignment sensitivity
            const alignmentThreshold = 10; // Threshold for alignment sensitivity

            solidRelationships.enter()
                .append('line')
                .attr("id", (d) => (d.source + '-' + d.target))
                .attr('class', 'relationship solid-relationship')
                .attr('stroke', (d) => d.stroke)
                .attr('marker-end', 'url(#arrowhead)')
                .merge(solidRelationships)
                .attr('x1', (d) => {
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();
                    const targetNode = nodes.filter((node) => node.id === d.target).node();

                    if (sourceNode && targetNode) {
                        // Calculate center and edge positions
                        const sourceCenterX = getCenterX(nodes, d.source);
                        const targetCenterX = getCenterX(nodes, d.target);
                        const sourceCenterY = getCenterY(nodes, d.source);
                        const targetCenterY = getCenterY(nodes, d.target);
                        const sourceBottomEdgeY = getBottomEdgeY(nodes, d.source);
                        const targetTopEdgeY = getTopEdgeY(nodes, d.target);

                        // Calculate differences
                        const diffX = Math.abs(sourceCenterX - targetCenterX);
                        const diffY = sourceBottomEdgeY - targetTopEdgeY;

                        console.log(`[x1] Source: (${sourceCenterX}, ${sourceCenterY}), Target: (${targetCenterX}, ${targetCenterY}), diffX: ${diffX}, diffY: ${diffY}`);

                        // Check if source is directly above the target
                        if (diffX < alignmentThreshold && diffY < alignmentThreshold) {
                            console.log("[x1] Source directly above target, connecting centers vertically");
                            return sourceCenterX;
                        } else {
                            const sourceRightEdgeX = getRightEdgeX(nodes, d.source);
                            const sourceLeftEdgeX = getLeftEdgeX(nodes, d.source);
                            return sourceCenterX < targetCenterX ? sourceRightEdgeX : sourceLeftEdgeX;
                        }
                    }
                    return 0;
                })
                .attr('y1', (d) => {
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();
                    const targetNode = nodes.filter((node) => node.id === d.target).node();

                    if (sourceNode && targetNode) {
                        const sourceBottomEdgeY = getBottomEdgeY(nodes, d.source);
                        const sourceCenterY = getCenterY(nodes, d.source);
                        const targetTopEdgeY = getTopEdgeY(nodes, d.target);
                        const targetCenterY = getCenterY(nodes, d.target);

                        const diffY = Math.abs(sourceCenterY - targetCenterY);
                        const diffX = Math.abs(getCenterX(nodes, d.source) - getCenterX(nodes, d.target));

                        console.log(`[y1] Source Bottom: ${sourceBottomEdgeY}, Target Top: ${targetTopEdgeY}, diffY: ${diffY}, diffX: ${diffX}`);

                        if (diffY < alignmentThreshold && diffX > diffY) {
                            console.log("[y1] Horizontally aligned, connecting centers horizontally");
                            return sourceCenterY;
                        } else {
                            return sourceCenterY < targetCenterY ? sourceBottomEdgeY : getTopEdgeY(nodes, d.source);
                        }
                    }
                    return 0;
                })
                .attr('x2', (d) => {
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();
                    const targetNode = nodes.filter((node) => node.id === d.target).node();

                    if (sourceNode && targetNode) {
                        const sourceCenterX = getCenterX(nodes, d.source);
                        const targetCenterX = getCenterX(nodes, d.target);
                        const sourceBottomEdgeY = getBottomEdgeY(nodes, d.source);
                        const targetTopEdgeY = getTopEdgeY(nodes, d.target);

                        const diffX = Math.abs(sourceCenterX - targetCenterX);
                        const diffY = sourceBottomEdgeY - targetTopEdgeY;

                        console.log(`[x2] Source: (${sourceCenterX}, ${sourceBottomEdgeY}), Target: (${targetCenterX}, ${targetTopEdgeY}), diffX: ${diffX}, diffY: ${diffY}`);

                        if (diffX < alignmentThreshold && diffY < alignmentThreshold) {
                            console.log("[x2] Source directly above target, connecting centers vertically");
                            return targetCenterX;
                        } else {
                            const targetLeftEdgeX = getLeftEdgeX(nodes, d.target);
                            const targetRightEdgeX = getRightEdgeX(nodes, d.target);
                            return sourceCenterX < targetCenterX ? targetLeftEdgeX : targetRightEdgeX;
                        }
                    }
                    return 0;
                })
                .attr('y2', (d) => {
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();
                    const targetNode = nodes.filter((node) => node.id === d.target).node();

                    if (sourceNode && targetNode) {
                        const targetTopEdgeY = getTopEdgeY(nodes, d.target);
                        const targetCenterY = getCenterY(nodes, d.target);
                        const sourceBottomEdgeY = getBottomEdgeY(nodes, d.source);
                        const sourceCenterY = getCenterY(nodes, d.source);

                        const diffY = Math.abs(sourceCenterY - targetCenterY);
                        const diffX = Math.abs(getCenterX(nodes, d.source) - getCenterX(nodes, d.target));

                        console.log(`[y2] Source Bottom: ${sourceBottomEdgeY}, Target Top: ${targetTopEdgeY}, diffY: ${diffY}, diffX: ${diffX}`);

                        if (diffY < alignmentThreshold && diffX > diffY) {
                            console.log("[y2] Horizontally aligned, connecting centers horizontally");
                            return targetCenterY;
                        } else {
                            return sourceCenterY < targetCenterY ? targetTopEdgeY : getBottomEdgeY(nodes, d.target);
                        }
                    }
                    return 0;
                });

            // Continue with the rest of the attribute calculations...




            solidRelationships.attr("stroke-width", (d) => d.strokewidth)
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("class", "solid-relationship hover");
                    ToggleButtons(event, d);
                })
                .on("mouseout", function() {
                    d3.select(this).attr("class", "solid-relationship");
                })
                .on("click", function() {
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



            // Draw label
            label = svg.selectAll('.relation-label')
                .data(mindMapData.relationships.filter((relation) => relation.type === 'solid'));

            //console.log("XXXXX currentTransform.x =", currentTransform.x)
            //console.log("XXXXX currentTransform.y =", currentTransform.y)

            label.enter()
                .append('g') // Create a group element
                .append('foreignObject')
                .attr('class', 'relation-label')
                .merge(label)
                .attr('id', (d) => `label-${d.source}-${d.target}`) // Set the id attribute
                .attr('width', 150) // Increased width to 150
                .attr('height', 20)
                .attr('color', (d) => {
                    //console.log("dddddddddd=", d);
                    return d.relation_label.color;
                })
                .attr('transform', `translate(${currentTransform.x},${currentTransform.y}) scale(${currentTransform.k})`) // Apply the current transform here
                .attr('x', (d) => {
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();
                    const targetNode = nodes.filter((node) => node.id === d.target).node();

                    if (sourceNode && targetNode) {
                        const sourceTransform = sourceNode.getAttribute('transform');
                        const targetTransform = targetNode.getAttribute('transform');

                        const sourceX = parseFloat(sourceTransform.split('(')[1].split(',')[0]);
                        const targetX = parseFloat(targetTransform.split('(')[1].split(',')[0]);

                        const x = (sourceX + targetX) / 2;
                        return x;
                    } else {
                        console.error(`Error: sourceNode or targetNode not found for label "${d.label}"`);
                        return 0;
                    }
                })
                .attr('y', (d) => {
                    const sourceNode = nodes.filter((node) => node.id === d.source).node();
                    const targetNode = nodes.filter((node) => node.id === d.target).node();

                    if (sourceNode && targetNode) {
                        const sourceTransform = sourceNode.getAttribute('transform');
                        const targetTransform = targetNode.getAttribute('transform');

                        const sourceY = parseFloat(sourceTransform.split('(')[1].split(',')[1].split(')')[0]);
                        const targetY = parseFloat(targetTransform.split('(')[1].split(',')[1].split(')')[0]);

                        const y = (sourceY + targetY) / 2;
                        return y;
                    } else {
                        console.error(`Error: sourceNode or targetNode not found for label "${d.label}"`);
                        return 0;
                    }
                })
                .attr('dy', 20) // Adjust the vertical position (upward) of the label (shift relatively to y)
                .html(d => `<div contenteditable="true">${d.relation_label.label}</div>`)
                .on('click', function(event, d) {
                    const textElement = d3.select(this);
                    const divElement = textElement.select('div');
                    divElement.node().focus();

                    divElement.on('blur', function() {
                        d.label = this.innerText;
                        console.log('Blur Event:', d.label);


                        // Update the stroke-width in the mind map data
                        const relationship = mindMapData.relationships.find((relation) => {
                            const slineId = `${relation.source}-${relation.target}`;
                            return slineId === d.id;
                        });
                        relationship.relation_label.label = d.label;


                    });

                    divElement.on('keydown', function(event) {
                        const value = this.innerText;
                        console.log('Input Event:', value);


                        if (event.key !== 'Backspace' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Delete') {
                            if (value.length >= 15) {
                                common.showMessage(`Exceeded maximum Label Length 15`, 2000);
                                event.preventDefault();
                                event.stopPropagation();

                            }
                        }
                    });

                })
                .on('contextmenu', function(event, d) {
                    event.preventDefault();
                    handleColorPalette('label', `label-${d.source}-${d.target}`);


                })
                .style('cursor', 'pointer') // Add this line to change cursor on hover
                .on('mouseover', function() {
                    d3.select(this).style('text-decoration', 'underline');
                })
                .on('mouseout', function() {
                    d3.select(this).style('text-decoration', 'none');
                });

            label.exit().remove();




        }




        function updateCurvedRelationships() {
            curvedRelationships = graphGroup
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
                    //RemoveToggleButtons();
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
                { icon: "bi bi-trash", text: "Delete" }
                // { icon: "bi bi-textarea-t", text: "Label" }
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
            BoxToolBox = svg
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

            const nodeelement = d3.select(`#${d.id}`);
            // Get the bounding box of the node element
            const nodeBBox = nodeelement.node().getBBox();

            // Extract the height from the bounding box
            const nodeHeight = nodeBBox.height;

            RemoveToggleButtons();
            hideAttributeContainer();

            //console.log("Toggle -- 1");

            // Create a group for the circle and text
            dotGroup = svg
                .append("g")
                .attr("class", "three-dots-group pointer-cursor")
                .attr("visibility", "visible")
                .on('mouseover', () => dotGroup.attr("cursor", "pointer"))
                .on('mouseout', () => dotGroup.attr("cursor", "default"))
                .on('click', (event, d) => click3dotbutton(event, d));


            // Get the id of the box or line and use it as the id for the circle
            const circleId = d.id || (d.source && d.target ? `${d.source}-${d.target}` : null);
            //console.log("Toggle -- 2");

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
            //console.log("Toggle -- 3");

            // Append the "..." text to the circle's parent group
            // Append a foreignObject to the circle to embed HTML content
            // Append the text inside the circle
            dotsText = dotGroup
                .append("text")
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text("...");

            //console.log("Toggle -- 4");


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
            //console.log("Toggle -- 5");


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

            //console.log("Toggle -- 6");

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
            // console.log("Toggle -- 7");


            // Assume `zoomG` is the group element to which the zoom behavior is applied
            const zoomTransform = d3.zoomTransform(d3.select('#graphGroup').node());

            // console.log("Toggle -- 8");
            //  console.log("Toggle -- d=", d);
            //  console.log("d.description =", d.description);


            // setting the coordinates for the toggled icons
            // 3dot position
            if (d.description) // Rectangle / Box (description is not common attribute between the box and line)
            { // dot and plus shape position
                //    console.log("Toggle -- Label 9 - 1");
                //    console.log("Toggle --d.label=", d.label);
                //   console.log("Toggle --d.shape=", d.shape);

                if (d.shape === 'ellipse') {
                    const bbox = dotGroup.node().getBBox();
                    //dotcalcX = d.x;
                    //dotcalcY = d.y - bbox.height / 2 + 35; // Adjust the value as needed for the vertical position above the ellipse

                    dotcalcX = currentTransform.k * d.x + currentTransform.x;
                    dotcalcY = currentTransform.k * (d.y - bbox.height / 2 + 40) + currentTransform.y;

                    pluscalcX = currentTransform.k * d.x + currentTransform.x;
                    pluscalcY = currentTransform.k * (d.y + nodeHeight) + currentTransform.y - 40;
                    plusCircle.attr("cx", pluscalcX).attr("cy", pluscalcY).attr("visibility", "visible");
                    plusText.attr("x", pluscalcX).attr("y", pluscalcY - 2).attr("visibility", "visible");
                    pencalcX = currentTransform.k * (d.x + 80) + currentTransform.x;
                    pencalcY = currentTransform.k * (d.y - bbox.height / 2 + 50) + currentTransform.y;

                } else if (d.shape === 'parallelogram') {

                    dotcalcX = currentTransform.k * (d.x + common.nodesize.width.parallelogram / 2) + currentTransform.x;
                    dotcalcY = currentTransform.k * (d.y - common.nodesize.height.ellipse + 25) + currentTransform.y;
                    // console.log("...........currentTransform.k=", currentTransform.k);
                    // console.log("common.nodesize.height.ellipse=", common.nodesize.height.ellipse);
                    // console.log("currentTransform.y=", currentTransform.y);
                    // console.log("dotcalcY=", dotcalcY);
                    pluscalcX = currentTransform.k * (d.x + common.nodesize.width.parallelogram / 2) + currentTransform.x;
                    pluscalcY = currentTransform.k * (d.y + nodeHeight) + currentTransform.y;
                    plusCircle.attr("cx", pluscalcX).attr("cy", pluscalcY).attr("visibility", "visible");
                    plusText.attr("x", pluscalcX).attr("y", pluscalcY - 2).attr("visibility", "visible");
                    pencalcX = currentTransform.k * (d.x + common.nodesize.width.parallelogram - 25) + currentTransform.x;
                    pencalcY = currentTransform.k * (d.y - common.nodesize.height.parallelogram / 2 + 15) + currentTransform.y;


                } else if (d.shape === 'diamond') {

                    dotcalcX = currentTransform.k * (d.x + common.nodesize.width.diamond / 2) + currentTransform.x;
                    dotcalcY = currentTransform.k * (d.y - common.nodesize.height.ellipse + 25) + currentTransform.y;
                    pluscalcX = currentTransform.k * (d.x + common.nodesize.width.diamond / 2) + currentTransform.x;
                    pluscalcY = currentTransform.k * (d.y + nodeHeight) + currentTransform.y;
                    plusCircle.attr("cx", pluscalcX).attr("cy", pluscalcY).attr("visibility", "visible");
                    plusText.attr("x", pluscalcX).attr("y", pluscalcY - 2).attr("visibility", "visible");
                    pencalcX = currentTransform.k * (d.x + common.nodesize.width.diamond / 2 + 55) + currentTransform.x;
                    pencalcY = currentTransform.k * (d.y - common.nodesize.height.ellipse / 2 + 30) + currentTransform.y;

                } else {

                    dotcalcX = currentTransform.k * (d.x + common.nodesize.width.rectangle / 2) + currentTransform.x;
                    dotcalcY = currentTransform.k * (d.y - common.nodesize.height.ellipse + 25) + currentTransform.y;
                    pencalcX = currentTransform.k * (d.x + common.nodesize.width.rectangle - 15) + currentTransform.x;
                    pencalcY = currentTransform.k * (d.y - common.nodesize.height.ellipse + 25) + currentTransform.y;

                    pluscalcX = currentTransform.k * (d.x + common.nodesize.width.rectangle / 2) + currentTransform.x;
                    // Update pluscalcY calculation to reflect the node height
                    pluscalcY = currentTransform.k * (d.y + nodeHeight) + currentTransform.y;
                    //pluscalcY = currentTransform.k * (d.y + common.nodesize.height.rectangle) + currentTransform.y;
                    plusCircle.attr("cx", pluscalcX).attr("cy", pluscalcY).attr("visibility", "visible");
                    plusText.attr("x", pluscalcX).attr("y", pluscalcY - 2).attr("visibility", "visible");

                }



            }
            // line
            if (d.source && d.target && mindMapData.nodes.length > 1) {

                //console.log("Toggle -- Line 9 - 1");

                // Find the source and target node objects
                const sourceNode = mindMapData.nodes.find((node) => node.id === d.source);
                const targetNode = mindMapData.nodes.find((node) => node.id === d.target);

                // Log node dimensions for debugging
                // console.log('sourceNode:', sourceNode);
                // console.log('targetNode:', targetNode);

                const srcnumLines = common.countLines(sourceNode);
                //console.log("Number of Lines For Source = ", srcnumLines);
                const sourceHeight = common.calculateNodeHeight(sourceNode.shape, srcnumLines);
                const sourceWidth = common.calculateNodeWidth(sourceNode.shape);

                const trgnumLines = common.countLines(targetNode);
                //console.log("Number of Lines For Target = ", trgnumLines);
                const targetHeight = common.calculateNodeHeight(targetNode.shape, trgnumLines);
                const targetWidth = common.calculateNodeWidth(targetNode.shape);

                // Calculate the middle point between the source and target nodes
                const sourceX = sourceNode.x + sourceWidth / 2;
                const sourceY = sourceNode.y + sourceHeight / 2;
                const targetX = targetNode.x + targetWidth / 2;
                const targetY = targetNode.y + targetHeight / 2;

                console.log(`Calculating middle point - Source (${sourceNode.id}): (${sourceX}, ${sourceY}), Target (${targetNode.id}): (${targetX}, ${targetY})`);

                // Set dotcalcX and dotcalcY directly to the middle point
                dotcalcX = (sourceX + targetX) / 2;
                dotcalcY = (sourceY + targetY) / 2;
                console.log("Toggle -- 9 - 2");



            }
            //else {
            // console.error('Source or target node is undefined or nodes array is empty.');
            // console.log("d.source =", d.source);
            // console.log("d.target =", d.target);

            //}

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
            console.log("Takesnapshot trigerred by deleteNodeAndRelatedNodes ...");

            // After rendering, capture a snapshot
            takeSnapshot(mindMapData);
        }



        function handleBoxIconboxNodesClick(event, d) {
            console.log(`----- handleBoxIconboxNodesClick Clicked ${d.text}`);
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
            console.log(`----- handleBoxShapeboxNodesClick Clicked ${d.text}`);
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
            console.log(`----- handleBoxToolboxNodesClickClicked ${d.text}`);
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
            console.log(`----- handleRelationshipToolboxNodesClick Clicked ${d.text}`);
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

        // Function to toggle the relationship tool box triggered on 3 dots from line
        function toggleBoxToolBox(box) {
            // Access the currentTransform assuming it's globally available
            // Or get it from your transformManager or another source if necessary

            const display = BoxToolBoxRef.style("display");

            if (display === "none") {
                // Get the bounding box of dotGroup
                const bbox = dotGroup.node().getBBox();

                // Adjust these values to position BoxToolBoxRef where you want it relative to dotGroup
                const offsetFromDotGroupX = -70; // Horizontal offset from dotGroup
                const offsetFromDotGroupY = -70; // Vertical offset from dotGroup

                // Calculate the new position for BoxToolBoxRef
                const calcX = bbox.x + bbox.width + offsetFromDotGroupX;
                const calcY = bbox.y + offsetFromDotGroupY;

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
                var calcX = box.x + (common.nodesize.width.rectangle) / 2 - 70;
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
            console.log('display=' + display);

            if (display === "none") {

                //console.log("Display of Icon is None, we are setting x and y to display ...");
                //calcX = d.x + (d.label.length * 10 + 20) / 2;
                var calcX = box.x + (common.nodesize.width.rectangle) / 2 - 70;
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


function renderHierarchyMindMap(hierarchyData) {
    // Define dimensions and margins for the SVG container
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const width = 960 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Clear previous contents (if any)
    d3.select("#mindMapContainer").selectAll("*").remove();

    // Select the SVG container and set its dimensions
    const svg = d3.select("#mindMapContainer")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Assign the data to a hierarchy
    const rootNode = d3.hierarchy(hierarchyData, d => d.children);

    // Initialize the flextree layout
    const treeLayout = d3.flextree()
        .nodeSize(d => [20, 40]); // Fixed node size: [height, width]

    // Compute the new tree layout
    treeLayout(rootNode);

    // Center the tree horizontally and vertically
    const centeringOffset = {
        x: height / 2 - rootNode.y,
        y: width / 2 - rootNode.x
    };
    rootNode.each(node => {
        node.x += centeringOffset.x;
        node.y += centeringOffset.y;
    });

    // Debugging: Log calculated positions
    rootNode.each(node => {
        console.log(`Node ${node.data.id}: x=${node.x}, y=${node.y}`);
    });

    // Create nodes and links
    const nodes = svg.selectAll(".node")
        .data(rootNode.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    nodes.append("circle")
        .attr("r", 10)
        .style("fill", d => d.data.fill);

    nodes.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.label);

    // Links (relationships)
    const links = svg.selectAll(".link")
        .data(rootNode.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Zoom and pan functionality
    const zoom = d3.zoom()
        .scaleExtent([0.5, 10])
        .on("zoom", event => svg.attr("transform", event.transform));

    svg.call(zoom);
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
        console.log("Takesnapshot trigerred by toggleCompletion ...");
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
            console.log('Handling Edit ...');
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

            renderMindMap(mindMapData);
            // Re-render the mind map to apply the selection highlight

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
    console.log("Takesnapshot trigerred by saveSjapeDetails ...");

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
// Fadi to be reviewed the selnode is not used!
function showAttributeContainer(selnode) {
    const attributeContainer = document.getElementById('attributeContainer');
    attributeContainer.style.display = 'block'; // Show the container

}


// Function to hide the attribute container
function hideAttributeContainer() {
    const attributeContainer = document.getElementById('attributeContainer');
    attributeContainer.style.display = 'none'; // Hide the container
}




function handleAddRelation() {

    addingrel = true;
    common.showMessage('Select the target node to draw relation between ...', 2000);


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
        const newNodeparentId = `s${mindMapData.nodes.length}`;
        const selectedNodeData = mindMapData.nodes.find((node) => node.id === selectedNode);

        if (selectedNodeData) {
            const existingChildrenCount = selectedNodeData.children ? selectedNodeData.children.length : 0;
            const newNodeX = selectedNodeData.x + (existingChildrenCount + 1) * 100; // Adjust the x position of the new node
            // Find the next available position for the new node
            let nextX = newNodeX;
            while (mindMapData.nodes.some((node) => node.x === nextX && node.y === selectedNodeData.y + 100)) {
                nextX += 100;
            }

            console.log("parentID calculated for the new node =", newNodeparentId);

            const newNode = {
                id: newNodeId,
                parentId: newNodeparentId,
                label: 'Double Click to Edit',
                description: 'Enter Long Description here',
                color: selectedNodeData.color,
                shape: "ellipse",
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
                stroke: 'black',
                relation_label: {
                    label: "Parent of",
                    color: "red"
                }
            });




            selectedNode = newNodeId; // Select the new node

            // Re-render the mind map with the updated data
            renderMindMap(mindMapData);
            console.log("Takesnapshot trigerred by handleaddnode ...");

            takeSnapshot(mindMapData);
        }
    }
}

function takeSnapshot(mindMapData) {
    console.log("Taking the Snapshot ....", mindMapData);
    // Fetch the latest current version or default to 0 if not found
    ismodified = 1;
    //console.log("Current Version currentVersion before update = ", currentVersion);
    //console.log('--- mindMapData before  updateversion', mindMapData);
    common.setMindMapData(mindMapData);
    fikrcollab.sendUpdate(mindMapData);


    if (!graphGroup || !graphGroup.node()) {
        console.error('graphGroup is not properly initialized');
        return;
    }

    //console.log("takeSnapshot currentTransform", currentTransform);


    updateversion(common.getSessionId(), 'increment')
        .then(updatedCurrentVersion => {
            //console.log('mindMapData before delete ', mindMapData);
            currentVersion = updatedCurrentVersion;
            //console.log("Current Version currentVersion after update = ", currentVersion);
            return deleteversions(common.getSessionId(), currentVersion);
        })
        .then(() => {
            console.log("Now taking the Snapshot .,,,");
            //console.log('mindMapData after delete', mindMapData);
            // Now, send the snapshot
            return fetch(`${baseUrlfikrflowserver}/api/savesnapshot`, {
                method: 'POST',
                body: JSON.stringify({
                    user: fikruser.getUserId(),
                    sessionid: common.getSessionId(),
                    jsondrw: mindMapData,
                    version: currentVersion,
                    zoomScale: currentTransform.k,
                    translateX: currentTransform.x,
                    translateY: currentTransform.y
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
        const response = await fetch(`${baseUrlfikrflowserver}/api/getsnapshot?user=${vuserID}&sessionid=${vsessionID}&version=${version}`, {
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
        // console.log("fetchcurrentdrawchainversion searching for the element with fikruser.getUserId() = " + fikruser.getUserId())
        //console.log("fetchcurrentdrawchainversion searching for the element with common.getSessionId() = " + common.getSessionId())
        const vuserID = fikruser.getUserId();
        const vsessionID = common.getSessionId();
        const response = await fetch(`${baseUrlfikrflowserver}/api/fetchcurrentdrawchainversion?user=${vuserID}&sessionid=${vsessionID}`, {
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
        const response = await fetch(`${baseUrlfikrflowserver}/api/fetchcurrentdrawsessionversion?user=${vuserID}&sessionid=${vsessionID}`, {
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




// Helper function to update undo and redo button states
async function updateUndoRedoButtons() {

    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');

    //console.log("Now getting the current version for session id = " + common.getSessionId());
    const chainVersion = await fetchcurrentdrawchainversion() || 0; // Fetch the latest current version
    //console.log("updateUndoRedoButtons = currentVersion = " + currentVersion)
    //console.log("updateUndoRedoButtons = chainVersion = " + chainVersion)

    undoButton.disabled = currentVersion <= 1;
    redoButton.disabled = currentVersion >= chainVersion;

}



function handleRectEdit() { // double click
    console.log('Handling Edit for ' + selectedNode);
    if (selectedNode) {
        const selectedNodeId = selectedNode;
        const selectedNodeElement = document.getElementById(`${selectedNodeId}`);
        const textElement = selectedNodeElement.querySelector('text[data-tag="recttext"], text[data-tag="ellipsetext"], [data-tag="parallelogramtext"],[data-tag="diamondtext"]');

        // Open the attribute container when nodeId is not null
        showAttributeContainer(); // Call a function to show the attribute container

        if (textElement) {
            //const currentText = textElement.textContent;
            //const rectextStyle = window.getComputedStyle(textElement);
            let currentText = textElement.innerHTML; // Change textContent to innerHTML
            const tspans = Array.from(textElement.getElementsByTagName('tspan'));
            currentText = tspans.map(tspan => tspan.textContent).join('\n');
            console.log("currentText=" + currentText);

            const rectextStyle = window.getComputedStyle(textElement);
            const rectextBox = textElement.getBBox();

            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            const textareaElement = document.createElement('textarea'); // Changed input to textarea
            textareaElement.value = currentText;

            // Set attributes to match the width, height, x, and y of the original text element
            foreignObject.setAttribute('width', common.nodesize.width.rectangle); // Set to rectangle
            //foreignObject.setAttribute('height', 'auto'); // Set to auto to allow for variable height
            foreignObject.setAttribute('x', rectextBox.x);
            foreignObject.setAttribute('y', rectextBox.y);
            foreignObject.setAttribute('style', 'overflow: visible');

            // Apply the same style as the original text element
            textareaElement.style.fontSize = rectextStyle.fontSize;
            textareaElement.style.fontWeight = rectextStyle.fontWeight;
            textareaElement.style.fontFamily = rectextStyle.fontFamily;
            textareaElement.style.textAnchor = rectextStyle.textAnchor;
            textareaElement.style.alignmentBaseline = rectextStyle.alignmentBaseline;

            // Set the font color to black in the textarea element
            textareaElement.style.color = 'blue';

            // Set other necessary styles for the textarea element
            const x = common.nodesize.width.rectangle - 35;
            textareaElement.style.width = x + 'px'; // Set to rectangle

            // Assuming line height is 1.2em
            //textareaElement.style.height = 'auto'; // Set to auto to allow for variable height
            setTimeout(() => {
                common.adjustTextareaHeight(textareaElement);
            }, 100); // Adjust the delay as needed

            textareaElement.style.overflowY = 'auto'; // Allow vertical scrolling
            textareaElement.style.resize = 'none'; // Disable user resizing

            foreignObject.appendChild(textareaElement);
            selectedNodeElement.appendChild(foreignObject);

            // Hide the original text element while editing
            textElement.style.visibility = 'hidden';

            // Apply focus and selection after the textarea element is rendered
            requestAnimationFrame(() => {
                textareaElement.focus();
                textareaElement.select();
            });

            textareaElement.addEventListener('keydown', (event) => {

                // Assuming selectedNodeElement is a g element containing a rect element
                const selectedNodeData = mindMapData.nodes.find((node) => node.id === selectedNodeId);

                if (selectedNodeData) {
                    const maxLinesForShape = common.nodetext.maxlines[selectedNodeData.shape];
                    const maxCharsPerLine = common.nodetext.length[selectedNodeData.shape];
                    const lines = textareaElement.value.split(/\n|\r\n|\r/);

                    // Calculate the current number of lines considering wrapping
                    const currentLines = Math.ceil(textareaElement.scrollHeight / parseFloat(window.getComputedStyle(textareaElement).lineHeight) - 1);

                    //console.log(`Max Lines: ${maxLinesForShape}, Max Chars per Line: ${maxCharsPerLine}, currentLines: ${currentLines} `);
                    //console.log("lines", lines);

                    if (event.key !== 'Backspace' && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Delete') {

                        if (currentLines > maxLinesForShape) {
                            common.showMessage(`Exceeded maximum lines (${maxLinesForShape}) for shape: ${selectedNodeData.shape}`, 2000);
                            event.preventDefault();
                            event.stopPropagation();

                        }

                    }
                }
            });

            textareaElement.addEventListener('input', (event) => {
                RemoveToggleButtons();
                common.adjustTextareaHeight(textareaElement);

                // Assuming selectedNodeElement is a g element containing a rect element
                const selectedNodeData = mindMapData.nodes.find((node) => node.id === selectedNodeId);


                if (selectedNodeData.shape === "rectangle") {
                    const rectElement = selectedNodeElement.querySelector('rect');
                    if (rectElement) {
                        rectElement.setAttribute('height', textareaElement.scrollHeight);
                    }
                } else if (selectedNodeData.shape === "ellipse") {
                    const ellipseElement = selectedNodeElement.querySelector('ellipse');
                    if (ellipseElement) {
                        // Adjust the ry attribute to half the textarea height,
                        // assuming you want the total height of the ellipse to match the textarea height
                        ellipseElement.setAttribute('ry', textareaElement.scrollHeight / 2);
                    }
                } else if (selectedNodeData.shape === "parallelogram") {
                    const pathElement = selectedNodeElement.querySelector('path');
                    if (pathElement) {
                        // Assuming yOffset is the horizontal skew of the parallelogram
                        const yOffset = 10; // Adjust this value to match your actual yOffset
                        const newHeight = textareaElement.scrollHeight;
                        const newPoints = [
                            { x: 0, y: 0 },
                            { x: common.nodesize.width.parallelogram - yOffset, y: 0 },
                            { x: common.nodesize.width.parallelogram, y: newHeight },
                            { x: yOffset, y: newHeight }
                        ];
                        const newD = "M" + newPoints.map(p => `${p.x},${p.y}`).join("L") + "Z";
                        pathElement.setAttribute('d', newD);
                    }
                }


            });

            // going out / loose focus from the Text Area
            textareaElement.addEventListener('blur', () => {
                const newText = textareaElement.value;
                console.log("lines= newText=", newText);

                const lines = newText.split('\n'); // Split the text into lines
                console.log("lines= lines=", lines);
                // Clear any existing tspan elements
                while (textElement.firstChild) {
                    textElement.removeChild(textElement.firstChild);
                }

                // Create a new tspan element for each line of text
                lines.forEach((line, index) => {
                    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                    tspan.textContent = line;
                    tspan.setAttribute('x', rectextBox.x); // Set the x position to the same as the textElement
                    tspan.setAttribute('dy', index === 0 ? '0' : '1.2em'); // Set the dy attribute to shift each subsequent line down
                    textElement.appendChild(tspan); // Append the tspan to the textElement
                });

                const selectedNodeData = mindMapData.nodes.find((node) => node.id === selectedNodeId);
                console.log("selectedNodeData.shape ", selectedNodeData.shape);
                if (selectedNodeData && selectedNodeData.shape === 'diamond') {
                    console.log("shape is diamond ... ");

                }


                if (selectedNodeData) {
                    selectedNodeData.label = newText; // Update the label in your data
                }



                // Show the original text element after editing is done
                textElement.style.visibility = 'visible';

                // Adjust the height of the rectangle to fit the text
                const newHeight = lines.length * 1.2 * parseFloat(rectextStyle.fontSize); // Assumes a line height of 1.2em
                const txtElement = selectedNodeElement.querySelector('text[data-tag="recttext"], text[data-tag="ellipsetext"], [data-tag="parallelogramtext"],[data-tag="diamondtext"]');


                if (txtElement) {
                    txtElement.setAttribute('height', newHeight);
                }

                selectedNodeElement.removeChild(foreignObject);
            });

            textareaElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && event.shiftKey) { // Allow Shift+Enter for new lines
                    event.preventDefault();
                    hideAttributeContainer();
                    textareaElement.blur(); // Trigger blur event to save the entered text
                }
            });

            console.log("Takesnapshot triggered by handlerectedit ...");

            takeSnapshot(mindMapData);
        }
    }
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
    console.log("||||||||| showColorPalette for id =" + id, 'type =' + type);

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

            if (id.startsWith("label")) {
                const labelElement = d3.select(`#${id}`);
                labelElement.style('color', colorCode);

                // Extract the part after "label-"
                const extractedId = id.substring("label-".length);

                // Update the stroke-width in the mind map data
                const relationship = mindMapData.relationships.find((relation) => {
                    const slineId = `${relation.source}-${relation.target}`;
                    return slineId === extractedId;
                });

                console.log("relationship = ", relationship);
                relationship.relation_label.color = colorCode;

            } else if (type == 'line') {
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
            console.log("Takesnapshot trigerred by showcolorpalette ...");

            takeSnapshot(mindMapData);
        });
        colorPalette.appendChild(colorPaletteColor);
    }


    if (id.startsWith("label")) {
        const labelElement = d3.select(`#${id}`);
        console.log("labelElement=", labelElement);

        const x = parseFloat(labelElement.attr("x"));
        const y = parseFloat(labelElement.attr("y"));
        console.log("x:", x, "y:", y);

        // Position the color palette next to the label
        const paletteX = x - 70; // Adjust the offset as needed
        const paletteY = y - 70; // Adjust the offset as needed

        colorPalette.style.top = paletteY + "px";
        colorPalette.style.left = paletteX + "px";
    }

    // Calculate the midpoint of the line or box
    else if (type === 'line') {
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

        const paletteX = x + common.nodesize.height.rectangle;
        const paletteY = y - common.nodesize.height.rectangle;

        colorPalette.style.top = paletteY + "px";
        colorPalette.style.left = paletteX + "px";
    }

    // Show the color palette
    colorPalette.style.zIndex = "1000";
    colorPalette.style.display = "block";
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
            const zoomScale = selectedFile.zoomScale;
            const translateX = selectedFile.translateX;
            const translateY = selectedFile.translateY;

            console.log('Selected jsondrw file', selectedFile.fileName);
            console.log('Selected jsondrw:', selectedJsondrw);
            console.log("selectedFileNameElement.textContent fileListSelect.value = ", fileListSelect.value);

            console.log('Selected zoomScale:', zoomScale);
            console.log('Selected translateX:', translateX);
            console.log('Selected translateY:', translateY);


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
        const response = await fetch(`${baseUrlfikrflowserver}/api/updateversion`, {
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
                //console.log('Version Updated Successfully');
                //console.log(data);
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
        //console.log("Deleting All Versions after or equal ..." + targetdelete);
        // Proceed with saving using the file name
    try {
        const response = await fetch(`${baseUrlfikrflowserver}/api/deleteversions`, {
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
            //console.log('Versions Deleted Successfully');
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






document.addEventListener("DOMContentLoaded", function() {



    const fileNameInput = document.getElementById("fileNameInput");
    drawingExistsInBlur = false; // Initialize a flag
    blurEventPromise = Promise.resolve(); // Initialize a resolved promise

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
        const response = await fetch(`${baseUrlfikrflowserver}/api/export-xlsx`, {
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
                const fullUrl = `${baseUrlfikrflowserver}/` + data.downloadLink;

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


// Function to read an XLSX file and convert it to mindMapData
function readXLSXFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const data = e.target.result;
                const workbook = xlsx.read(data, { type: 'binary' });

                // Assuming that the 'Nodes' and 'Relationships' sheets exist in the XLSX file
                const nodesSheet = workbook.Sheets['Nodes'];
                const relationshipsSheet = workbook.Sheets['Relationships'];

                // Convert sheets to JSON objects
                const nodesData = xlsx.utils.sheet_to_json(nodesSheet);
                const relationshipsData = xlsx.utils.sheet_to_json(relationshipsSheet);

                // Construct the mindMapData object
                const mindMapData = {
                    nodes: nodesData,
                    relationships: relationshipsData
                };

                resolve(mindMapData);
            } catch (error) {
                reject(error);
            }
        };

        reader.readAsBinaryString(file);
    });
}


function RemoveToggleButtons() {
    // Remove any existing circles with the "below" classes
    svg.selectAll(".three-dots-group").remove();
    svg.selectAll(".plus-button").remove();
    svg.selectAll(".pen-button").remove();
}


function handleColorPalette(type, id) {
    const colorPalette = document.getElementById("colorPalette");
    showColorPalette(type, id);

}

async function r_save_Button_conf_handleSaveDrawing() {
    console.log("r_save_Button_conf_handleSaveDrawing Clicked - Start - ..");


    // Capture the current zoom transform from graphGroup
    const zoomScale = currentTransform.k; // zoom scale
    const translateX = currentTransform.x; // translate x
    const translateY = currentTransform.y; // translate y
    console.log("in r_save_Button_conf_handleSaveDrawing currentTransform=", currentTransform);

    // Wait for the blur event promise to resolve
    await blurEventPromise;


    // if drawing exist in Blur then don't continue
    if (drawingExistsInBlur == true)
        return;
    if (common.getFileName()) {
        console.log("r_save_Button_conf_handleSaveDrawing = common.getFileName: " + common.getFileName());

        // Now you can use the fileName for your save operation
        if (fikrdraw.saveDrawing(common.getFileName(), mindMapData, fikruser.getUserId(), common.getSessionId(), zoomScale, translateX, translateY)) {
            ismodified = 0;

        }
    } else if (fileNameInput.value) { // File Name is null but User has gave already the name to set 
        console.log("r_save_Button_conf_handleSaveDrawing = Selected File Name: " + fileNameInput.value);

        // Now you can use the fileName for your save operation
        if (fikrdraw.saveDrawing(fileNameInput.value, mindMapData, fikruser.getUserId(), common.getSessionId(), zoomScale, translateX, translateY)) {
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


function setIsModified(value) {
    ismodified = value;
}

function getIsModified() {
    return ismodified;
}




export { renderMindMap, generateMindmap, sendChatMessage, setIsModified, getIsModified, displayfilelist, showSaveConfirmationModal, r_save_Button_conf_handleSaveDrawing, transformManager, handleAddRelation, handleAddNode };