/**
 * Custom navigation script for FreeFlixx
 * Enhances navigation and mobile experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Function to initialize navigation
    function initNavigation() {
        // Handle mobile navigation menu
        const navItems = document.querySelectorAll('.nav-item');

        // Set current active item based on URL
        setActiveNavItem(navItems);

        // Add event listeners to nav items
        addNavItemEventListeners(navItems);

        // Initialize scroll behavior
        initScrollBehavior();
    }

    // Function to set the active navigation item based on path
    function setActiveNavItem(navItems) {
        const currentPath = window.location.pathname;

        navItems.forEach(item => {
            const link = item.querySelector('a');
            const section = link.getAttribute('data-section');

            // Remove any existing active classes
            item.classList.remove('active');

            // Apply active class based on current path
            if (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '') {
                if (section === 'all') {
                    item.classList.add('active');
                }
            } else if (currentPath.includes('/movies/') && section === 'movies') {
                item.classList.add('active');
            } else if (currentPath.includes('/tvshows/') && section === 'tv') {
                item.classList.add('active');
            } else if (currentPath.includes('/anime/') && section === 'anime') {
                item.classList.add('active');
            }
        });
    }

    // Function to add event listeners to nav items
    function addNavItemEventListeners(navItems) {
        const currentPath = window.location.pathname;

        // Process each navigation item
        navItems.forEach(item => {
            const link = item.querySelector('a');
            const href = link.getAttribute('href');
            const section = link.getAttribute('data-section');

            // Enhance navigation with error handling
            link.addEventListener('click', function(e) {
                // Check if we're already on this page - prevent navigation to avoid the error
                const isIndexPage = currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '';

                // If we're already on the index page and clicking "All", prevent the navigation
                if (href === 'index.html' && isIndexPage && section === 'all') {
                    e.preventDefault();
                    return false;
                }

                // Always ensure the link isn't broken for sub-pages
                if (href === 'index.html' && (currentPath === '/anime/' || currentPath === '/movies/' || currentPath === '/tvshows/')) {
                    e.preventDefault();
                    window.location.href = '../index.html';
                }

                // Fix for navigation to current page - update active class without page refresh
                if ((currentPath.includes('/movies/') && section === 'movies') ||
                    (currentPath.includes('/tvshows/') && section === 'tv') ||
                    (currentPath.includes('/anime/') && section === 'anime')) {
                    if (href === 'index.html') {
                        e.preventDefault();

                        // Update active class
                        setActiveNavItem(navItems);

                        // Add active class to clicked item
                        item.classList.add('active');
                    }
                }
            });

            // Add touch-friendly navigation
            item.addEventListener('touchstart', function() {
                this.classList.add('nav-touch');
            });

            item.addEventListener('touchend', function() {
                this.classList.remove('nav-touch');
            });
        });
    }

    // Function to initialize scroll behavior
    function initScrollBehavior() {
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

                const targetElement = document.querySelector(this.getAttribute('href'));
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Initial navigation setup
    initNavigation();
});
