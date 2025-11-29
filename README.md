# 🌐 SocialCollateral Web – Frontend Dashboard

**Antarmuka visual untuk SocialCollateral AI**, dibangun untuk menampilkan jaringan sosial, skor kepercayaan, serta visualisasi data kredit mikro berbasis graf.

Frontend ini berfungsi sebagai **Dashboard** yang terhubung ke Backend SocialCollateral AI.

---

## 🚀 Project Overview

Dashboard ini menampilkan:
- Visualisasi **Social Graph** (node & edges)
- Filter dinamis (Kabupaten, Desa, Group)
- Tampilan detail anggota & hubungan sosial
- Integrasi penuh dengan Backend API (FastAPI)

Aplikasi dibangun menggunakan **React + Vite** dengan performa cepat dan desain modern

---

## 🔗 Deployment

| Service | URL |
|---------|-----|
| **Frontend Dashboard** | https://socialcollateral-web.vercel.app/ |
| **Backend API (Referensi)** | https://socialcollateral-ai-production.up.railway.app |

---

## 📂 Struktur Direktori (Frontend)

Struktur proyek frontend berada di folder **FRONTEND/**:

```
FRONTEND/
├── node_modules/             # Dependencies
├── src/
│   ├── api/                 # API services untuk Backend integration
│   ├── assets/              # Static assets (images, icons, etc)
│   ├── common/              # Common utilities & helpers
│   ├── components/          # Reusable components
│   │   ├── header/         # Header component
│   │   ├── NetworkGraph/   # Network graph visualization
│   │   │   ├── NodeModal/ # Modal untuk detail node
│   │   │   │   ├── tabs/  # Tab components (info, connections, etc)
│   │   │   │   ├── index.tsx
│   │   │   │   └── types.ts
│   │   │   └── Sidebar/   # Sidebar component
│   │   └── NetworkGraph.tsx # Main graph component
│   ├── data/               # Data files
│   │   └── networkData.json # Network data (nodes & edges)
│   ├── utils/              # Utility functions
│   │   └── formatCurrency.tsx
│   ├── App.css             # App styles
│   ├── App.tsx             # Main App component
│   ├── index.css           # Global styles
│   └── main.tsx            # Entry point
├── .gitignore
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML template
├── package-lock.json
├── package.json            # Dependencies & scripts
├── README.md               # Documentation
├── tsconfig.app.json       # TypeScript config (app)
└── tsconfig.json           # TypeScript config (base)
```

---

## 🚀 Installation & Usage

### Prerequisites
- Node.js >= 18.x
- npm atau yarn

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/socialcollateral-web.git
cd socialcollateral-web

# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production
npm run build
```

Server akan berjalan di `http://localhost:5173`

---

## 🔌 Backend Integration

Frontend ini terhubung ke **Backend API (FastAPI)** untuk mengambil data:
- Social graph data (nodes & edges)
- Member details dan hubungan sosial
- Filter data berdasarkan lokasi (Kabupaten, Desa, Group)

**Backend API Base URL:**
```
https://socialcollateral-ai-production.up.railway.app
```

---

## ✨ Key Features Detail

### 1. **Visualisasi Social Graph**
Menampilkan jaringan sosial dalam bentuk graf interaktif dengan:
- Node: Mewakili anggota
- Edge: Mewakili hubungan antar anggota
- Interactive zoom & pan
- Node detail on click

### 2. **Filter Dinamis**
Filter data secara real-time berdasarkan:
- **Kabupaten** - Filter berdasarkan kabupaten
- **Desa** - Filter berdasarkan desa
- **Group** - Filter berdasarkan kelompok/grup

### 3. **Detail Anggota**
Tampilan lengkap informasi anggota meliputi:
- Profil anggota
- Hubungan sosial (connections)
- Skor kepercayaan (trust score)
- Riwayat transaksi/aktivitas

### 4. **Skor Kepercayaan**
Perhitungan skor berbasis:
- Social graph analysis
- Clustering coefficient
- Network centrality
- Community detection

---

## 🎯 Tech Stack

**Frontend Framework:**
- React + Vite
- Modern JavaScript/ES6+

**API Integration:**
- FastAPI Backend
- RESTful API

---
