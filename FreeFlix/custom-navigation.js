/**
 * Custom navigation script for FreeFlixx
 * Enhances navigation and mobile experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle mobile navigation menu
    const navItems = document.querySelectorAll('.nav-item');

    // Set the active navigation item based on the current page
    const currentPath = window.location.pathname;

    navItems.forEach(item => {
        const link = item.querySelector('a');
        const href = link.getAttribute('href');
        const section = link.getAttribute('data-section');

        // Set active class based on current path
        if ((currentPath === '/' || currentPath === '/index.html') && section === 'all') {
            item.classList.add('active');
        } else if (currentPath.includes('/movies/') && section === 'movies') {
            item.classList.add('active');
        } else if (currentPath.includes('/tvshows/') && section === 'tv') {
            item.classList.add('active');
        } else if (currentPath.includes('/anime/') && section === 'anime') {
            item.classList.add('active');
        }

        // Add touch-friendly navigation
        item.addEventListener('touchstart', function() {
            this.classList.add('nav-touch');
        });

        item.addEventListener('touchend', function() {
            this.classList.remove('nav-touch');
        });
    });

    // Improve mobile scrolling experience
    const header = document.querySelector('.header');
    const navMenu = document.querySelector('.nav-menu');

    if (header && navMenu) {
        let lastScrollTop = 0;

        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (window.innerWidth <= 768) {
                // Mobile behavior
                if (scrollTop > lastScrollTop && scrollTop > 50) {
                    // Scrolling down - hide header
                    header.style.transform = 'translateY(-100%)';
                    navMenu.style.top = '0';
                } else {
                    // Scrolling up - show header
                    header.style.transform = 'translateY(0)';
                    navMenu.style.top = '60px';
                }
            } else {
                // Reset for desktop
                header.style.transform = 'translateY(0)';
                navMenu.style.top = '70px';
            }

            lastScrollTop = scrollTop;
        });
    }

    // Fix for iOS Safari bounce effect
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.closest('.movie-container')) {
            e.stopPropagation();
        }
    }, { passive: true });

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
