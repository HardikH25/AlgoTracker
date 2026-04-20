# 🚀 AlgoTracker - SaaS-grade DSA Progress Dashboard 

![AlgoTracker Banner](https://img.shields.io/badge/Project-AlgoTracker-indigo?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-yellow?style=for-the-badge&logo=firebase)
![Gemini](https://img.shields.io/badge/Google_AI-Gemini_Flash-orange?style=for-the-badge&logo=google)

**AlgoTracker** is a premium, production-level React application designed to solve a significant problem faced by software engineers and competitive programmers: tracking Data Structures and Algorithms (DSA) preparation with behavioral insights.

---

## 🧠 1. Problem Statement

### Who is the User?
Computer Science students, competitive developers, and software engineers preparing for technical interviews (e.g., Leetcode, Codeforces, FAANG prep).

### What problem are we solving?
Currently, candidates solve hundreds of problems across multiple platforms (LeetCode, Codeforces, GeeksForGeeks). Tracking these solved problems, revisiting weak topics, maintaining consistency, and calculating big-O complexities are scattered processes. Most developers rely on messy Excel spreadsheets. 

### Why does this matter?
Without structured revision and behavioral insights (like streak tracking and AI-driven complexity analysis), candidates forget optimal solutions. **AlgoTracker** provides an all-in-one SaaS-grade dashboard to visualize consistency, isolate weak concepts via the "Revision Room," and let an AI automatically analyze solution complexities.

---

## ✨ 2. Core Features (Application Functionality)

✅ **Authentication System**: Secure user signup, login, and protected routes using Firebase Auth.
✅ **Interactive Dashboard (CRUD)**: Create, Read, Update, and Delete problem logs entirely backed by Firestore.
✅ **🔥 Behavioral Gamification (Streaks)**: Dynamically calculates consecutive days of practice to gamify interview prep.
✅ **🤖 AI Space/Time Complexity Analyzer**: Uses the **Google Gemini API** (`gemini-flash-latest`) to statically analyze pasted algorithms and return precise Big-O complexities directly into the user's notes.
✅ **📊 Tagging & Analytics**: Extract categories (e.g., *Dynamic Programming, Trees*) and visually represent "Top Practiced Topics" and "Difficulty Distribution".
✅ **🔄 Revision Room**: Dedicated filtering for problems explicitly pinned for "Future Revision".

---

## ⚛️ 3. React Fundamentals & Architecture

This project strictly adheres to modern React practices to achieve clean code and optimal performance:

- **Core**: Functional Components, precise State Management (`useState`), side-effect handling (`useEffect`), and robust conditional rendering.
- **Context API**: Global management of the user's Auth state (`src/context/AuthContext.jsx`) preventing prop drilling.
- **Advanced Hooks (`useMemo` & `useCallback`)**: The array sorting algorithms for Dashboard Streaks and Category extracting rely on `useMemo` to prevent expensive re-calculations. Delete handlers utilize `useCallback` to prevent child-component re-renders.
- **Direct DOM Manipulation (`useRef`)**: Implemented UX micro-interactions like auto-focusing inputs on mount.
- **Advanced Rendering (Lazy Loading & Suspense)**: Implemented route-based Code-Splitting in `App.jsx` using `React.lazy()` to significantly reduce the initial JavaScript payload.

---

## 🛠️ 4. Tech Stack

- **Frontend Environment**: Vite + React 19
- **Styling & UI**: Tailwind CSS (with Glassmorphic dynamic animations)
- **Routing**: React Router DOM v7
- **Backend / Database**: Firebase (Authentication + Cloud Firestore)
- **Artificial Intelligence**: Google Gemini 1.5/2.0 REST API
- **Icons**: Lucide React & React Icons 

---

## 🏃 5. Setup & Local Installation

Follow these steps to run the project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/HardikH25/AlgoTracker.git
   cd AlgoTracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your Firebase and Gemini credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   
   VITE_GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

---

## ⚖️ Academic Integrity & Rubric Compliance
This application was developed as the **End-Term Project Submission** for the *Building Web Applications with React (Batch 2029)* course. Every feature was intentionally designed to check off the 10-point evaluation rubric, showcasing both fundamental UI design and advanced programmatic architectural decisions. 
