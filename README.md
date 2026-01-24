# SocialCollateral AI - Frontend Dashboard

Frontend interface for **Jaringan Amanah** (The Amanah Network), a Social Graph Engine built for the Amartha ecosystem. Provides interactive visualization and analysis tools for network-based risk assessment.

## Repository Structure

This repository maintains three distinct branches representing different stages of the project lifecycle:

### Branch Overview

|                 | **`develop`**                                                                                                                                                                                          | **`main`**                                                                                                                                                      | **`mvp-hackathon`**                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description** | Production-Ready PoC Version                                                                                                                                                                           | Pre-Competition Preparation                                                                                                                                     | Competition Demo Version                                                                                                                                                                                                     |
| **Scope**       | • Cleaned and refactored codebase<br><br>• Professional code structure for PoC<br><br>• Optimized component architecture<br><br>• Comprehensive documentation<br><br>• Production deployment on Vercel | • Initial preparation version (days before hackathon)<br><br>• Basic feature implementation<br><br>• Early integration with backend<br><br>• Foundational setup | • Live competition demo version<br><br>• 24-hour hackathon build<br><br>• Full feature implementation under time pressure<br><br>• Direct integration with Amartha data<br><br>• Known technical debt from rapid development |

> **Development Context**: This branch represents the refined version developed post-hackathon, incorporating best practices, code cleanup, and architectural improvements. All rushed implementations from the competition have been refactored for maintainability and professional presentation.

> **Why not use `mvp-hackathon` as default?**  
> The competition version was built under extreme time constraints (24 hours) and contains technical debt that needed addressing. This branch structure preserves the complete evolution from concept to polished implementation, serving as comprehensive technical documentation.

### Branch Selection Guide

- **For PoC reference**: `develop` (current branch)
- **For preparation study**: `main`
- **For competition implementation**: `mvp-hackathon`

## Application Demo

**Live Demo**: [https://app.social-collateral.id/](https://app.social-collateral.id/)

This is the production deployment of the refined PoC version, showcasing the complete Social Graph Engine with interactive visualization and multi-perspective risk analysis.

<!-- ## Technology Stack

- **Framework**: React 18 (Vite build tool)
- **Graph Visualization**: Sigma.js (WebGL-powered for high performance)
- **Language**: TypeScript
- **Styling**: Modern CSS with custom design system
- **Deployment**: Vercel (Production), Docker support available
- **State Management**: React Hooks + Context API

### Why These Technologies?

| Technology       | Justification                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **React + Vite** | Fast development experience with HMR, optimal production builds, and modern tooling                                             |
| **Sigma.js**     | Industry-standard graph visualization library capable of rendering tens of thousands of nodes smoothly using WebGL acceleration |
| **TypeScript**   | Type safety and improved developer experience, essential for maintaining complex state management in graph interactions         |
| **Vercel**       | Zero-config deployment with automatic HTTPS, global CDN, and seamless CI/CD integration                                         |

## Key Features -->

### 1. **Interactive Social Graph Visualization**

- Real-time network rendering with Sigma.js
- Intuitive zoom, pan, and node selection
- Visual clustering based on geographic and social proximity
- Color-coded nodes representing risk levels

### 2. **Multi-Perspective Analysis Dashboard**

When clicking a group node, the system displays comprehensive analysis through "Three AI Lenses":

- **Graph Analytics**: Network centrality, clustering coefficient, community detection
- **NLP Insights**: Sentiment analysis from field agent reports powered by Gemini AI
- **Computer Vision**: Asset assessment from business/home photos via Google Vision API

### 3. **Dynamic Filtering**

Filter the network visualization by:

- **Kabupaten** (District)
- **Desa** (Village)
- **Group** (Lending circles)

### 4. **Trust Score Calculation**

Algorithmic combination of:

- Social graph structure analysis
- Behavioral sentiment patterns
- Economic asset indicators

<!--
## Local Development

### Prerequisites

- Node.js >= 18.x
- npm or yarn

### Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/SocialCollateralAI/socialcollateral-web.git
   cd socialcollateral-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Access application**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```
-->

<!--
## Project Structure

```
src/
├── api/                 # Backend API integration services
├── components/          # React components
│   ├── NetworkGraph/   # Main graph visualization
│   │   ├── NodeModal/  # Detail popup component
│   │   └── Sidebar/    # Filter controls
│   └── Header/         # Application header
├── utils/              # Utility functions
├── data/               # Static data files
└── main.tsx            # Application entry point
```
-->

<!--
## Backend Integration

This frontend consumes RESTful APIs from the FastAPI backend:

- Graph data retrieval for network visualization
- Group detail analytics (combines Graph, NLP, and CV metrics)
- Dynamic filtering based on geographic hierarchy

**API Base URL**: `https://api.socialcollateral.id/api/v1`

For backend documentation, see: [socialcollateral-ai repository](https://github.com/SocialCollateralAI/socialcollateral-ai)
-->

<!--
## Deployment

### Vercel Setup

This repository is configured for Vercel deployment with automatic deployments from the `develop` branch.

**Custom Domain**: `socialcollateral.id`

**Deployment Steps**:
1. Import repository to Vercel dashboard
2. Configure build settings (auto-detected for Vite)
3. Add environment variables if needed
4. Deploy and configure custom domain

**Environment**: Production deployments auto-trigger from `develop` branch pushes.
-->

<!--
## Project Context

This frontend was developed for a national-scale fintech hackathon, reaching the Top 15 finalists. The project demonstrates a novel approach to microfinance risk assessment using social graph analytics, natural language processing, and computer vision—all visualized through an intuitive web interface.

**Competition**: Amartha x Google Developer Groups Jakarta Hackathon 2025
**Achievement**: Top 15 Finalist
**Team**: Tim Suksemustanice
-->

---

## License

Copyright © 2025 Tim Suksemustanice. All Rights Reserved.

This project is maintained as a technical portfolio and research documentation. The code, algorithms, and system architecture are proprietary intellectual property.

For commercial licensing, collaboration, or technical inquiries, please contact the [team](https://www.linkedin.com/in/firyan-fatih-fadilah).

See [LICENSE](./LICENSE) for full terms.
