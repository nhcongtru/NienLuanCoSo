
let leftHandCount = 0;
let rightHandCount = 0;

function countFingers(landmarks) {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];

  let fingerCount = 0;

  if (isThumbExtended(landmarks)) {
    fingerCount++;
  }

  const fingerTips = [8, 12, 16, 20];

  for (const tipIdx of fingerTips) {
    const fingerTip = landmarks[tipIdx];
    const prevFingerJoint = landmarks[tipIdx - 3];
    const nextFingerJoint = landmarks[tipIdx - 1];

    if (isFingerTipExtended(fingerTip, prevFingerJoint, nextFingerJoint)) {
      fingerCount++;
    }
  }

  return fingerCount;
}

function isThumbExtended(landmarks) {
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];

  if (landmarks[0].x > landmarks[9].x) {
    return thumbTip.x < thumbIP.x;
  } else {
    return thumbTip.x > thumbIP.x;
  }
}

function isFingerTipExtended(point1, point2, referencePoint) {
  const distanceToReference = calculateDistance(point1, referencePoint);

  return distanceToReference > 0.03 && point1.y < point2.y;
}

function calculateDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) +
    Math.pow(point1.y - point2.y, 2) +
    Math.pow(point1.z - point2.z, 2)
  );
}


//IMAGE

const canvasElementIMG = document.getElementById('outputCanvas');
const canvasCtxIMG = canvasElementIMG.getContext('2d');

function clearCanvas() {
  canvasCtxIMG.clearRect(0, 0, canvasElementIMG.width, canvasElementIMG.height);
}

function onHandResultsIMG(results) {
  canvasCtxIMG.save();
  clearCanvas();

  canvasCtxIMG.drawImage(
    results.image, 0, 0, canvasElementIMG.width, canvasElementIMG.height);

  if (results.multiHandLandmarks) {
    for (let handIndex = 0; handIndex < results.multiHandLandmarks.length; handIndex++) {
      const landmarks = results.multiHandLandmarks[handIndex];
      drawConnectors(canvasCtxIMG, landmarks, HAND_CONNECTIONS,
        { color: '#00FF00', lineWidth: 3 });
      drawLandmarks(canvasCtxIMG, landmarks, { color: '#FF0000', lineWidth: 1 });

      const fingerCount = countFingers(landmarks);
      canvasCtxIMG.font = '28px Arial';
      canvasCtxIMG.fillStyle = '#FF0000';

      if (landmarks[0].x > landmarks[9].x) {
        leftHandCount = fingerCount;
        canvasCtxIMG.fillText(`Số Ngón Tay Trái: ${leftHandCount}`, 640, 50);
      } else {
        rightHandCount = fingerCount;
        canvasCtxIMG.fillText(`Số Ngón Tay Phải: ${rightHandCount}`, 5, 50);
      }
    }
  }

  canvasCtxIMG.restore();
}

const handsIMG = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});
handsIMG.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
handsIMG.onResults(onHandResultsIMG);

const inputImage = document.getElementById('inputImage');

inputImage.addEventListener('change', function () {
  chooseFile(this);
});

function chooseFile(fileInput) {
  if (fileInput.files && fileInput.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      const image = new Image();
      image.src = e.target.result;
      onImageResults(image);
    }
    reader.readAsDataURL(fileInput.files[0]);
  }
}

function onImageResults(image) {
  canvasCtxIMG.save();
  clearCanvas();

  canvasCtxIMG.drawImage(image, 0, 0, canvasElementIMG.width, canvasElementIMG.height);
  handsIMG.send({ image });
  canvasCtxIMG.restore();
}

function deleteImage() {
  if (canvasElementIMG.style.display === "none") {
    canvasElementIMG.style.display = "block";
  } else {
    canvasElementIMG.style.display = "none";
  }
}
canvasElementIMG.style.display = "none";


//WEBCAM

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onHandResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    for (let handIndex = 0; handIndex < results.multiHandLandmarks.length; handIndex++) {
      const landmarks = results.multiHandLandmarks[handIndex];
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
        { color: '#00FF00', lineWidth: 5 });
      drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

      const fingerCount = countFingers(landmarks);
      canvasCtx.font = '28px Arial';
      canvasCtx.fillStyle = '#FF0000';

      if (landmarks[0].x > landmarks[9].x) {
        leftHandCount = fingerCount;
        canvasCtx.fillText(`Số Ngón Tay Trái: ${leftHandCount}`, 700, 50);
      } else {
        rightHandCount = fingerCount;
        canvasCtx.fillText(`Số Ngón Tay Phải: ${rightHandCount}`, 10, 50);
      }
    }
  }
  canvasCtx.restore();
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onHandResults);

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

videoElement.style.display = "none";
canvasElement.style.display = "none";

function toggle() {
  if (videoElement.style.display === "none" && canvasElement.style.display === "none") {
    videoElement.style.display = "block";
    canvasElement.style.display = "block";
  } else {
    videoElement.style.display = "none";
    canvasElement.style.display = "none";
  }
}
