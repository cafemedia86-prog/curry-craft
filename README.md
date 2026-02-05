# 🍛 DDH Curry Craft
### *Royal North Indian & Fusion Dining Experience*

[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🏛️ Project Overview

**DDH Curry Craft** is a premium digital platform designed for a luxury North Indian and Indian Chinese fusion restaurant. It offers a seamless bridge between royal hospitality and modern convenience, allowing patrons to explore a curated menu, manage their digital wallet, and experience effortless ordering.

Built with a focus on **Visual Excellence** and **High Performance**, the application features a deep emerald-and-gold aesthetic that reflects the opulence of North Indian dining.

---

## ✨ Key Features

### 🍽️ Culinary Exploration
- **Gourmet Menu**: Interactive browsing of authentic North Indian and Fusion dishes.
- **Dynamic Search & Filters**: Quickly find your favorite delicacies by type or popularity.
- **Special Offers**: Dedicated section for seasonal curations and exclusive deals.

### 👤 Guest Experience
- **Secure Authentication**: Robust login system powered by Supabase.
- **Personalized Profile**: Manage order history, saved addresses, and favorites.
- **Digital Wallet**: Integrated loyalty system and balance management for seamless payments.

### 💼 Operational Excellence
- **Admin Dashboard**: Comprehensive management of orders, dishes, and analytics for staff and managers.
- **Real-time Updates**: Live order tracking and kitchen status notifications.
- **Responsive Design**: Flawless experience across Mobile, Tablet, and Desktop.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/curry-craft.git
   cd curry-craft
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
curry-craft/
├── src/
│   ├── components/      # UI Components (Navbar, Menu, Modals)
│   ├── context/         # React Context (Auth, Cart, Orders)
│   ├── hooks/           # Custom React Hooks
│   ├── lib/             # Supabase Client & Third-party configs
│   ├── types/           # TypeScript Interfaces
│   └── utils/           # Helper functions
├── assets/              # Images, Fonts, Icons
├── index.html           # Entry Point
└── vite.config.ts       # Build Configuration
```

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by <b>DDH Curry Craft Team</b>
</p>
