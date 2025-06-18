# TaskFlow AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

TaskFlow AI is a modern, AI-powered task management application built with React, TypeScript, and Supabase. It helps you organize your tasks, set priorities, and boost your productivity with AI assistance.

## ✨ Features

- 📝 Create, update, and manage tasks with ease
- 🎯 Set priorities and due dates
- 🔍 AI-powered task suggestions
- 📊 Task analytics and insights
- 📱 Responsive design for all devices
- ⚡ Offline support with PWA
- 🔒 Secure authentication with Supabase Auth

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskflow-ai.git
   cd taskflow-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🛠️ Build & Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Ftaskflow-ai&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY&envDescription=Supabase%20credentials%20are%20required%20to%20connect%20to%20your%20database.&envLink=https%3A%2F%2Fsupabase.com%2Fdocs%2Fguides%2Fgetting-started%2Fquickstarts%2Freactjs)

## 📦 Tech Stack

- **Frontend Framework**: [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend**: [Supabase](https://supabase.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)
- **Linting**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

## 📂 Project Structure

```
src/
├── assets/          # Static assets
├── components/       # Reusable UI components
├── config/          # Configuration files
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and libraries
├── pages/           # Page components
├── services/        # API services
├── store/           # State management
├── styles/          # Global styles
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - your.email@example.com

Project Link: [https://github.com/yourusername/taskflow-ai](https://github.com/yourusername/taskflow-ai)

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the amazing build tooling
- [Supabase](https://supabase.com/) for the awesome backend
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [React Icons](https://react-icons.github.io/react-icons/) for the beautiful icons
