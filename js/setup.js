import * as common from './common.js';

import { sendChatMessage } from './fikrmap.js';
import { showMessage } from './common.js';
import { setIsModified, getIsModified } from './fikrmap.js';
import { displayfilelist } from './fikrmap.js';
import { showSaveConfirmationModal } from './fikrmap.js';
import { r_save_Button_conf_handleSaveDrawing } from './fikrmap.js';
import { transformManager } from './fikrmap.js';




// Button moving the SVG Left , Right, Up and Down
let currentTranslate = { x: 0, y: 0 };
const moveStep = 50; // Define the step size for each movement


// the File Name of the Drawing
const selectedFileNameElement = document.getElementById('selectedFileName');

// Modal for Saving the Drawing under a File Name
const fileNameModal = new bootstrap.Modal(document.getElementById('fileNameModal'));


// Zoom
// Create the zoom behavior
const zoom = d3.zoom()
    .scaleExtent([0.1, 10]) // This defines the min and max zoom scale, feel free to change these values
    .filter(event => event.type === 'wheel' && event.shiftKey) // Only allow zoom when shift key is pressed
    .on("zoom", zoomed);
// Apply the zoom behavior to your SVG
d3.select("#graphGroup").call(zoom);

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

// Assume buttons with ids 'zoomInButton', 'zoomOutButton', and 'resetZoomButton' exist
document.getElementById('zoomInButton').addEventListener('click', zoomIn);
document.getElementById('zoomOutButton').addEventListener('click', zoomOut);
document.getElementById('resetZoomButton').addEventListener('click', resetZoom);

// Button moving Left / Righ / Up and Down
document.getElementById('move-left').addEventListener('click', () => move('left'));
document.getElementById('move-right').addEventListener('click', () => move('right'));
document.getElementById('move-up').addEventListener('click', () => move('up'));
document.getElementById('move-down').addEventListener('click', () => move('down'));

// Add a click event listener to the "Save" button (add name to drawing and save)
const r_save_Button_conf_saveDrawingButton = document.getElementById("r_save_Button_conf_saveDrawingButton");


if (r_save_Button_conf_saveDrawingButton) {
    // console.log("Save Drawing - Clicked Save Button");
    r_save_Button_conf_saveDrawingButton.addEventListener("click", r_save_Button_conf_handleSaveDrawing);
}

function handleInputSubmit() {
    const userInput = document.getElementById('textInput').value;
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
        setIsModified(0);
        //ismodified = 0;
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
        setIsModified(0);
        //ismodified = 0;
    }
}





async function r_open_Button_handleOpen() {


    console.log("common.getFileName() = ", common.getFileName());
    console.log("ismodified = ", getIsModified());


    if (common.getFileName()) {
        ////////////////////// File Already Selected 
        console.log("File Already Selected Ask to Save Before showing File Selection ...");

        if (getIsModified() == 1) {
            ////////////////////// File Already Selected and Modified ====> SAVE or IGNORE
            console.log("file is not null and ismodified is already equal 1");

            showSaveConfirmationModal();
        } else {
            displayfilelist();

        }


    } else {
        if (getIsModified() == 1)
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
        console.log("... ismodified =", getIsModified())

        // saved existing file. Now shoe the list of existing files to switch to another file.
        if (common.getFileName() === null && getIsModified() == 1) {
            console.log("... File Empty and ismodified == 1")
            const fileNameInput = document.getElementById('fileNameInput');
            fileNameInput.value = "";
            fileNameModal.show(); // show the dialog where u need to enter the file name.
        }
        //ismodified = 0;
        setIsModified(0);
    });
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



// Function to zoom in
function zoomIn() {
    const vcurrentTransform = d3.zoomTransform(d3.select('#graphGroup').node());
    const newScale = vcurrentTransform.k * 1.2; // Increase the current scale by 20%
    const newTransform = d3.zoomIdentity.translate(vcurrentTransform.x, vcurrentTransform.y).scale(newScale);
    d3.select('#graphGroup').transition().duration(750).call(zoom.transform, newTransform); // Apply the new transform with a transition
    transformManager.currentTransform = newTransform;


}

// Function to zoom out
function zoomOut() {
    const vcurrentTransform = d3.zoomTransform(d3.select('#graphGroup').node());
    const newScale = vcurrentTransform.k / 1.2; // Decrease the current scale by 20%
    const newTransform = d3.zoomIdentity.translate(vcurrentTransform.x, vcurrentTransform.y).scale(newScale);
    d3.select('#graphGroup').transition().duration(750).call(zoom.transform, newTransform); // Apply the new transform with a transition
    transformManager.currentTransform = newTransform;
}

// Function to reset zoom to 1
function resetZoom() {
    // Reset currentTranslate
    currentTranslate = { x: 0, y: 0 };

    // Create a new zoom transform with the specified values
    const newTransform = d3.zoomIdentity.scale(1);

    // Apply the new zoom transform to #graphGroup
    d3.select('#graphGroup')
        .transition()
        .duration(750)
        .call(zoom.transform, newTransform);

    // Update transformManager.currentTransform
    transformManager.setCurrentTransform({ k: 1, x: 0, y: 0 });
}


function move(direction) {
    console.log("Moving the SVG in Direction =" + direction);

    switch (direction) {
        case 'left':
            currentTranslate.x -= moveStep / transformManager.currentTransform.k;
            break;
        case 'right':
            currentTranslate.x += moveStep / transformManager.currentTransform.k;
            break;
        case 'up':
            currentTranslate.y -= moveStep / transformManager.currentTransform.k;
            break;
        case 'down':
            currentTranslate.y += moveStep / transformManager.currentTransform.k;
            break;
    }

    // Now apply this translation to the zoom transform
    const newTransform = d3.zoomIdentity.translate(currentTranslate.x, currentTranslate.y).scale(transformManager.currentTransform.k);
    d3.select('#graphGroup').transition().duration(750).call(zoom.transform, newTransform);
    transformManager.currentTransform = newTransform;
}




// Create a function to handle zooming
function zoomed(event) {

    d3.select("#graphGroup").attr("transform", event.transform);

    // Update the transform
    //d3.select("#mindMapContainer").attr("transform", event.transform);
    // Update the currentTransform variable with the new transform values
    transformManager.currentTransform.k = event.transform.k;
    transformManager.currentTransform.x = event.transform.x;
    transformManager.currentTransform.y = event.transform.y;

    // Optionally, you can log the currentTransform to the console to verify
    console.log("zoomed = ", transformManager.currentTransform);
}