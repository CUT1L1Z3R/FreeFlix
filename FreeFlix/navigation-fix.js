/**
 * Navigation fix for FreeFlixx
 * Fixes common navigation issues, especially on mobile devices
 */

// Fix for iOS and Android touch navigation issues
(function() {
    // Fix for movie sections scrolling
    const containers = document.querySelectorAll('.movies-box');

    containers.forEach(container => {
        // Ensure containers are scrollable
        container.style.overflowX = 'auto';
        container.style.webkitOverflowScrolling = 'touch';

        // Add passive touch events for better performance
        container.addEventListener('touchstart', function() {}, {passive: true});
        container.addEventListener('touchmove', function() {}, {passive: true});
    });

    // Fix for banner navigation on touch devices
    const bannerContainer = document.getElementById('banner-container');
    if (bannerContainer) {
        let startX, startY, startTime;
        let isDragging = false;

        // Touch start event
        bannerContainer.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = new Date().getTime();
            isDragging = true;
        }, {passive: true});

        // Touch move event
        bannerContainer.addEventListener('touchmove', function(e) {
            if (!isDragging) return;

            const touchX = e.touches[0].clientX;
            const touchY = e.touches[0].clientY;

            // Detect horizontal swipe (if more horizontal than vertical)
            const diffX = startX - touchX;
            const diffY = Math.abs(startY - touchY);

            // Only handle horizontal swipes
            if (diffY > Math.abs(diffX) * 0.8) return;

            // Prevent default only if it's a horizontal swipe
            e.preventDefault();
        }, {passive: false});

        // Navigation fix for FreeFlixx website
        // This prevents the error when clicking on the "All" section twice
        document.addEventListener('DOMContentLoaded', () => {
            // Find all navigation links
            const navLinks = document.querySelectorAll('nav a');

            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // If we're already on the same page and it's the active link,
                    // prevent the default navigation which causes the error
                    const href = link.getAttribute('href');
                    const section = link.getAttribute('data-section');

                    // Special handling for "All" section on index page
                    if (section === 'all' && isCurrentPage(href)) {
                        console.log('Preventing navigation - already on index page');
                        e.preventDefault();
                        return false;
                    }
                });
            });
        });

        // Helper function to check if the link is marked as active
        function isActiveLink(link) {
            return link.classList.contains('active') ||
                link.parentElement.classList.contains('active');
        }

        // Helper function to check if we're already on the page the link points to
        function isCurrentPage(href) {
            if (!href) return false;

            // Get the current path and filename
            const currentPath = window.location.pathname;
            const currentFilename = currentPath.split('/').pop() || 'index.html';

            // Get the target filename
            const targetFilename = href.split('/').pop();

            // Check if we're already on the page the link points to
            return currentFilename === targetFilename ||
                (currentFilename === '' && targetFilename === 'index.html') ||
                (currentPath.endsWith('/') && targetFilename === 'index.html') ||
                (currentPath === '/' && targetFilename === 'index.html');
        }

        // Touch end event
        bannerContainer.addEventListener('touchend', function(e) {
            if (!isDragging) return;

            const endX = e.changedTouches[0].clientX;
            const endTime = new Date().getTime();
            const diffX = startX - endX;
            const elapsedTime = endTime - startTime;

            // If quick, horizontal swipe detected
            if (elapsedTime < 300 && Math.abs(diffX) > 30) {
                // Get navigation buttons
                const prevButton = document.getElementById('banner-prev');
                const nextButton = document.getElementById('banner-next');

                // Trigger the appropriate button click
                if (diffX > 0 && nextButton) {
                    // Swipe left - go to next banner
                    nextButton.click();
                } else if (diffX < 0 && prevButton) {
                    // Swipe right - go to previous banner
                    prevButton.click();
                }
            }

            isDragging = false;
        }, {passive: true});
    }
})();
