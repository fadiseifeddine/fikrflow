// Langflow function
async function chatWithLLM(inputMessage) {
    // Check if the user provided an input message
    if (inputMessage !== "") {
        console.log("in fikrLLM passing the inputMessage = ", inputMessage);
        // Proceed with sending the input message to the API
        try {
            const apiUrl = 'http://127.0.0.1:7860/api/v1/process/cd46ee71-3698-45af-aab4-a20c2bb2e1e2';

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify({
                    inputs: {
                        input: inputMessage,
                    },
                    tweaks: {
                        "VectorStoreAgent-GXCGX": {},
                        "VectorStoreInfo-8x3YP": {},
                        "Chroma-9l3eY": {},
                        "RecursiveCharacterTextSplitter-urR6c": {},
                        "PyPDFLoader-qPsAW": {},
                        "VertexAI-E21nZ": {},
                        "VertexAIEmbeddings-nUu7k": {}
                    }
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // Handle success
                const responseData = await response.json();
                console.log('API Response:', responseData);
                // Do something with responseData if needed
                return true; // Return true on success
            } else {
                // Handle failure
                console.error('Failed to process input message');
                // Provide appropriate user feedback
                return false; // Return false on failure
            }
        } catch (error) {
            // Handle errors
            console.error('An error occurred:', error);
            // Provide appropriate user feedback
            return false; // Return false on error
        }
    } else {
        // Return false if the input message is not provided
        return false;
    }
}

// below is the Langchain code

// Function to upload a folder
async function uploadFolder(folderPath) {
    try {
        const response = await fetch('http://localhost:5000/upload_folder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                folder_path: folderPath,
            }),
        });

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error uploading folder:', error);
    }
}

// Function to process input
async function fikrchain(inputMessage) {
    try {
        const response = await fetch('http://localhost:5000/fikrchain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input_message: inputMessage,
            }),
        });

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error processing input:', error);
    }
}



export { chatWithLLM, uploadFolder, fikrchain };