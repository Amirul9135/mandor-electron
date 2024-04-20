import cv2
import numpy as np
import pyautogui
import pydirectinput
import time
import random
import os
 
    # Get the directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Construct the full path to the image using the script directory
image_path = os.path.join(script_dir, 'img.png')
print(image_path)
def check_image_exists(image_path):
    # Capture the screen
    screen = pyautogui.screenshot()

    # Find the location of the image on the screen
    
    try:
        location = pyautogui.locateOnScreen(image_path,confidence=.95)
        print('image found')
        return True
    except pyautogui.ImageNotFoundException: 
        print("Image does not exist on the screen")
        return False
          
# Function to detect motion using frame differencing
def detect_motion_using_frame_differencing(prev_screen, curr_screen, threshold=30):
    # Convert screenshots to grayscale
    prev_gray = cv2.cvtColor(prev_screen, cv2.COLOR_BGR2GRAY)
    curr_gray = cv2.cvtColor(curr_screen, cv2.COLOR_BGR2GRAY)

    # Compute absolute difference between the current screen and the previous screen
    screen_diff = cv2.absdiff(prev_gray, curr_gray)

    # Apply a threshold to the difference image
    _, thresh = cv2.threshold(screen_diff, threshold, 255, cv2.THRESH_BINARY)

    # Find contours in the thresholded image
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Iterate through contours and check for motion
    motion_detected = False
    for contour in contours:
        # If the contour area is greater than a threshold, motion is detected
        if cv2.contourArea(contour) > 1000:
            motion_detected = True
            # Get centroid of the contour
            M = cv2.moments(contour)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                # Move mouse to centroid
                # pydirectinput.moveTo(cx, cy)
                # time.sleep(0.5)
                pydirectinput.moveTo(cx, cy,duration=random.uniform(0.5, 1.2)) 
                time.sleep(0.01) 
                if (not check_image_exists(image_path)):
    
                    pyautogui.mouseDown()
                    time.sleep(0.5) 
                    pyautogui.mouseUp()
                    time.sleep(random.uniform(0.05, 0.02))
                    pydirectinput.press('1') 
            break

    return motion_detected

# Main loop
prev_screen = pyautogui.screenshot(region=(0, 0, 800, 600))  # Capture initial screen
while True: 
    # Capture current screen
    curr_screen = pyautogui.screenshot(region=(0, 0, 800, 600))

    # Convert screenshots to numpy arrays
    prev_screen_np = np.array(prev_screen)
    curr_screen_np = np.array(curr_screen)

    # Check for motion between consecutive screenshots
    motion_detected = detect_motion_using_frame_differencing(prev_screen_np, curr_screen_np)
    if motion_detected:
        print("Motion Detected!")

    # Update previous screen
    prev_screen = curr_screen

    # Delay between screenshots (adjust as needed)
    # Note: Lower delay can improve motion detection responsiveness but may consume more resources
    cv2.waitKey(1000)
