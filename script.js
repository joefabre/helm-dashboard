// Date and Time Display Functions
function updateDateTime() {
    const now = new Date();
    
    // Format date (e.g., "Wednesday, June 19, 2024")
    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const formattedDate = now.toLocaleDateString('en-US', dateOptions);
    
    // Format time (e.g., "2:30:45 PM")
    const timeOptions = {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
    
    // Update the display elements
    const dateDisplay = document.getElementById('dateDisplay');
    const timeDisplay = document.getElementById('timeDisplay');
    
    if (dateDisplay) {
        dateDisplay.textContent = formattedDate;
    }
    
    if (timeDisplay) {
        timeDisplay.textContent = formattedTime;
    }
}

// Simple Drag and Drop Functionality
let draggedCard = null;

function initializeDragAndDrop() {
    console.log('Setting up simple drag and drop...');
    
    const cards = document.querySelectorAll('.app-card');
    console.log('Found cards:', cards.length);
    
    cards.forEach((card, index) => {
        console.log('Setting up card:', index, card.querySelector('.card-title').textContent);
        
        // Make sure card is draggable
        card.draggable = true;
        
        // Prevent links from interfering with drag
        const cardButton = card.querySelector('.card-button');
        if (cardButton) {
            cardButton.addEventListener('mousedown', function(e) {
                e.stopPropagation();
            });
            cardButton.addEventListener('dragstart', function(e) {
                e.preventDefault();
                return false;
            });
        }
        
        // Drag start
        card.addEventListener('dragstart', function(e) {
            console.log('DRAG START:', this.querySelector('.card-title').textContent);
            draggedCard = this;
            this.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', 'dragging');
        });
        
        // Drag end
        card.addEventListener('dragend', function(e) {
            console.log('DRAG END');
            this.style.opacity = '1';
            draggedCard = null;
            
            // Remove highlights from all cards
            cards.forEach(c => c.classList.remove('drag-over'));
        });
        
        // Drag over
        card.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (draggedCard && draggedCard !== this) {
                this.classList.add('drag-over');
            }
        });
        
        // Drag leave
        card.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
        });
        
        // Drop
        card.addEventListener('drop', function(e) {
            e.preventDefault();
            console.log('DROP on:', this.querySelector('.card-title').textContent);
            
            if (draggedCard && draggedCard !== this) {
                // Simple swap
                const container = this.parentNode;
                const draggedNext = draggedCard.nextSibling;
                const thisNext = this.nextSibling;
                
                container.insertBefore(draggedCard, thisNext);
                container.insertBefore(this, draggedNext);
                
                console.log('Swapped positions!');
            }
            
            this.classList.remove('drag-over');
        });
    });
    
    console.log('Drag and drop setup complete!');
}

// Initialize page
function initializePage() {
    // Update date and time immediately
    updateDateTime();
    
    // Update time every second
    setInterval(updateDateTime, 1000);
    
    // Initialize drag and drop functionality
    initializeDragAndDrop();
    
    // Show cards with animation
    setTimeout(() => {
        const cards = document.querySelectorAll('.app-card');
        cards.forEach(card => {
            card.style.opacity = '1';
        });
    }, 100);
}

// Handle page load
document.addEventListener('DOMContentLoaded', initializePage);

// Handle visibility change (when user switches tabs)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateDateTime();
    }
});

// Optional: Add some interactive feedback
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('card-button')) {
        // Add a subtle click effect
        e.target.style.transform = 'scale(0.98)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 100);
    }
});

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        // Ensure focus is visible on card buttons
        setTimeout(() => {
            const focused = document.activeElement;
            if (focused && focused.classList.contains('card-button')) {
                focused.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 0);
    }
});

