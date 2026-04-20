# AlgoTracker 🚀

**AlgoTracker** is a premium, production-level React application designed to help software engineers and competitive programmers track their Data Structures and Algorithms (DSA) progress with precision and behavioral insights.

## 🧠 Problem Statement
Many students struggle to keep track of their consistency, revision items, and progress across multiple platforms like LeetCode, Codeforces, and GeeksForGeeks. **AlgoTracker** solves this by providing a centralized, high-performance dashboard that translates raw logging into meaningful success rates and difficulty distributions.

## ✨ Key Features
- **📊 Interactive Dashboard**: Real-time visualization of success rates (Success Circle) and difficulty distribution (Difficulty Bar).
- **📝 Problem Logger**: Smart interface to commit new problems with auto-platform detection from URLs.
- **🔄 Revision Room**: A dedicated area for problems marked for revision, helping users master "Weak Slots."
- **📑 Training Sheets**: Progress tracking for specific interview preparation sheets (e.g., CP-31, Striver A2Z).
- **🔐 Secure Authentication**: Firebase-powered Auth with persistent data and protected routing.

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS
- **Backend / Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Routing**: React Router 7
- **Icons**: Lucide React, Simple Icons

## ⚛️ Advanced React Concepts Used
- **Lazy Loading & Suspense**: Optimized initial bundle size by splitting code across routes.
- **Context API**: Managed global authentication state efficiently.
- **useMemo**: Memoized complex statistical calculations for the dashboard.
- **useCallback**: Memoized performance-critical handlers like problem deletion.
- **useRef**: Enhanced UX with auto-focusing input fields.

## 🏃 Setup Instructions
1. Clone the repository: `git clone [repo-url]`
2. Install dependencies: `npm install`
3. Configure Firebase: Update `src/services/firebase.js` with your credentials.
4. Run locally: `npm run dev`

## ⚖️ Academic Integrity
This project was developed by **Hardik** for the end-term submission of the "Building Web Applications with React" course (Batch 2029). Every component, hook, and styled element has been thoughtfully implemented to solve a genuine problem for the developer community.
