# magic-spot.app

A simple and delightful web application to help you find your magic spot! 🌟

## Live Demo

Visit the app at: [https://quilyo.github.io/magic-spot.app/](https://quilyo.github.io/magic-spot.app/)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/quilyo/magic-spot.app.git
cd magic-spot.app
```

2. Install dependencies:
```bash
npm install
```

### Running Locally

To run the app locally:

```bash
npm start
```

The app will be available at `http://localhost:8080`

### Building for Production

To build the app:

```bash
npm run build
```

This will create a `dist` folder with the production-ready files.

### Deploying to GitHub Pages

The app is automatically deployed to GitHub Pages when you push to the `main` branch. The deployment is handled by GitHub Actions.

To manually deploy:

```bash
npm run deploy
```

## Project Structure

```
magic-spot.app/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions workflow for deployment
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # Styling
│   └── app.js              # JavaScript logic
├── package.json            # npm configuration and scripts
└── README.md              # This file
```

## Available Scripts

- `npm start` - Run the app locally using http-server
- `npm run build` - Build the app for production
- `npm run deploy` - Deploy to GitHub Pages manually

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- GitHub Pages for hosting
- GitHub Actions for CI/CD

## License

MIT
