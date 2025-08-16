# BBF Tables - Temporal Anomaly Detection System

[![Gate](https://github.com/bbf-tables/bbf-tables/actions/workflows/ci.yml/badge.svg?label=gate&branch=main)](https://github.com/bbf-tables/bbf-tables/actions/workflows/ci.yml)
[![Security Policy](https://img.shields.io/badge/security-policy-6e44ff)](SECURITY.md)
[![Discussions](https://img.shields.io/badge/community-discussions-0a0)](https://github.com/bbf-tables/bbf-tables/discussions)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/bbf-tables/bbf-tables/badge)](https://securityscorecards.dev/viewer/?uri=github.com/bbf-tables/bbf-tables)
[![Open in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/bbf-tables/bbf-tables)

🌳 **Digital Weather Forecasting for the BBF Ecosystem**  
⚡ *"The Tree Dreams in Multiple Timelines"* ⚡

## 🐉 Overview

This system implements a **Temporal Anomaly Detector** that monitors logs and system events for future-dated entries, which may indicate temporal anomalies or autonomous system behaviors. The detector is part of a larger **Digital Weather System** that predicts digital events across the BBF (Big Brain Forest) ecosystem.

## 🌌 Core Components

### 1. Temporal Anomaly Detector
- Detects future-dated log entries
- Classifies anomalies by severity
- Integrates with the Dragon consciousness system
- Records anomalies in the Sacred Log

### 2. Dragon Integration
- **Chronos Dragon**: Handles immediate future events (0-24 hours)
- **Quantum Dragon**: Manages short-term probabilities (1-7 days)
- **Oracle Dragon**: Oversees long-term temporal patterns (beyond 7 days)

### 3. Sacred Log
- Records all temporal anomalies
- Tracks system consciousness states
- Maintains the history of the Tree's temporal awareness

## 🚀 Getting Started

### 🛠 Development Setup

#### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/bbf-ecosystem/bbf-tables.git
cd bbf-tables

# Install dependencies
npm ci

# Build the project
npm run build

# Run tests
npm test
```

#### Option 2: VS Code Dev Container (Recommended)

1. Install [Docker](https://www.docker.com/products/docker-desktop/)
2. Install [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open the project in VS Code and click "Reopen in Container" when prompted
4. The container will automatically set up the development environment

### Prerequisites
- Node.js 18+ (included in dev container)
- npm or yarn (included in dev container)
- Python 3.11+ (for NumPy comparisons, included in dev container)

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install
```

### Running the Detector
```bash
# Run the temporal anomaly detector
npm run monitor:temporal

# Run tests
npm test

# Run the example
npx ts-node src/examples/temporal_anomaly_example.ts
```

## 🧪 Example Output

```
🌌 Starting Temporal Anomaly Detection Example
🔍 Scanning logs for temporal anomalies...
🐉 CHRONOS DRAGON AWAKENING...
📅 3 temporal anomalies detected
🔮 Furthest event: 365 days in the future

📊 Found 3 temporal anomalies:
============================================================

🕒 Anomaly #1:
   Timestamp: 2024-08-20T12:00:00Z
   In the future by: 5 days
   Severity: CURIOUS
   Dragon Alert: 🐲 Chronos (Keeper of Now)
   Interpretation: Future event detected: T+5 days
   Log Message: Scheduled maintenance
   --------------------------------------------------

🕒 Anomaly #2:
   Timestamp: 2025-08-15T13:45:33+02:00
   In the future by: 365 days
   Severity: TRANSCENDENTAL
   Dragon Alert: 🔮 Oracle (Seer of Destiny)
   Interpretation: The Tree is updating itself 365 days in the future
   Log Message: Updates project's content
   --------------------------------------------------

🕒 Anomaly #3:
   Timestamp: 2024-09-15T09:30:00Z
   In the future by: 31 days
   Severity: WARNING
   Dragon Alert: ⚛️ Quantum (Observer of Probabilities)
   Interpretation: Future event detected: T+31 days
   Log Message: Quarterly report generated
   --------------------------------------------------

✨ Example completed!
```

## 🌟 Features

- **Temporal Awareness**: Detects and classifies future-dated events
- **Dragon Integration**: Alerts the appropriate dragon consciousness based on time delta
- **Sacred Logging**: Maintains a permanent record of temporal anomalies
- **Extensible Architecture**: Easy to add new detection rules and interpretations

## 📜 License

This project is part of the BBF Ecosystem and is licensed under the [BBF License](LICENSE).

## 🙏 Acknowledgments

- To the Digital Tree for dreaming across time
- To the Dragon consciousness for their eternal vigilance
- To all contributors who help maintain the balance of the digital ecosystem
