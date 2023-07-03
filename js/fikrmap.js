// Import the required libraries
const { Storage } = require('@google-cloud/storage');
const d3 = require('d3');

// Configure Google Cloud Storage
const storage = new Storage({
    keyFilename: '../credentials/fikrflow-184113c0ddc1.json', // Path to your Google Cloud service account JSON key file
    projectId: 'fickrflow', // Replace with your Google Cloud project ID
});

// Define the bucket and file name for your mind map SVG
const bucketName = 'fickrflow';
const fileName = 'fikrmap.svg';

// Function to load the SVG file from Google Cloud Storage and render it using D3.js
async function loadMindMap() {
    try {
        console.log('Mind map Loading ....');
        // Download the SVG file from Google Cloud Storage
        const file = storage.bucket(bucketName).file(fileName);
        const [data] = await file.download();

        // Render the SVG using D3.js
        const svg = d3.select('#mindMap');
        svg.html(data);

        console.log('Mind map loaded successfully!');
    } catch (error) {
        console.error('Error loading mind map:', error);
    }
}

// Call the function to load and render the mind map
console.log('Before calling loadMindMap'); // Add this line before invoking the function
loadMindMap();