// Magic Spot App - Main JavaScript

const magicSpots = [
    "🌟 A cozy reading nook by the window",
    "🌿 A peaceful garden bench under a tree",
    "☕ Your favorite coffee shop corner",
    "🏖️ A quiet beach at sunrise",
    "🏔️ A mountain peak with a breathtaking view",
    "🌙 A starlit rooftop terrace",
    "🎨 An inspiring art studio",
    "📚 A quiet corner in a library",
    "🌸 A blooming flower field",
    "🎵 A spot where your favorite music sounds perfect"
];

document.addEventListener('DOMContentLoaded', () => {
    const findSpotBtn = document.getElementById('findSpot');
    const resultSection = document.getElementById('result');
    const spotText = document.getElementById('spotText');
    
    findSpotBtn.addEventListener('click', () => {
        // Get a random magic spot
        const randomIndex = Math.floor(Math.random() * magicSpots.length);
        const selectedSpot = magicSpots[randomIndex];
        
        // Show the result with animation
        spotText.textContent = selectedSpot;
        resultSection.classList.remove('hidden');
        
        // Add a little animation
        resultSection.style.opacity = '0';
        resultSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            resultSection.style.transition = 'all 0.5s ease';
            resultSection.style.opacity = '1';
            resultSection.style.transform = 'translateY(0)';
        }, 10);
        
        // Change button text
        findSpotBtn.textContent = 'Find Another Magic Spot';
    });
});
