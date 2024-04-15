const { spawn } = require('child_process');

// Spawn the Python process
const pythonProcess = spawn('C:\\Users\\nitor\\AppData\\Local\\Programs\\Python\\Python312\\python.exe', ['python_ping_pong.py']);

// Listen for data from the Python process
pythonProcess.stdout.on('data', (data) => {
  console.log(`Received from Python: ${data.toString().trim()}`);
  
  // Send message back to Python
  setTimeout(() => {
    pythonProcess.stdin.write('pong\n');
  }, 1000);
});

// Listen for errors from the Python process
pythonProcess.stderr.on('data', (data) => {
  console.error(`Error from Python: ${data}`);
});

// Listen for the Python process to exit
pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});

pythonProcess.stdin.write('pong\n');