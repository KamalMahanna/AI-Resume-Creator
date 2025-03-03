# AI Resume Creator

AI Resume Creator is a powerful tool designed to help you generate professional resumes effortlessly. Leveraging the Gemini API, this application streamlines the resume creation process, ensuring that your resume is not only well-structured but also tailored to your career needs.

## Live Demo

Try the hosted website [here](https://ai-resume-creator.netlify.app).

## Installation

Follow these steps to set up the project locally.

### Prerequisites

- **Git** installed. You can download it from [here](https://git-scm.com/downloads).
- **Node.js** and **npm** installed. You can download them from [here](https://nodejs.org/).
- **Python** installed. You can download it from [here](https://www.python.org/downloads/).
- **Gemini API Key**. Sign up at [Google AI Studio](https://aistudio.google.com/), click on `Get API key` on your top left, generate a new API key and copy it.

### Clone the Repository

```bash
git clone -b localhost https://github.com/KamalMahanna/AI-Resume-Creator
cd AI-Resume-Creator
```

### Frontend Setup

```bash
cd frontend && npm install
```

### Backend Setup

```bash
pip install -r requirements.txt
```

## Running the Application

### Start the Frontend Development Server

```bash
cd frontend && npm run dev
```

Open your browser and navigate to `http://localhost:5173` to view the frontend application.

### Start the Backend Server

In a new terminal, start the backend server using Gunicorn:

```bash
gunicorn backend.app:app
```

The backend API will be available at `http://localhost:8000`.
