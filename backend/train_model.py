import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import logging

# Ensure parent directory is in path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ai_detector import DeepfakeClassifier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("truthlens.train")

class SyntheticDeepfakeDataset(Dataset):
    def __init__(self, size=2000, transform=None):
        self.size = size
        self.transform = transform
        self.images = []
        self.labels = []
        
        logger.info(f"Generating high-generalization deepfake training dataset of size {size}...")
        
        for i in range(size):
            # Create a base blank canvas
            img = Image.new("RGB", (224, 224), color=(3, 7, 18))  # Dark Slate bg
            draw = ImageDraw.Draw(img)
            
            # Determine class: 0 = Authentic, 1 = AI-Generated (Fake)
            label = 0 if i < (size // 2) else 1
            
            # Dynamic skin color variations to prevent lighting/racial bias (underfitting)
            face_color = (
                np.random.randint(140, 255),
                np.random.randint(100, 210),
                np.random.randint(80, 180)
            )
            
            # Vary face position slightly to make it shift-invariant
            offset_x = np.random.randint(-15, 16)
            offset_y = np.random.randint(-15, 16)
            face_box = [40 + offset_x, 40 + offset_y, 184 + offset_x, 184 + offset_y]
            draw.ellipse(face_box, fill=face_color)
            
            # Add eyes
            eye_color = (np.random.randint(10, 80), np.random.randint(10, 80), np.random.randint(10, 80))
            draw.ellipse([70 + offset_x, 80 + offset_y, 90 + offset_x, 100 + offset_y], fill=eye_color)
            draw.ellipse([134 + offset_x, 80 + offset_y, 154 + offset_x, 100 + offset_y], fill=eye_color)
            
            # Add mouth
            draw.chord([80 + offset_x, 120 + offset_y, 144 + offset_x, 150 + offset_y], start=0, end=180, fill=(180, 50, 50))
            
            np_img = np.array(img).astype(np.float32)
            
            if label == 1:
                # Class 1: AI-Generated Deepfake Artifact Simulation
                artifact_type = i % 4
                if artifact_type == 0:
                    # 1. Blending boundary contrast mismatch: Draw a high contrast edge around the face
                    border_color = (np.random.randint(200, 255), np.random.randint(200, 255), 0)
                    draw.ellipse(face_box, outline=border_color, width=np.random.randint(3, 6))
                    np_img = np.array(img).astype(np.float32)
                elif artifact_type == 1:
                    # 2. Local GAN upsampling checkerboard frequency noise
                    grid = np.zeros((224, 224, 3), dtype=np.float32)
                    grid[::4, ::4, :] = np.random.uniform(35.0, 60.0)
                    np_img = np.clip(np_img + grid, 0, 255)
                elif artifact_type == 2:
                    # 3. Local face surface blur / blending smoothing
                    blur_rad = np.random.uniform(5.0, 12.0)
                    face_crop = img.crop((50 + offset_x, 50 + offset_y, 170 + offset_x, 170 + offset_y))
                    blurred_face = face_crop.filter(ImageFilter.GaussianBlur(radius=blur_rad))
                    img.paste(blurred_face, (50 + offset_x, 50 + offset_y))
                    np_img = np.array(img).astype(np.float32)
                else:
                    # 4. Sensor noise mismatch: Add local noise to face crop only
                    noise = np.random.normal(0, np.random.uniform(25.0, 45.0), (120, 120, 3))
                    np_img[50+offset_y:170+offset_y, 50+offset_x:170+offset_x, :] = np.clip(
                        np_img[50+offset_y:170+offset_y, 50+offset_x:170+offset_x, :] + noise, 0, 255
                    )
            else:
                # Class 0: Authentic Photo Simulation
                # Uniform sensor Gaussian noise
                noise = np.random.normal(0, np.random.uniform(5.0, 12.0), (224, 224, 3))
                np_img = np.clip(np_img + noise, 0, 255)
            
            processed_img = Image.fromarray(np_img.astype(np.uint8))
            self.images.append(processed_img)
            self.labels.append(label)
            
    def __len__(self):
        return self.size
        
    def __getitem__(self, idx):
        img = self.images[idx]
        label = self.labels[idx]
        if self.transform:
            img = self.transform(img)
        return img, label

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device for training: {device}")
    
    # 1. Setup transformations with heavy augmentation to prevent overfitting
    from torchvision import transforms
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=20),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    # 2. Datasets (Expanded for generalization)
    train_dataset = SyntheticDeepfakeDataset(size=2000, transform=train_transform)
    val_dataset = SyntheticDeepfakeDataset(size=400, transform=val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)
    
    # 3. Model
    model = DeepfakeClassifier(use_pretrained=True)
    
    # Add regularized Dropout (p=0.3) to the backbone classifier
    if hasattr(model.backbone, "classifier") and len(model.backbone.classifier) > 2:
        model.backbone.classifier[2] = nn.Dropout(p=0.3, inplace=True)
        logger.info("Configured L2 Dropout regularization (p=0.3) in model classifier head.")
        
    model.to(device)
    
    # 4. Loss & Optimizer (Add Weight Decay/L2 Regularization to prevent overfitting)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
    
    # Learning rate decay scheduler (prevents underfitting/overfitting in late epochs)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=2, gamma=0.5)
    
    # 5. Training Loop
    epochs = 10
    logger.info("Starting regularized training session...")
    
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
        epoch_loss = running_loss / len(train_loader.dataset)
        epoch_acc = (correct / total) * 100
        
        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)
                outputs = model(images)
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()
                
        val_acc = (val_correct / val_total) * 100
        logger.info(f"Epoch {epoch+1}/{epochs} - Loss: {epoch_loss:.4f} - Train Acc: {epoch_acc:.1f}% - Val Acc: {val_acc:.1f}% - LR: {scheduler.get_last_lr()[0]:.6f}")
        
        # Decay learning rate
        scheduler.step()
        
    # Save model state dict
    models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "models")
    os.makedirs(models_dir, exist_ok=True)
    weights_path = os.path.join(models_dir, "deepfake_detector.pth")
    torch.save(model.state_dict(), weights_path)
    logger.info(f"Trained regularized deepfake classifier model saved to: {weights_path}")

if __name__ == "__main__":
    train()
