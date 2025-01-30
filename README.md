# Space Vehicle Control Interface

A futuristic web-based control interface for a space vehicle simulation. Built with Node.js and Express, featuring real-time monitoring and interactive controls.

## Features

### Vehicle Status Monitoring
- Real-time battery level tracking with status indicators
- Dynamic battery charging in sleep mode
- Visual alerts for critical battery levels
- Custom status messages based on battery percentage

### Sensor Systems
- Multiple sensor types (Temperature, Radiation, Gravity, Oxygen, Pressure)
- Toggle individual sensors on/off
- Real-time sensor readings
- Battery consumption for active sensors

### Resource Management
- Mining operations at different depths (Surface, Deep, Cave)
- Variable success rates based on mining location
- Resource collection with visual feedback
- Resource quantity tracking

### Movement System
- Directional controls (Forward, Backward, Left, Right)
- Movement history logging with timestamps
- Battery consumption for movement operations

### Power Management
- Sleep mode for battery conservation
- Increased charging rate during sleep
- Automatic battery drain during active operations
- Critical power warnings

## Technical Implementation

### Backend (Node.js/Express)
- RESTful API endpoints for vehicle control
- Custom NPM module (spaceship-101178) for sensor simulation
- Real-time status updates
- Resource discovery system

### Frontend
- Clean, futuristic UI design
- Real-time updates without page refresh
- Interactive command interface
- Visual feedback for all operations
- Responsive design for different screen sizes

### Custom NPM Module (spaceship-101178)
- Sensor data simulation
- Resource discovery algorithms
- Active sensor management
- Realistic value ranges for readings

## Installation

```bash
git clone https://github.com/TM101178/spaceship-interface2.git
npm install
npm install express
npm install spaceship-101178
npm start
```

## Usage

1. Start the server
2. Access the control interface at http://localhost:3000
3. Use the command interface to:
   - Move the vehicle
   - Toggle sensors
   - Mine resources
   - Manage power systems

## Dependencies
- Node.js
- Express
- spaceship-101178 (custom module)

## Development
Built with:
- HTML5/CSS3 for interface
- Vanilla JavaScript for frontend logic
- Node.js/Express for backend
- Custom animations and transitions
- Modular code structure

## Future Enhancements
- Additional sensor types
- More mining locations
- Enhanced resource management
- Advanced power systems
- Mission system implementation

