import cv2
import numpy as np
import pyautogui
import pydirectinput
import time
import random
import os
import json
import threading
from datetime  import datetime
from PIL import Image
import keyboard

#defaul fallback
configuration = {
            'idleTime': 10,
            'screenRegion':{
                'topLeft':{
                    'x': 0,
                    'y': 0
                },
                'botRight':{
                    'x': 800,
                    'y': 600
                } 
            },
            'center': {
                'x': 625,
                'y':391, 
            },
            'target': {
                'x': 508,
                'y': 157, 
                'color': {
                    'r':134,
                    'g': 36,
                    'b': 26
                }
            }
        }

lock = threading.Lock()
    
class coord:
    def __init__(self,x,y,color= (0,0,0)) -> None: 
        self.x = x
        self.y = y
        self.color = color
    def toJSON(self):
        return {
            'x':self.x,
            'y':self.y,
            'color':self.color
        }
    @staticmethod
    def fromJSON(jobj):
        n = coord(jobj['x'],jobj['y'])
        if 'color' in jobj:
            n.color = jobj['color']
        return n

class region:
    def __init__(self) -> None: 
        self.topLeft = coord(0,0)
        self.botRight = coord(0,0)
    
    def toTuple(self):
        return self.topLeft.x , self.topLeft.y , (self.botRight.x - self.topLeft.x), (self.botRight.y - self.topLeft.y)
    def toJSON(self):
        return {
            'topLeft': self.topLeft.toJSON(),
            'botRight': self.botRight.toJSON() 
        }
    
    @staticmethod
    def fromJSON(jobj):
        n = region() 
        n.topLeft = coord.fromJSON(jobj['topLeft'])
        n.botRight = coord.fromJSON(jobj['botRight'])
        return n
        
         
#globals
mainFlag = True
mainProcessThread = None
curMouse = coord(0,0)
mouseCaptureThread = None
docaptrue = False 

shouldRotate = None
#configurables
image = None
idleTime = None
center =None
jitter_range = None
lastTargetFound = None 
target = coord(0,0) 
screenRegion = region() 
# 0, 0, 800, 600

def save_config(data):
    with open('config', 'w') as f:
        json.dump(data, f)

def load_config():
    if not os.path.exists('config'):
        return None
    with open('config', 'r') as f:
        return json.load(f)
    
def hasTarget():
    return pyautogui.pixelMatchesColor(target.x, target.y, target.color)

def check_image_exists(): 

    try:
        pyautogui.locateOnScreen(image,confidence=.95)
        # print('image found')
        return True
    except pyautogui.ImageNotFoundException: 
        # print("Image does not exist on the screen")
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
        if cv2.contourArea(contour) > 500:
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
                time.sleep(0.3) 
                if (not check_image_exists()):
    
                    pyautogui.mouseDown()
                    time.sleep(random.uniform(0.4, 0.6))  
                    pyautogui.mouseUp()
                    time.sleep(random.uniform(0.05, 0.02)) 
            break

    return motion_detected
def rotate(delta): 
    
    pydirectinput.moveTo(center.x, center.y,duration=random.uniform(0.5, 1.2))
    
    pyautogui.mouseDown(button='secondary') 

    # Calculate the random jitter
    pyautogui.keyDown('w')  
    pyautogui.keyUp('w')  
    curr = coord(center.x,center.y)  
    for i in range(50):
        if not hasTarget():
            jitter = random.randint(-jitter_range, jitter_range)
            curr.x += int((delta + jitter) / 100)
            curr.y += int(jitter / 100)
            pydirectinput.moveTo(curr.x,  curr.y) 
        time.sleep(0.01) 
    pyautogui.keyUp('w') 
    pyautogui.mouseUp(button='secondary')
    
def checkTargetFound():
    global mainFlag
    while mainFlag:
        time.sleep(5)
        cur = datetime.now()
        global lastTargetFound, shouldRotate 
        with lock:
            if (cur - lastTargetFound).total_seconds() > idleTime : 
                shouldRotate = True
            
def attackTarget():
    global mainFlag
    while mainFlag:
        time.sleep(1) 
        if hasTarget():
            global lastTargetFound
            with lock:
                lastTargetFound =  datetime.now()
            pyautogui.keyDown('1') 
            time.sleep(random.uniform(0.4, 1))  
            pyautogui.keyUp('1') 
         

def alwaysTab():
    global mainFlag
    while mainFlag:
        time.sleep(1)
        if not hasTarget():
            pyautogui.keyDown('tab') 
            time.sleep(random.uniform(0.3, 0.8))  
            pyautogui.keyUp('tab') 
            


def config():
    #item image 
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(script_dir, 'img.png')
    global image, idleTime, center ,jitter_range, lastTargetFound, shouldRotate, target, screenRegion, configuration
    configuration = load_config()
    with lock:

        image = Image.open(image_path)
        idleTime = configuration['idleTime']
        screenRegion = region.fromJSON(configuration['screenRegion'])

        # center = coord(625,391) 
        target = coord.fromJSON(configuration['target'])
        center = coord.fromJSON(configuration['center'])
        jitter_range = 50  # Adjust as needed

        lastTargetFound =  datetime.now() 
        shouldRotate = False
 
def findTarget(): 
    foundCd =  threading.Thread(target=checkTargetFound)
    attack = threading.Thread(target=attackTarget) 
    tabbing = threading.Thread(target=alwaysTab) 
    
    foundCd.start()
    attack.start()
    tabbing.start()
    
    global mainFlag, screenRegion
    prev_screen = pyautogui.screenshot(region=screenRegion.toTuple())  # Capture initial screen
    while mainFlag: 
        
        if not hasTarget():
            # Capture current screen
            curr_screen = pyautogui.screenshot(region=screenRegion.toTuple())

            # Convert screenshots to numpy arrays
            prev_screen_np = np.array(prev_screen)
            curr_screen_np = np.array(curr_screen)

            # Check for motion between consecutive screenshots
            detect_motion_using_frame_differencing(prev_screen_np, curr_screen_np) 

            # Update previous screen
            prev_screen = curr_screen

            # Delay between screenshots (adjust as needed)
            # Note: Lower delay can improve motion detection responsiveness but may consume more resources
            cv2.waitKey(1000)
            global shouldRotate, lastTargetFound
            if shouldRotate:
                rotate(100)
                shouldRotate = False
                lastTargetFound = datetime.now()
    foundCd.join()
    attack.join()
    tabbing.join()
 
    # print("\033[H\033[xJ", end="")
def trackMouse():
    while docaptrue:
        global curMouse
        x , y= pyautogui.position()
        color = pyautogui.pixel(x,y)
        curMouse.x = x
        curMouse.y = y
        curMouse.color = color 
        os.system('cls')
        print("Capturing, press ESCAPE to Finish")
        print("RGB values of pixel at ({}, {}):".format(curMouse.x, curMouse.y), curMouse.color)
        
def captureMouse(): 
    global mouseCaptureThread, curMouse,docaptrue
    docaptrue = True
    curMouse = coord(0,0)
    mouseCaptureThread = threading.Thread(target=trackMouse)
    mouseCaptureThread.start()
    keyboard.add_hotkey('esc', doneCaptureMouse)
    
def doneCaptureMouse():
    global mouseCaptureThread,docaptrue
    docaptrue = False
    mouseCaptureThread.join()  
    os.system('cls')
    print("Mouse Captured: RGB values of pixel at ({}, {}):".format(curMouse.x, curMouse.y), curMouse.color)
    
def startProcesses():  
    print('running Press Escape to stop')
    global mainFlag, mainProcessThread
    mainFlag = True
    mainProcessThread = threading.Thread(target=findTarget)
    mainProcessThread.start()
    keyboard.add_hotkey('esc', stopMainProcess)
    
def stopMainProcess():
    print('stoping')
    global mainFlag, mainProcessThread
    with lock:
        mainFlag = False
    mainProcessThread.join()
    print('stop')
    menu()
def awaitMoustCapture():
    time.sleep(0.1)
    global docaptrue
    while docaptrue:
        ''
        
def configScreen():
    keepgo = True
    while keepgo:
        os.system('cls')
        print("Config")
        global idleTime, screenRegion, target, center
        print(f"1. Idletime\t: {idleTime}")
        print(f"2. Region\t: Top-Left  \t ({screenRegion.topLeft.x},{screenRegion.topLeft.y})")
        print(f"         \t  Bot-Right \t ({screenRegion.botRight.x},{screenRegion.botRight.y})")
        print(f"3. Target\t: ({target.x},{target.y}):{target.color}")
        print(f"4. Center\t: ({center.x},{center.y})")
        print(f"5. Save")
        print("0. back")
        choice = input("Select option: ")
        if choice == '2':
            input("Capture Top Left Press any key to start")
            captureMouse() 
            awaitMoustCapture()
            with lock:
                screenRegion.topLeft = curMouse 
            input("Capture Bot Right Press any key to start")
            captureMouse() 
            awaitMoustCapture()
            with lock:
                screenRegion.botRight = curMouse 
            input("Press any key to continue")
            
        if choice == '3':
            captureMouse() 
            awaitMoustCapture()
            with lock:
                target = curMouse 
            input("Press any key to continue")
            
        if choice == '4':
            captureMouse() 
            awaitMoustCapture()
            with lock:
                center = curMouse  
            input("Press any key to continue")
            
        if choice == '5':
            with lock:
                save_config({
                    'idleTime': idleTime,
                    'screenRegion':screenRegion.toJSON(),
                    'center': center.toJSON(),
                    'target': target.toJSON()
                })
                
        if  choice == '0':
            print('exit')
            keepgo = False

def awaitMainCancel():
    time.sleep(1)
    global docaptrue
    while docaptrue:
        ''
    

def menu():
    keepgo = True
    config()
    while keepgo: 
        os.system('cls')
        print("FUKUROBO")
        print("1. start")
        print("2. config")
        print("0. exit")
        
        choice = input("Select option: ")
        
        if choice == '1':
            startProcesses() 
            awaitMainCancel()
            input("Stopped")
        if  choice == '2':
            configScreen()
        if  choice == '0':
            print('exit')
            keepgo = False
    
menu()
# rotate(100,0)
# main()