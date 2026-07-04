import os
import cv2
import tempfile
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("truthlens.video_processor")

class VideoProcessor:
    def __init__(self):
        # Initialize OpenCV Face Cascade Classifier
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        local_path = os.path.join(os.path.dirname(__file__), "..", "models", "haarcascade_frontalface_default.xml")
        
        if os.path.exists(cascade_path):
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            logger.info("Face Cascade Classifier loaded successfully from cv2 data.")
        elif os.path.exists(local_path):
            self.face_cascade = cv2.CascadeClassifier(local_path)
            logger.info(f"Face Cascade Classifier loaded successfully from local models path: {local_path}")
        else:
            logger.warning(f"Face Cascade file not found at {cascade_path} or {local_path}. Face detection might fail.")
            self.face_cascade = None

    def extract_frames(self, video_path: str, max_frames: int = 12) -> List[Dict[str, Any]]:
        """
        Extracts frames from the video, runs face detection, and collects frame metadata.
        """
        results = []
        if not os.path.exists(video_path):
            logger.error(f"Video file does not exist: {video_path}")
            return results

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Failed to open video file: {video_path}")
            return results

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0

        # Determine frame indices to extract uniformly
        interval = max(1, total_frames // max_frames)
        frame_indices = [i * interval for i in range(max_frames) if i * interval < total_frames]

        logger.info(f"Processing video: {video_path}. FPS: {fps:.2f}, Total Frames: {total_frames}, Duration: {duration:.2f}s")
        logger.info(f"Extracting frames at indices: {frame_indices}")

        for index in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, index)
            ret, frame = cap.read()
            if not ret or frame is None:
                continue

            timestamp = index / fps if fps > 0 else 0.0

            # Detect faces
            faces_detected = []
            if self.face_cascade is not None:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                # Resize gray for faster detection
                scale_percent = 50
                width = int(gray.shape[1] * scale_percent / 100)
                height = int(gray.shape[0] * scale_percent / 100)
                small_gray = cv2.resize(gray, (width, height), interpolation=cv2.INTER_AREA)

                faces = self.face_cascade.detectMultiScale(
                    small_gray,
                    scaleFactor=1.1,
                    minNeighbors=4,
                    minSize=(30, 30)
                )

                # Scale boxes back
                for (x, y, w, h) in faces:
                    x_full = int(x * (100 / scale_percent))
                    y_full = int(y * (100 / scale_percent))
                    w_full = int(w * (100 / scale_percent))
                    h_full = int(h * (100 / scale_percent))
                    faces_detected.append([x_full, y_full, w_full, h_full])

            # Calculate frame metrics (for fallback analysis)
            # Blur detection using Laplacian variance
            try:
                gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                blur_score = cv2.Laplacian(gray_frame, cv2.CV_64F).var()
            except Exception:
                blur_score = 0.0

            # Simple frame content hash or signature for temporal consistency
            color_std = [float(frame[:, :, i].std()) for i in range(3)]

            results.append({
                "frame_number": index,
                "timestamp": timestamp,
                "faces": faces_detected,
                "blur_score": blur_score,
                "color_std": color_std,
                "frame_image": frame  # Store temporarily in memory for deep inference
            })

        cap.release()
        return results
