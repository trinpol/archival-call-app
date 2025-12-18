# Archival Designs - Call QA Platform

An AI-powered coaching intelligence platform built with React and the Google Gemini API.

## Features
- **Audio Analysis**: Instant transcription and diarization.
- **SOP Compliance**: Automated auditing for brand identity, NATO alphabet usage, and routing protocols.
- **Sentiment Mapping**: Visualizes customer engagement throughout the call.
- **Coaching Cards**: Actionable feedback based on predefined SOPs.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd archival-designs-qa
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

1. Push this code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and click "Add New" -> "Project".
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - Key: `API_KEY`
   - Value: `your_gemini_api_key_here`
5. Click **Deploy**.

## Tech Stack
- **React 19**
- **Vite** (Build Tool)
- **Google Gemini API** (via @google/genai)
- **Tailwind CSS** (Styling)
- **Recharts** (Data Visualization)
