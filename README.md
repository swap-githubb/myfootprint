# MyFootprint 📖🎬

**Showcase your intellectual footprint effortlessly.**

MyFootprint is a web application and browser extension that automatically tracks the articles you read and the videos you watch, uses a local LLM to summarize them, and builds a public profile for you to share your digital consumption with the world. Follow other interesting people to see what they're learning.

 <!-- It's highly recommended to replace this with a real screenshot of your app! -->

---

## ✨ Features

*   **🌐 Browser Extension (Chrome):** The core of the experience. It sits in your browser and is ready when you are.
*   **🧠 Local AI Summarization:** Uses a locally running language model (`gemma-2b-it`) to summarize content, ensuring your data stays private and secure on your machine.
*   **🎬 Smart Content Detection:** Automatically scrapes article text and fetches YouTube video transcripts for high-quality summaries.
*   **👤 Public Profiles:** Creates a beautiful, public-facing profile page (e.g., `myfootprint.app/profile/username`) to showcase your reading and watch lists.
*   **🤝 Social Following and live feed:** Discover and follow other users to see a curated feed of what the people you admire are consuming.
*   **💅 Sleek & Modern UI:** A beautiful, responsive, dark-themed interface built with React and Tailwind CSS.

---

## 🛠️ Tech Stack

This project is a modern monorepo combining several powerful technologies:

*   **Frontend:** [React](https://reactjs.org/) (with [Vite](https://vitejs.dev/)) & [Tailwind CSS](https://tailwindcss.com/)
*   **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
*   **Browser Extension:**
    *   Standard Web Extension APIs (HTML, CSS, JS)
    *   Build process managed by [Vite](https://vitejs.dev/) with the [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin).
*   **In-Browser AI:** [MLC's WebLLM](https://mlc.ai/web-llm/) running a quantized Gemma model.
*   **Video Transcription:** A custom web scraping solution for YouTube transcripts.

---

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
*   [Python](https://www.python.org/downloads/) (v3.10 or newer recommended)
*   A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account
*   Google Chrome for loading the unpacked extension

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/swap-githubb/myfootprint.git
    cd myfootprint
    ```

2.  **Backend Setup**
    *   Navigate to the backend folder: `cd backend`
    *   Create and activate a Python virtual environment:
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows: venv\Scripts\activate
        ```
    *   Install Python dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    *   Create a `.env` file in the `backend/` directory from the example and fill in your details:
        ```env
        DATABASE_URL="your_mongodb_atlas_connection_string"
        JWT_SECRET_KEY="generate_a_strong_secret_key"
        ALGORITHM="HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES=1440
        ```
        > **Note:** Generate a secure `JWT_SECRET_KEY` by running `openssl rand -hex 32` in your terminal.

3.  **Frontend Setup**
    *   Navigate to the frontend folder: `cd ../frontend`
    *   Install NPM packages:
        ```bash
        npm install
        ```

4.  **Extension Setup**
    *   Navigate to the extension folder: `cd ../extension`
    *   Install NPM packages:
        ```bash
        npm install
        ```

### Running the Application

You will need to have **3 separate terminal windows** open to run the full application stack.

1.  **Terminal 1: Start the Backend**
    ```bash
    cd backend
    source venv/bin/activate
    uvicorn app.main:app --reload
    ```
    > The backend will be running at `http://127.0.0.1:8000`.

2.  **Terminal 2: Start the Frontend**
    ```bash
    cd frontend
    npm run dev
    ```
    > The frontend will be running at `http://localhost:5173`.

3.  **Terminal 3: Build the Extension**
    The extension needs to be "built" before it can be loaded into Chrome.
    ```bash
    cd extension
    npm run build
    ```
    > This creates a `dist` folder inside the `extension` directory. This `dist` folder is your complete extension.

4.  **Load the Extension in Chrome**
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable **Developer mode** in the top-right corner.
    *   Click **"Load unpacked"**.
    *   In the file dialog, navigate to and select the `myfootprint/extension/dist` folder.
    *   The "Content Tracker" extension should now appear in your list. Pin it to your toolbar for easy access!

---

## Usage

1.  **Register:** Go to the website (`http://localhost:5173`) and sign up for an account.
2.  **Log In:** Click the extension icon in your browser toolbar and log in with your new credentials.
3.  **Summarize Content:**
    *   Navigate to an article or a YouTube video.
    *   Click the extension icon. It will detect the content type.
    *   Click the "Summarize" button.
    *   The first time, it will take a minute to download the local AI model. Subsequent uses will be much faster.
4.  **View Your Profile:** Navigate to `http://localhost:5173/profile/your-username` to see your automatically generated list!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/myfootprint/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
