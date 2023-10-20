const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                     {color: '#00FF00', lineWidth: 5});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
    }
  }
  canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResults);


function countFingers(landmarks) {
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbCMC = landmarks[1];
    const wrist = landmarks[0];
    const thumb = landmarks[4];
    const pinky = landmarks[20];

    let fingerCount = 0;
  
    // Check if thumb is extended

    if (wrist.x < thumb.x) {
        if (thumbTip.x > thumbIP.x) {
              fingerCount++;
            }
    } else if (wrist.x > thumb.x) {
        if (thumbTip.x < thumbIP.x) {
            fingerCount++;
        }
    }



    const fingerTips = [8, 12, 16, 20];
  
    for (const tipIdx of fingerTips) {
      const fingerTip = landmarks[tipIdx];
      const prevFingerJoint = landmarks[tipIdx - 2];
      const nextFingerJoint = landmarks[tipIdx - 1];
  
      const distance = Math.sqrt(
        Math.pow(fingerTip.x - prevFingerJoint.x, 2) +
        Math.pow(fingerTip.y - prevFingerJoint.y, 2) +
        Math.pow(fingerTip.z - prevFingerJoint.z, 2)
      );
  
      if (distance > 0.03 && fingerTip.y < nextFingerJoint.y) {
        fingerCount++;
      }
    }
  
    return fingerCount;
  }
  
  function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
          { color: '#00FF00', lineWidth: 5 });
        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
  
        const fingerCount = countFingers(landmarks);
        canvasCtx.font = '28px Arial';
        canvasCtx.fillStyle = '#FFFFFF';
        canvasCtx.fillText(`Số Ngón Tay: ${fingerCount}`, 10, 50);
      }
    }
    canvasCtx.restore();
  }
  

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  hands.onResults(onResults);
  
  hands.initialize().then(() => {
    hands.start();
  });
  
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: 640,
    height: 360
  });
  camera.start();