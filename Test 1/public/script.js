document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt');
    const btnVideo = document.getElementById('btn-video');
    const loadingSection = document.getElementById('loading');
    const loadingText = document.getElementById('loading-text');
    const errorSection = document.getElementById('error');
    const resultContainer = document.getElementById('result-container');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const uploadText = document.getElementById('upload-text');

    let selectedFile = null;

    // Handle File Upload Preview
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            uploadText.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    const setUIState = (isLoading, text = '') => {
        btnVideo.disabled = isLoading;
        promptInput.disabled = isLoading;
        imageUpload.disabled = isLoading;
        
        if (isLoading) {
            loadingText.textContent = text;
            loadingSection.classList.remove('hidden');
            errorSection.classList.add('hidden');
            resultContainer.classList.add('hidden');
            resultContainer.innerHTML = '';
        } else {
            loadingSection.classList.add('hidden');
        }
    };

    const showError = (message) => {
        setUIState(false);
        errorSection.textContent = message;
        errorSection.classList.remove('hidden');
    };

    const showResult = (htmlContent) => {
        setUIState(false);
        resultContainer.innerHTML = htmlContent;
        resultContainer.classList.remove('hidden');
    };

    btnVideo.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt && !selectedFile) return showError('Please upload an image and enter a motion prompt.');

        setUIState(true, 'Initiating video generation task with Agnes API...');

        try {
            const formData = new FormData();
            if (prompt) formData.append('prompt', prompt);
            if (selectedFile) formData.append('image', selectedFile);

            const response = await fetch('/api/generate-video', {
                method: 'POST',
                body: formData // No Content-Type header so browser sets multipart/form-data boundary
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initiate video');
            }

            const taskId = data.id || data.task_id;
            if (!taskId) {
                throw new Error('No task ID received from API');
            }

            pollVideoStatus(taskId);

        } catch (error) {
            showError(error.message);
        }
    });

    const pollVideoStatus = async (taskId) => {
        loadingText.textContent = 'Generating video... this may take a few minutes. Please wait.';
        
        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/video-status/${taskId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to check status');
                }

                const rawStatus = (data.status || data.state || data.task_status || '').toLowerCase();
                const isComplete = ['completed', 'succeeded', 'success', 'finish', 'finished', 'done'].includes(rawStatus);
                const isFailed = ['failed', 'error', 'cancelled', 'canceled'].includes(rawStatus);

                if (isComplete) {
                    let videoUrl = data._detected_video_url
                        || data.video_url
                        || data.url
                        || (data.data && data.data[0] && (data.data[0].url || data.data[0].video_url))
                        || (data.output && (data.output.url || data.output.video_url))
                        || (data.result && (data.result.url || data.result.video_url));

                    if (videoUrl) {
                        loadingText.textContent = 'Video generated! Converting to GIF format...';
                        convertVideoToGif(videoUrl);
                    } else {
                        showError('Video ready but URL not detected in API response.');
                    }
                } else if (isFailed) {
                    showError(`Video generation failed: ${data.error || data.message || 'Unknown error'}`);
                } else {
                    setTimeout(checkStatus, 5000);
                }
            } catch (error) {
                showError(`Error polling status: ${error.message}`);
            }
        };

        setTimeout(checkStatus, 5000);
    };

    const convertVideoToGif = async (videoUrl) => {
        try {
            const response = await fetch('/api/convert-to-gif', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoUrl })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to convert to GIF');
            }

            showResult(`
                <img src="${data.gifUrl}" alt="Generated GIF" style="width: 100%; border-radius: 8px;" />
                <p style="color:#94a3b8; margin-top: 0.5rem; font-size: 0.85rem; text-align: center;">
                    <a href="${data.gifUrl}" download="agnes_animation.gif" class="btn primary" style="display:inline-block; padding: 0.5rem 1rem; text-decoration: none; margin-top: 10px;">Download GIF</a>
                </p>
            `);
        } catch (error) {
            showError(`Error during GIF conversion: ${error.message}`);
        }
    };
});
