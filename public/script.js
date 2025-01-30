function updateSystemTime() {
    const now = new Date();
    document.querySelector('.system-time').textContent = 
        `SYSTEM TIME: ${now.toISOString().replace('T', ' ').slice(0, -5)}`;
}

function updateBatteryDisplay(percentage, isInSleepMode) {
    console.log(`🔋 Battery Update: ${Math.round(percentage)}%`);
    const batteryFill = document.querySelector('.battery-fill');
    batteryFill.style.width = `${percentage}%`;
    
    // Get or create battery status message element
    let statusMsg = document.querySelector('.battery-status');
    if (!statusMsg) {
        statusMsg = document.createElement('div');
        statusMsg.className = 'battery-status';
        document.querySelector('.battery-level').after(statusMsg);
    }
    
    // Remove any existing critical class
    statusMsg.classList.remove('critical-msg');
    
    // Set battery percentage text first
    batteryFill.textContent = `${Math.round(percentage)}%`;
    
    // If in sleep mode, show charging message
    if (isInSleepMode) {
        batteryFill.style.backgroundColor = '#00ff9d';
        batteryFill.classList.remove('critical');
        statusMsg.textContent = 'CHARGING...';
        statusMsg.style.color = '#00ff9d';
        return;
    }
    
    // Update color and message based on battery level
    if (percentage > 70) {
        batteryFill.style.backgroundColor = '#00ff9d';
        batteryFill.classList.remove('critical');
        statusMsg.textContent = 'FULLY CHARGED!';
        statusMsg.style.color = '#00ff9d';
    } else if (percentage > 40) {
        batteryFill.style.backgroundColor = '#00ff9d';
        batteryFill.classList.remove('critical');
        statusMsg.textContent = 'GET READY TO CHARGE SOON';
        statusMsg.style.color = '#00ff9d';
    } else if (percentage > 20) {
        batteryFill.style.backgroundColor = '#ffa500';
        batteryFill.classList.remove('critical');
        statusMsg.textContent = 'CHARGE NEEDED';
        statusMsg.style.color = '#ffa500';
    } else if (percentage > 5) {
        batteryFill.style.backgroundColor = '#ff3e3e';
        batteryFill.classList.remove('critical');
        statusMsg.textContent = 'BATTERY ALMOST DEPLETED!';
        statusMsg.style.color = '#ff3e3e';
        statusMsg.classList.add('critical-msg');
    } else {
        batteryFill.style.backgroundColor = '#ff3e3e';
        batteryFill.classList.add('critical');
        statusMsg.textContent = 'BATTERY DEPLETED, CHARGE REQUIRED';
        statusMsg.style.color = '#ff3e3e';
        statusMsg.classList.add('critical-msg');
    }
}

function updateSensorList(sensors) {
    const sensorList = document.querySelector('.sensor-list');
    sensorList.innerHTML = sensors.map(sensor => 
        `<div class="sensor-item active">${sensor.toUpperCase()}</div>`
    ).join('');
}

function updateReadings(readings) {
    const readingsList = document.querySelector('.readings-list');
    readingsList.innerHTML = Object.entries(readings).map(([key, value]) => 
        `<div class="reading-item">
            <span class="reading-label">${key.toUpperCase()}:</span>
            <span class="reading-value">${value}</span>
        </div>`
    ).join('');
}

function updateResourceList(resources) {
    const resourceList = document.querySelector('.resource-list');
    resourceList.innerHTML = Object.entries(resources).map(([resource, amount]) => 
        `<div class="resource-item">
            <span class="resource-name">${resource.toUpperCase()}</span>
            <span class="resource-amount">${amount}</span>
        </div>`
    ).join('');
}

async function getStatus() {
    console.log('🔄 Fetching status update...');
    try {
        const response = await fetch('/status');
        const data = await response.json();
        console.log('📊 Status Data:', data);
        
        updateBatteryDisplay(data.batteryPercentage, data.isInSleepMode);
        updateSensorList(data.activeSensors);
        updateReadings(data.sensorReadings);
        updateResourceList(data.discoveredResources);
        updateSleepMode(data.isInSleepMode);
        
        // Just visual feedback
        document.querySelector('.refresh-btn').classList.add('success');
        setTimeout(() => {
            document.querySelector('.refresh-btn').classList.remove('success');
        }, 500);
    } catch (error) {
        console.error('❌ Status Update Failed:', error);
        alert('Failed to get status: ' + error.message);
    }
}

// Add movement history array
let movementHistory = [];

// Update submitAction to properly get selected values
async function submitAction(event) {
    event.preventDefault();
    
    const action = document.getElementById('action').value;
    const details = document.getElementById('details').value;
    
    // Add movement to history if it's a move action
    if (action === 'move') {
        const timestamp = new Date().toLocaleTimeString();
        movementHistory.unshift({ direction: details, time: timestamp });
        movementHistory = movementHistory.slice(0, 10);
        updateMovementHistory();
    }

    try {
        const formData = { action, details };
        const response = await fetch('/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            document.querySelector('.execute-btn').classList.add('success');
            setTimeout(() => {
                document.querySelector('.execute-btn').classList.remove('success');
            }, 500);
            getStatus();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${result.success ? 'success' : 'error'}`;
        notification.textContent = result.message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    } catch (error) {
        console.error('Failed to execute action:', error);
        alert('Failed to execute action: ' + error.message);
    }
}

// Add movement history display
function updateMovementHistory() {
    const historyDiv = document.querySelector('.movement-history');
    historyDiv.innerHTML = movementHistory.map(move => `
        <div class="history-item">
            <span class="time">${move.time}</span>
            <span class="direction">${move.direction.toUpperCase()}</span>
        </div>
    `).join('');
}

// Add CSS for movement history
const style = document.createElement('style');
style.textContent = `
    .movement-history {
        max-height: 200px;
        overflow-y: auto;
    }
    .history-item {
        display: flex;
        justify-content: space-between;
        padding: 5px;
        border-bottom: 1px solid rgba(0, 255, 157, 0.2);
    }
    .history-item .time {
        color: #00ccff;
    }
`;
document.head.appendChild(style);

function updateDetailsInput() {
    const action = document.getElementById('action').value;
    const detailsSelect = document.getElementById('details');
    
    // Store current selection if it exists
    const currentSelection = detailsSelect.value;
    
    // Clear current options
    detailsSelect.innerHTML = '';
    
    switch(action) {
        case 'move':
            ['FORWARD', 'BACKWARD', 'LEFT', 'RIGHT'].forEach(direction => {
                const option = document.createElement('option');
                option.value = direction.toLowerCase();
                option.textContent = direction;
                option.selected = direction.toLowerCase() === currentSelection;
                detailsSelect.appendChild(option);
            });
            break;
            
        case 'toggleSensor':
            ['TEMPERATURE', 'RADIATION', 'GRAVITY', 'OXYGEN', 'PRESSURE'].forEach(sensor => {
                const option = document.createElement('option');
                option.value = sensor.toLowerCase();
                option.textContent = sensor;
                option.selected = sensor.toLowerCase() === currentSelection;
                detailsSelect.appendChild(option);
            });
            break;
            
        case 'mine':
            ['SURFACE', 'DEEP', 'CAVE'].forEach(location => {
                const option = document.createElement('option');
                option.value = location.toLowerCase();
                option.textContent = location.toLowerCase();
                option.selected = location.toLowerCase() === currentSelection;
                detailsSelect.appendChild(option);
            });
            break;
            
        case 'sleep':
            const option = document.createElement('option');
            option.value = 'toggle';
            option.textContent = document.querySelector('.status-panel').classList.contains('sleep-mode') 
                ? 'EXIT SLEEP MODE' 
                : 'ENTER SLEEP MODE';
            detailsSelect.appendChild(option);
            break;
    }
}

function updateSleepMode(isInSleepMode) {
    console.log(`💤 Sleep Mode: ${isInSleepMode ? 'Enabled' : 'Disabled'}`);
    const statusPanel = document.querySelector('.status-panel');
    if (isInSleepMode) {
        statusPanel.classList.add('sleep-mode');
        document.querySelector('.system-time').classList.add('sleep-mode');
    } else {
        statusPanel.classList.remove('sleep-mode');
        document.querySelector('.system-time').classList.remove('sleep-mode');
    }
    updateDetailsInput(); // Update sleep mode button text
}

// Call this when page loads to set initial options
document.addEventListener('DOMContentLoaded', () => {
    updateDetailsInput();
    getStatus(); // Load initial status
});

// Update system time every second
setInterval(updateSystemTime, 1000);

// Only update battery status every second
setInterval(async () => {
    try {
        const response = await fetch('/status');
        const data = await response.json();
        console.log(`⚡ Battery Level: ${Math.round(data.batteryPercentage)}%${data.isInSleepMode ? ' (Charging)' : ''}`);
        updateBatteryDisplay(data.batteryPercentage, data.isInSleepMode);
        updateSleepMode(data.isInSleepMode);
    } catch (error) {
        console.error('❌ Battery Update Failed:', error);
    }
}, 1000);

// Initial status load
getStatus();
updateSystemTime(); 