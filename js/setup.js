import { move } from './fikrmap.js';
import { sendChatMessage } from './fikrmap.js';
import { showMessage } from './common.js';
import * as common from './common.js';



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
    const currentTransform = d3.zoomTransform(svg.node());
    const newScale = currentTransform.k * 1.2; // Increase the current scale by 20%
    const newTransform = d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale);
    svg.transition().duration(750).call(zoom.transform, newTransform); // Apply the new transform with a transition
}

// Function to zoom out
function zoomOut() {
    const currentTransform = d3.zoomTransform(svg.node());
    const newScale = currentTransform.k / 1.2; // Decrease the current scale by 20%
    const newTransform = d3.zoomIdentity.translate(currentTransform.x, currentTransform.y).scale(newScale);
    svg.transition().duration(750).call(zoom.transform, newTransform); // Apply the new transform with a transition
}

// Function to reset zoom
function resetZoom() {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity); // Reset the transform to the identity transform
}