# 🗺️ AI Roadmap Generator & Community Platform

> **Architected & Developed by Vansh Badjate**
>
> 🌐 **Portfolio**: [INSERT_YOUR_PORTFOLIO_URL]
> 👔 **LinkedIn**: [INSERT_YOUR_LINKEDIN_URL]
> 📧 **Contact**: badjatevansh1008@gmail.com

![Project Banner](https://via.placeholder.com/1200x400?text=AI+Roadmap+Generator)

## 🚀 Overview

**Roadmap.Gen** is a scalable, AI-powered educational platform designed to help learners master any skill. By leveraging **Google's Gemini AI**, it generates personalized, week-by-week learning paths tailored to the user's level (Beginner, Intermediate, Advanced) and time availability.

Beyond generation, it features a **Social Community** where users can share their roadmaps, view trending paths, and clone them to their own collection.

---

## ✨ Key Features

### 🧠 AI Intelligence
*   **Dynamic Generation**: Creates detailed, day-by-day study plans using Gemini Pro.
*   **Customization**: Users specify Duration (e.g., "1 Month"), Commitment (e.g., "2 hours/day"), and Goal ("Mastery" vs "Project").
*   **BYOK (Bring Your Own Key)**: A cost-efficient architecture where users can calculate generation costs on their own API quota via the Settings panel.

### 🌐 Community & Social
*   **Public Feed**: Algorithms sort trending roadmaps by recency and popularity.
*   **Interaction**: Users can "Save" roadmaps to their profile or "Clone" them to customize further.
*   **Live Updates**: optimized caching ensures new posts appear immediately.

### ⚡ Performance & Scale
*   **Tech Stack**: Built on the **MERN** stack (MongoDB replaced by Firestore for scale).
*   **Edge Caching**: In-memory server caching for high-traffic public feeds.
*   **Security**: Firebase Auth integration with protected routes and header-based API key validation.

---

## 🛠️ Technical Architecture

The application follows a **Decoupled Client-Server Architecture** ensuring scalability for millions of concurrent users.

### Frontend (Client)
*   **Framework**: React (Vite) - For lightning-fast rendering.
*   **Styling**: TailwindCSS - Mobile-responsive, dark-mode first design.
*   **State Management**: React Context API (Auth) + LocalStorage (Settings).
*   **Security**: Securely manages user sessions via Firebase SDK.

### Backend (Server)
*   **Runtime**: Node.js & Express.
*   **Database**: Google Firestore (NoSQL) - Chosen for its ability to handle massive real-time data sync.
*   **AI Service**: Integration with Google Gemini API using a fallback key mechanism (Server Key vs. User Key).
*   **Middleware**: Custom authentication middleware to verify Firebase tokens.

---

## ⚙️ How It Works (Logic Flow)

1.  **Auth Layer**: User logs in via Google. Firebase returns a secure token.
2.  **Generation Request**:
    *   User inputs topic ("Python").
    *   Client checks for a Custom API Key in `localStorage`.
    *   Request sent to Backend with Token + optional API Key.
3.  **AI Processing**:
    *   Server validates Token.
    *   Constructs a complex prompt for Gemini.
    *   Parses the unstructured AI response into strict JSON.
4.  **Data Persistence**:
    *   Roadmap is saved to Firestore with `authorId`.
    *   If "Posted to Community", `isPublic` flag is set to true.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Firebase Account
*   Google Gemini API Key

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/vanshbadjate07/Roadmap-Generator.git
    cd Roadmap-Generator
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    # Create .env file with:
    # GEMINI_API_KEY=your_key
    # FIREBASE_SERVICE_ACCOUNT_KEY={...json...}
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd client
    npm install
    # Create .env file with:
    # VITE_API_URL=http://localhost:5001
    npm run dev
    ```

---

## 🤝 Contributing

This project is open for contributions!
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

> **Note for Deployment**: This project is consistent with 12-Factor App methodology. For production, deploy Client to **Vercel** and Server to **Render/Railway**. See `DEPLOYMENT.md` for the Scalability Guide.
