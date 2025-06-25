# Helm Dashboard

A web-based dashboard for monitoring and managing Kubernetes Helm deployments. This tool provides a user-friendly interface for handling Helm charts, releases, and deployments across different Kubernetes clusters.

## Features

- Visual Helm chart management
- Release status monitoring
- Deployment history tracking
- Chart repository integration
- Multi-cluster support
- Real-time status updates
- Rollback capabilities
- Value overrides management

## Installation

```bash
# Clone the repository
git clone https://github.com/joefabre/helm-dashboard.git

# Install dependencies
npm install

# Configure your Kubernetes context
kubectl config use-context your-context
```

## Usage

1. Start the dashboard:
```bash
npm start
```

2. Access the web interface at `http://localhost:3000`

## Requirements

- Node.js 14+
- Kubernetes cluster
- Helm 3.x
- kubectl configured with cluster access

## Configuration

Edit `config.yaml` to set:
- Chart repositories
- Cluster access
- Default namespaces
- Refresh intervals
