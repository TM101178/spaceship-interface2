const express = require('express');
const path = require('path');
const SpaceSensors = require('spaceship-101178');  // Terug naar npm module
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add route for serving the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Add static file serving
app.use(express.static(path.join(__dirname, '../public')));

// Maak een instantie van de sensors class
const sensors = new SpaceSensors();

// Update vehicleStatus to track resource quantities
let vehicleStatus = {
  batteryPercentage: 85,
  activeSensors: sensors.getActiveSensors(),
  discoveredResources: {},  // Change to object to track quantities
  sensorReadings: sensors.getAllSensorReadings(),
  isInSleepMode: false
};

// Initialize discovered resources
sensors.discoverResources().forEach(resource => {
    vehicleStatus.discoveredResources[resource] = 1;
});

// Battery consumption rates
const BATTERY_COSTS = {
  move: 3,
  toggleSensor: 1,
  scan: 0.2,
  mine: {
    surface: 3,    // Easiest to mine
    deep: 5,       // Moderate difficulty
    cave: 8        // Hardest to mine
  }
};

// Update mining success rates based on location
const MINING_SUCCESS_RATE = {
  surface: 0.8,  // 80% success rate
  deep: 0.6,     // 60% success rate
  cave: 0.4      // 40% success rate but better resources
};

// Add auto-update interval (every 5 seconds)
setInterval(() => {
  if (vehicleStatus.isInSleepMode) {
    // Charge faster in sleep mode
    vehicleStatus.batteryPercentage += 1;
    vehicleStatus.batteryPercentage = Math.min(100, vehicleStatus.batteryPercentage);
  } else {
    // Drain very slowly when active
    vehicleStatus.batteryPercentage -= 0.05;
    vehicleStatus.batteryPercentage = Math.max(0, vehicleStatus.batteryPercentage);
  }
}, 5000);

// Make sure these routes are defined before the action routes
app.get('/status', (req, res) => {
    try {
        // Only update sensor readings if not in sleep mode
        if (!vehicleStatus.isInSleepMode) {
            const allReadings = sensors.getAllSensorReadings();
            vehicleStatus.sensorReadings = Object.fromEntries(
                Object.entries(allReadings)
                    .filter(([sensor]) => vehicleStatus.activeSensors.includes(sensor))
            );
            
            vehicleStatus.batteryPercentage -= BATTERY_COSTS.scan;
            vehicleStatus.batteryPercentage = Math.max(0, vehicleStatus.batteryPercentage);
        } else {
            vehicleStatus.batteryPercentage += 5;
            vehicleStatus.batteryPercentage = Math.min(100, vehicleStatus.batteryPercentage);
        }
        res.json(vehicleStatus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get vehicle status' });
    }
});

// POST /action - Voert een actie uit op het ruimtevoertuig
app.post('/action', (req, res) => {
  try {
    const { action, details } = req.body;
    let response = { success: true, message: '' };

    // Check if we have enough battery (except for sleep mode)
    if (action !== 'sleep' && vehicleStatus.batteryPercentage <= 0) {
      return res.json({
        success: false,
        message: 'CRITICAL: Insufficient battery power. Enter sleep mode to recharge.'
      });
    }

    // Check if in sleep mode (except for sleep action)
    if (action !== 'sleep' && vehicleStatus.isInSleepMode) {
      return res.json({
        success: false,
        message: 'Vehicle is in sleep mode. Exit sleep mode first.'
      });
    }

    switch(action) {
      case 'move':
        vehicleStatus.batteryPercentage -= BATTERY_COSTS.move;
        response.message = `Moving vehicle ${details}`;
        break;

      case 'toggleSensor':
        vehicleStatus.batteryPercentage -= BATTERY_COSTS.toggleSensor;
        if (vehicleStatus.activeSensors.includes(details)) {
          vehicleStatus.activeSensors = vehicleStatus.activeSensors.filter(s => s !== details);
          response.message = `Disabled sensor: ${details}`;
        } else {
          vehicleStatus.activeSensors.push(details);
          response.message = `Enabled sensor: ${details}`;
        }
        break;

      case 'sleep':
        if (vehicleStatus.isInSleepMode) {
          vehicleStatus.isInSleepMode = false;
          response.message = 'Exiting sleep mode';
        } else {
          vehicleStatus.isInSleepMode = true;
          response.message = 'Entering sleep mode';
        }
        break;

      case 'mine':
        const miningCost = BATTERY_COSTS.mine[details];
        const successRate = MINING_SUCCESS_RATE[details];
        
        if (Math.random() < successRate) {
            vehicleStatus.batteryPercentage -= miningCost;
            const newResources = sensors.discoverResources(1);
            
            // Update resource quantities
            newResources.forEach(resource => {
                vehicleStatus.discoveredResources[resource] = (vehicleStatus.discoveredResources[resource] || 0) + 1;
            });
            
            response.message = `Successfully mined ${details.toUpperCase()}: Found ${newResources[0]}`;
        } else {
            vehicleStatus.batteryPercentage -= miningCost / 2;
            response.success = false;
            response.message = `Mining attempt failed at ${details.toUpperCase()}: No resources found`;
        }
        break;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to perform action' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});