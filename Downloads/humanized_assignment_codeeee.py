
# Assignment 1 - Introduction to Media Informatics
# Authors: [Your Names Here]
# German International University, Spring 2025

import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from scipy.ndimage import uniform_filter

# -------------------------------
# Phase 1: Load and Reveal the Image
# -------------------------------

# Load the grayscale image from CSV
image = np.genfromtxt("secret_image.csv", delimiter=",")

# Show the basic grayscale image
plt.imshow(image, cmap='gray')
plt.title("Grayscale Image")
plt.axis('off')
plt.savefig("grayscale_image.png")
plt.show()

# Try different colormaps to make patterns more visible
colormaps = ['hot', 'cool', 'viridis']
for cmap in colormaps:
    plt.imshow(image, cmap=cmap)
    plt.title(f"Colormap: {cmap}")  # Just cycling through options
    plt.axis('off')
    plt.savefig(f"colormap_{cmap}.png")
    plt.show()

# -------------------------------
# Phase 2: Pattern Detection and Analysis
# -------------------------------

# Find all black pixels (value = 0)
black_pixel_coords = np.argwhere(image == 0)
black_pixel_count = black_pixel_coords.shape[0]

# Bounding box: find min and max x/y values
min_y, min_x = black_pixel_coords.min(axis=0)
max_y, max_x = black_pixel_coords.max(axis=0)

# Quick sanity check (debug line - optional)
# print(black_pixel_coords[:10])  # Just peek at the first few

print(f"Black pixel count: {black_pixel_count}")
print(f"Bounding box: x=[{min_x}, {max_x}], y=[{min_y}, {max_y}]")

# Save the coordinates (if we ever want to inspect them manually)
np.savetxt("black_pixel_coords.txt", black_pixel_coords, fmt="%d", header="y x")

# -------------------------------
# Phase 3: Modify the Image
# -------------------------------

# Convert grayscale to RGB so we can add color
height, width = image.shape
rgb_image = np.stack([image]*3, axis=-1).astype(np.uint8)

black_pixel_coords = np.argwhere(image == 0)


# Mark what looks like eyes
for y, x in black_pixel_coords:
    if (int(height * 0.3) < y < int(height * 0.45)) and \
       (int(width * 0.2) < x < int(width * 0.4) or int(width * 0.6) < x < int(width * 0.8)):
        rgb_image[y, x] = [255, 0, 0]   # red
#flipping the mouth to make a sad face
#assuming that the mouth is in the bottom of 20% of the image
mouth_top = int(height * 0.75)
mouth_bottom = height

#we filter only the black pixels in the region
mouth_pixels = [(y, x) for y, x in black_pixel_coords if mouth_top <= y < mouth_bottom]
#creating a copy of the mouth area
mouth_region = rgb_image[mouth_top:mouth_bottom, :, :]
# flipping vertically
flipped_mouth = np.flipud(mouth_region)

#replacing the mouth region in the original image
rgb_image[mouth_top:mouth_bottom, :, :] = flipped_mouth

# Add a nice blue border to make it pop
rgb_image[0, :] = [0, 0, 255] # top
rgb_image[-1, :] = [0, 0, 255] #bottom
rgb_image[:, 0] = [0, 0, 255]  #left
rgb_image[:, -1] = [0, 0, 255] #right

# Flip the bottom part (mouth) to make the face sad :(
# Originally tried 0.6, but 0.7 worked better visually
#mouth_start = int(height * 0.7)
#mouth_region = rgb_image[mouth_start:, :, :]
#rgb_image[mouth_start:, :, :] = np.flipud(mouth_region)

# Save the final modified image
Image.fromarray(rgb_image).save("modified_image.png")
plt.imshow(rgb_image)
plt.title("Modified Image")
plt.axis('off')
plt.show()

# -------------------------------
# Phase 4: Noise Reduction
# -------------------------------

# Apply a simple mean filter to reduce background graininess
denoised = uniform_filter(rgb_image, size=(3, 3, 1))

# Save both versions
Image.fromarray(rgb_image).save("noisy_image.png")
Image.fromarray(denoised.astype(np.uint8)).save("denoised_image.png")

# Compare noisy vs. denoised side by side
fig, axs = plt.subplots(1, 2, figsize=(12, 6))
axs[0].imshow(rgb_image)
axs[0].set_title("Before Denoising")
axs[0].axis("off")
axs[1].imshow(denoised.astype(np.uint8))
axs[1].set_title("After Denoising")
axs[1].axis("off")
plt.savefig("comparison_denoising.png")
plt.show()

# -------------------------------
# Phase 5: Answering the Questions
# -------------------------------

# Wrap up everything nicely in a text file
with open("answers.txt", "w") as f:
    f.write("1. How many black pixels were found?\n")
    f.write(f"Answer: {black_pixel_count}\n\n")
    
    f.write("2. What are the coordinates of the black pixels?\n")
    f.write("Answer: Saved in black_pixel_coords.txt\n\n")
    
    f.write("3. What is the bounding box?\n")
    f.write(f"Answer: x=[{min_x}, {max_x}], y=[{min_y}, {max_y}]\n\n")
    
    f.write("4. What features did you detect in the image?\n")
    f.write("Answer: The image seems to show a face. Two dark areas are like eyes, and a shape below looks like a mouth. "
            "There's a good amount of symmetry too, so it feels like a cartoon-style face.\n")
