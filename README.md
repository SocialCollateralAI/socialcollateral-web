# SocialCollateral AI - Frontend Dashboard (Competition Version)

> **Branch**: `mvp-hackathon`  
> This is the competition demo version from the Amartha x GDG Jakarta 2025 Hackathon. For the baseline preparation code, see [`main`](https://github.com/SocialCollateralAI/socialcollateral-web/tree/main) branch. For the refined PoC version, see [`develop`](https://github.com/SocialCollateralAI/socialcollateral-web/tree/develop) branch.

## Branch Purpose

This branch preserves the production code from the 24-hour live hackathon, containing:

- Full Sigma.js graph visualization implementation
- Real-time API integration with Amartha microfinance data
- Interactive node modal with multi-tab detail views
- Dynamic filtering system (Kabupaten, Desa, Status)
- Complete UI/UX implementation under time pressure

**Status**: Historical documentation (preserved as-is for portfolio)

## Development Challenges & Limitations

### Built in 24 Hours

The following limitations are **expected and documented**:

**Challenges Encountered**:

- Backend data structure changes required rapid frontend schema adjustments
- Sigma.js integration learning curve under competition pressure
- UI state management complexity with tight deadline
- Limited testing time across different data scenarios

**Known Limitations**:

- ✘ **UI-Data Inconsistencies** - Node colors don't always match internal risk data
  - Example: Green (healthy) node may contain red (high-risk) data when clicked
  - Example: Yellow (medium) node shows green data in detail modal
  - **Root Cause**: Color mapping logic mismatch between graph rendering and data source
- ✘ **untested Edge Cases** - Limited validation for specific Kabupaten/Desa combinations
- ⚠︎ **Style Inconsistencies** - Some components have conflicting CSS/inline styles
- ⚠︎ **Performance Optimization** - Graph rendering could be more efficient for large datasets

**Demo Strategy**: During the competition presentation, the team carefully selected "safe" nodes (data-consistent locations) to demonstrate to judges, successfully avoiding UI bugs during the live demo.

**Post-Competition Cleanup**: After the hackathon, the codebase was thoroughly refactored in the `develop` branch with proper data mapping fixes, consistent styling, comprehensive testing, and optimized performance.

## Data & Privacy Notice

**Important**: This branch was developed with actual Amartha microfinance data during the competition:

| Data Type                   | Included in Repo? | Note                                                           |
| --------------------------- | ----------------- | -------------------------------------------------------------- |
| **Network Graph Data**      | ✓ Yes             | Sanitized/anonymized data in `src/data/networkData.json`       |
| **Real Member Information** | ✘ No              | Excluded for data privacy and security                         |
| **API Endpoints**           | ✓ Yes             | Historical reference only (backend deployment may be inactive) |

### How Data Was Processed

The UI visualization was built using:

- **Backend AI Analysis** - Pre-computed trust scores and risk assessments from Vertex AI
- **Social Graph Algorithms** - Network visualization of microfinance group relationships
- **Real-time API Integration** - Dynamic data fetching from FastAPI backend

**Current Status**: Code preserved for portfolio and documentation purposes.

## What's New vs Main Branch

**Additional Features**:

- Complete Sigma.js canvas implementation with zoom/pan controls
- NodeModal component with tabbed interface (Overview, Graph Metrics, NLP Insights, CV Analysis)
- Advanced filtering logic with cascading Kabupaten → Desa → Status selection
- Wallet balance display and user profile section
- Custom color-coded risk visualization (green/yellow/red)

<!-- **Modified Files**:

- `src/components/NetworkGraph.tsx` - Full graph rendering with Sigma.js
- `src/components/Sidebar.tsx` - Complete filtering UI
- `src/components/NodeModal/` - Multi-tab detail modal
- `src/api/services.ts` - Backend API integration
- `src/data/networkData.json` - Competition dataset -->

**Technical Debt (Fixed in `develop`)**:

- Node color mapping logic corrected for data consistency
- CSS/style conflicts resolved with systematic refactoring
- Performance optimizations for graph rendering
- Comprehensive testing across all data scenarios
- Code cleanup and documentation improvements

<!--
## Development Context

This branch represents the actual code demonstrated during the 24-hour Amartha x GDG Jakarta Hackathon 2025. Despite time constraints and known issues, the team successfully presented a working demo by strategically selecting "safe" node data during the live presentation. The experience highlighted the importance of thorough testing and robust data validation, which were addressed in the post-hackathon refactor (`develop` branch).

**Team**: Tim Suksemustanice
**Competition**: Amartha x GDG Jakarta Hackathon 2025
**Achievement**: Successfully demonstrated full-stack AI integration despite technical challenges
-->
