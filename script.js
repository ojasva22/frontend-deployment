const apigClient = apigClientFactory.newClient();
const API_KEY = ''; // Replace with your actual API Gateway API key

// Handle File Upload
document.getElementById('upload-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById('photo-file');
  const labelsInput = document.getElementById('custom-labels');
  const uploadStatus = document.getElementById('upload-status');

  // Validate file input
  if (!fileInput.files.length) {
    uploadStatus.textContent = 'Please select a file to upload.';
    uploadStatus.style.color = 'red';
    return;
  }

  const file = fileInput.files[0];

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    uploadStatus.textContent = 'Invalid file type. Please upload JPEG, PNG, or JPG.';
    uploadStatus.style.color = 'red';
    return;
  }

  // Validate file size (e.g., max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    uploadStatus.textContent = 'File is too large. Maximum size is 5MB.';
    uploadStatus.style.color = 'red';
    return;
  }

  try {
    // Reset status
    uploadStatus.textContent = 'Uploading...';
    uploadStatus.style.color = 'blue';

    // Prepare upload parameters
    const objectKey = `uploads/${Date.now()}_${encodeURIComponent(file.name)}`;
    const customLabels = labelsInput.value.trim() || ''; // Ensure it's defined, even if empty

    const params = {
      'object-key': objectKey,
    };

    const additionalParams = {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': file.type || 'application/octet-stream',
        'x-amz-meta-customLabels': customLabels, // Always include this header
      },
    };

    console.log("params --> ", additionalParams)

    // Perform the upload using apigClient
    const response = await apigClient.photosObjectKeyPut(params, file, additionalParams);

    // Handle response
    if (response.status === 200) {
      uploadStatus.textContent = `File uploaded successfully: ${file.name}`;
      uploadStatus.style.color = 'green';

      // Optional: Reset form
      fileInput.value = '';
      labelsInput.value = '';
    } else {
      const errorText = response.data ? JSON.stringify(response.data) : `Status: ${response.status}`;
      throw new Error(`Upload failed: ${errorText}`);
    }
  } catch (error) {
    console.error('Error uploading photo:', error);
    uploadStatus.textContent = 'Upload failed. Check console for details.';
    uploadStatus.style.color = 'red';
  }
});

// Handle Photo Search (unchanged from previous script)
document.getElementById('search-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = document.getElementById('search-query').value;
  const resultsDiv = document.getElementById('search-results');
  resultsDiv.innerHTML = 'Searching...';
  
  try {
    const params = { q: query };
    const additionalParams = {
      headers: {
        'x-api-key': API_KEY,
      },
    };
    
    const response = await apigClient.searchGet(params, {}, additionalParams);
    resultsDiv.innerHTML = ''; // Clear previous results
    
    if (response.data.results && response.data.results.length > 0) {
      response.data.results.forEach((photo) => {
        const img = document.createElement('img');
        img.src = photo.url; // Use pre-signed URL from the response
        img.alt = 'Photo';
        img.style.margin = '10px';
        img.style.maxWidth = '300px';
        resultsDiv.appendChild(img);
        
        // Display additional details
        const details = document.createElement('div');
        details.style.margin = '10px';
        details.innerHTML = `
          <strong>Labels:</strong> ${photo.labels.join(', ')}<br>
        `;
        resultsDiv.appendChild(details);
      });
    } else {
      resultsDiv.innerHTML = 'No results found.';
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    resultsDiv.innerHTML = 'Error fetching search results. See console for details.';
  }
});
