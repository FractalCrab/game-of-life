
const speedSlider = document.getElementById('speed-slider');
const speedDisplay = document.getElementById('speed-display');

speedSlider.addEventListener('input', function() {
    speedDisplay.textContent = this.value + 'ms';

    const autoPlayDiv = document.querySelector('[hx-trigger*="every"]');
    if (autoPlayDiv) {
        autoPlayDiv.setAttribute('hx-trigger', `every ${this.value}ms`);
        htmx.process(autoPlayDiv);
    }
});

document.body.addEventListener('htmx:afterSwap', function(event) {
    if (event.detail.target.id === 'grid') {

        const response = event.detail.xhr.getResponseHeader('X-Generation');
        if (response) {
            document.getElementById('generation-count').textContent = response;
        }
    }
});


document.body.addEventListener('htmx:afterSwap', function(event) {
    if (event.detail.target.id === 'auto-play-container') {
        const indicator = document.getElementById('auto-play-indicator');
        const autoPlayDiv = document.querySelector('[hx-trigger*="every"]');
        
        if (autoPlayDiv) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }
});

document.addEventListener('keydown', function(event) {
    
    if (event.target.tagName === 'INPUT') return;
    
    switch(event.key) {
        case ' ': 
            event.preventDefault();
            htmx.ajax('GET', '/next', '#grid');
            break;
        case 'c': 
            event.preventDefault();
            htmx.ajax('GET', '/clear', '#grid');
            break;
        case 'r': 
            event.preventDefault();
            htmx.ajax('GET', '/random', '#grid');
            break;
        case 'p': 
            event.preventDefault();
            htmx.ajax('GET', '/toggle-auto-play', '#auto-play-container');
            break;
    }
});


document.body.addEventListener('mouseover', function(event) {
    if (event.target.classList.contains('cell')) {
        event.target.style.transition = 'all 0.1s ease';
    }
});


document.body.addEventListener('htmx:beforeRequest', function(event) {
    if (event.detail.target.id === 'grid') {
        document.getElementById('grid').style.opacity = '0.7';
    }
});

document.body.addEventListener('htmx:afterRequest', function(event) {
    if (event.detail.target.id === 'grid') {
        document.getElementById('grid').style.opacity = '1';
    }
});


document.body.addEventListener('htmx:responseError', function(event) {
    console.error('HTMX Request failed:', event.detail);
    alert('Something went wrong. Please try again.');
});


document.addEventListener('DOMContentLoaded', function() {
    console.log('Conway\'s Game of Life loaded successfully!');
    
    speedDisplay.textContent = speedSlider.value + 'ms';
    
    console.log('Keyboard shortcuts:');
    console.log('  Spacebar: Next generation');
    console.log('  C: Clear grid');
    console.log('  R: Random fill');
    console.log('  P: Toggle auto-play');
});
