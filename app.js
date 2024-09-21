let isPermissionGranted = false;
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const transcriptionDiv = document.getElementById('transcription');
const historyList = document.getElementById('history-list');

// Check if the browser supports Web Speech API
if (!('webkitSpeechRecognition' in window)) {
    alert("Your browser does not support speech recognition.");
} else {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;  // Enable interim results for real-time feedback
    recognition.maxAlternatives = 1;
    let isListening = false;
    let finalTranscript = '';

    // Function to start recognition
    function startRecognition() {
        recognition.start();
        isListening = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        transcriptionDiv.textContent = 'Listening...';
    }

    // Function to stop recognition
    function stopRecognition() {
        recognition.stop();
        isListening = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    // Start listening on button click
    startBtn.addEventListener('click', async () => {
        if (!isPermissionGranted) {
            try {
                // Request microphone access permission
                await navigator.mediaDevices.getUserMedia({ audio: true });
                isPermissionGranted = true;
                startRecognition();
            } catch (err) {
                console.error("Permission denied or error occurred: ", err);
                transcriptionDiv.textContent = "Permission denied.";
            }
        } else {
            startRecognition();
        }
    });

    // Stop listening on button click
    stopBtn.addEventListener('click', () => {
        if (isListening) {
            stopRecognition();
        }
    });

    // Handle interim and final recognition results
    recognition.onresult = (event) => {
        let interimTranscript = '';
        finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
            let transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update the transcription div with interim results
        transcriptionDiv.textContent = interimTranscript || finalTranscript;

        // If the result is final, add to history
        if (finalTranscript) {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.textContent = finalTranscript;
            historyList.appendChild(historyItem);
        }
    };

    // Handle recognition end
    recognition.onend = () => {
        if (isListening) {
            recognition.start(); // Restart listening for continuous transcription
        }
    };

    // Handle errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        transcriptionDiv.textContent = 'Error occurred: ' + event.error;
    };
}
