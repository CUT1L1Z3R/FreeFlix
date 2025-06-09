/**
 * Category Page JavaScript
 * Handles dynamic content loading based on category parameters
 * Optimized for SEO and indexing
 */

// TMDB API Configuration
const TMDB_API_KEY = '84259f99204eeb7d45c7e3d8e36c6123';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM Elements
const categoryTitle = document.getElementById('category-title');
const categoryDescription = document.getElementById('category-description');
const currentCategoryBreadcrumb = document.getElementById('current-category');
const contentGrid = document.getElementById('content-grid');
const loadingIndicator = document.getElementById('loading-indicator');
const noResults = document.getElementById('no-results');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const typeFilter = document.getElementById('typeFilter');
const sortFilter = document.getElementById('sortFilter');

// State variables
let currentCategory = '';
let currentType = 'all';
let currentSort = 'popularity.desc';
let currentPage = 1;
let totalPages = 1;
let isLoading = false;

// Category configurations
const categoryConfig = {
    'latest': {
        title: 'Latest Releases',
        description: 'Discover the newest movies, TV shows, and anime releases.',
        sort: 'release_date.desc',
        keywords: 'latest releases, new movies, new TV shows, recent anime'
    },
    'popular': {
        title: 'Popular Content',
        description: 'Trending movies, TV shows, and anime that everyone is watching.',
        sort: 'popularity.desc',
        keywords: 'popular movies, trending TV shows, popular anime'
    },
    'top-rated': {
        title: 'Top Rated Content',
        description: 'Highest rated movies, TV shows, and anime by critics and viewers.',
        sort: 'vote_average.desc',
        keywords: 'top rated movies, best TV shows, highest rated anime'
    },
    'ongoing': {
        title: 'Ongoing Series',
        description: 'Currently airing TV shows and anime series.',
        sort: 'popularity.desc',
        keywords: 'ongoing series, currently airing, active TV shows'
    },
    'top-rated-movies': {
        title: 'Top Rated Movies',
        description: 'The highest rated movies of all time.',
        sort: 'vote_average.desc',
        keywords: 'top rated movies, best movies, highest rated films'
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
    loadContent();
});

/**
 * Initialize page based on URL parameters
 */
function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('category') || '';
    currentType = urlParams.get('type') || 'all';

    // Update page elements based on category
    updatePageForCategory(currentCategory);

    // Set filter values
    typeFilter.value = currentType;
    if (categoryConfig[currentCategory]) {
        sortFilter.value = categoryConfig[currentCategory].sort;
        currentSort = categoryConfig[currentCategory].sort;
    }

    // Update category button states
    updateCategoryButtons();

    console.log(`Category page initialized: category=${currentCategory}, type=${currentType}`);
}

/**
 * Update page content for specific category
 */
function updatePageForCategory(category) {
    if (category && categoryConfig[category]) {
        const config = categoryConfig[category];

        // Update page elements
        categoryTitle.textContent = config.title;
        categoryDescription.textContent = config.description;
        currentCategoryBreadcrumb.textContent = config.title;

        // Update meta tags for SEO
        updateSEOMetadata(config);

        // Update page title
        document.title = `${config.title} - FreeFlix`;

        // Update canonical URL
        const canonicalUrl = `https://freeflix.top/category/?category=${category}`;
        updateCanonicalURL(canonicalUrl);
    } else {
        // Default state
        categoryTitle.textContent = 'Browse by Category';
        categoryDescription.textContent = 'Discover content organized by category - from latest releases to top-rated classics.';
        currentCategoryBreadcrumb.textContent = 'Browse Categories';
        document.title = 'FreeFlix - Browse by Category';
        updateCanonicalURL('https://freeflix.top/category/');
    }
}

/**
 * Update SEO metadata dynamically
 */
function updateSEOMetadata(config) {
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', `${config.description} Stream for free on FreeFlix.`);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.setAttribute('content', `${config.keywords}, FreeFlix, free streaming`);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');

    if (ogTitle) ogTitle.setAttribute('content', `${config.title} - FreeFlix`);
    if (ogDescription) ogDescription.setAttribute('content', config.description);
    if (ogUrl) ogUrl.setAttribute('content', `https://freeflix.top/category/?category=${currentCategory}`);

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');

    if (twitterTitle) twitterTitle.setAttribute('content', `${config.title} - FreeFlix`);
    if (twitterDescription) twitterDescription.setAttribute('content', config.description);
    if (twitterUrl) twitterUrl.setAttribute('content', `https://freeflix.top/category/?category=${currentCategory}`);
}

/**
 * Update canonical URL
 */
function updateCanonicalURL(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = url;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.getAttribute('data-category');
            changeCategory(category);
        });
    });

    // Filter change events
    typeFilter.addEventListener('change', (e) => {
        currentType = e.target.value;
        currentPage = 1;
        updateURL();
        loadContent();
    });

    sortFilter.addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        loadContent();
    });

    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadContent();
            scrollToTop();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadContent();
            scrollToTop();
        }
    });
}

/**
 * Change category and update URL
 */
function changeCategory(category) {
    currentCategory = category;
    currentPage = 1;

    // Update sort based on category
    if (categoryConfig[category]) {
        currentSort = categoryConfig[category].sort;
        sortFilter.value = currentSort;
    }

    updatePageForCategory(category);
    updateCategoryButtons();
    updateURL();
    loadContent();
}

/**
 * Update category button states
 */
function updateCategoryButtons() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        const btnCategory = btn.getAttribute('data-category');
        if (btnCategory === currentCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Update browser URL without page reload
 */
function updateURL() {
    const params = new URLSearchParams();

    if (currentCategory) {
        params.set('category', currentCategory);
    }

    if (currentType !== 'all') {
        params.set('type', currentType);
    }

    const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
}

/**
 * Load content based on current filters
 */
async function loadContent() {
    if (isLoading) return;

    isLoading = true;
    showLoading();

    try {
        let content = [];

        if (currentType === 'all') {
            // Load mixed content (movies, TV shows, and anime)
            const [movies, tvShows] = await Promise.all([
                fetchContent('movie'),
                fetchContent('tv')
            ]);

            content = [...movies, ...tvShows];
            // Sort mixed content
            content = sortContent(content);
            content = content.slice(0, 20); // Limit to 20 items per page
        } else {
            content = await fetchContent(currentType === 'anime' ? 'tv' : currentType);
        }

        displayContent(content);
        updatePagination();

    } catch (error) {
        console.error('Error loading content:', error);
        showNoResults();
    } finally {
        isLoading = false;
        hideLoading();
    }
}

/**
 * Fetch content from TMDB API
 */
async function fetchContent(type) {
    let endpoint = '';
    let params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        page: currentPage,
        sort_by: currentSort
    });

    // Determine endpoint based on category and type
    if (currentCategory === 'ongoing' && type === 'tv') {
        endpoint = `${TMDB_BASE_URL}/tv/on_the_air`;
    } else if (currentCategory === 'latest') {
        endpoint = type === 'movie'
            ? `${TMDB_BASE_URL}/movie/now_playing`
            : `${TMDB_BASE_URL}/tv/airing_today`;
    } else if (currentCategory === 'popular') {
        endpoint = `${TMDB_BASE_URL}/${type}/popular`;
    } else if (currentCategory === 'top-rated' || currentCategory === 'top-rated-movies') {
        endpoint = `${TMDB_BASE_URL}/${type}/top_rated`;
    } else {
        // Default to discover endpoint
        endpoint = `${TMDB_BASE_URL}/discover/${type}`;
    }

    // Add anime filtering for TV shows
    if (currentType === 'anime' || (type === 'tv' && currentType === 'all')) {
        params.append('with_genres', '16'); // Animation genre
        params.append('with_origin_country', 'JP'); // Japanese origin
    }

    const response = await fetch(`${endpoint}?${params}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    totalPages = Math.min(data.total_pages, 500); // TMDB limit

    return data.results.map(item => ({
        ...item,
        media_type: type,
        poster_path: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : '../assets/no-image.png'
    }));
}

/**
 * Sort content based on current sort option
 */
function sortContent(content) {
    return content.sort((a, b) => {
        switch (currentSort) {
            case 'popularity.desc':
                return b.popularity - a.popularity;
            case 'vote_average.desc':
                return b.vote_average - a.vote_average;
            case 'release_date.desc':
                const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
                const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
                return dateB - dateA;
            case 'vote_count.desc':
                return b.vote_count - a.vote_count;
            default:
                return 0;
        }
    });
}

/**
 * Display content in grid
 */
function displayContent(content) {
    if (!content || content.length === 0) {
        showNoResults();
        return;
    }

    contentGrid.innerHTML = content.map(item => createContentCard(item)).join('');

    // Add click event listeners to cards
    contentGrid.querySelectorAll('.content-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            const type = card.getAttribute('data-type');
            // Navigate to detail page
            window.location.href = `../movie_details/movie_details.html?id=${id}&type=${type}`;
        });
    });
}

/**
 * Create content card HTML
 */
function createContentCard(item) {
    const title = item.title || item.name;
    const year = new Date(item.release_date || item.first_air_date || '').getFullYear() || 'N/A';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const type = item.media_type === 'movie' ? 'Movie' : 'TV Show';

    return `
        <div class="content-card" data-id="${item.id}" data-type="${item.media_type}">
            <img src="${item.poster_path}" alt="${title}" loading="lazy">
            <div class="type-badge">${type}</div>
            <div class="content-card-info">
                <h3>${title}</h3>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>${rating}</span>
                </div>
                <div class="year">${year}</div>
            </div>
        </div>
    `;
}

/**
 * Update pagination controls
 */
function updatePagination() {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

    // Update pagination button states
    prevPageBtn.style.opacity = currentPage <= 1 ? '0.5' : '1';
    nextPageBtn.style.opacity = currentPage >= totalPages ? '0.5' : '1';
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.style.display = 'flex';
    contentGrid.style.display = 'none';
    noResults.style.display = 'none';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.style.display = 'none';
    contentGrid.style.display = 'grid';
}

/**
 * Show no results message
 */
function showNoResults() {
    contentGrid.style.display = 'none';
    noResults.style.display = 'block';
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Handle browser back/forward navigation
 */
window.addEventListener('popstate', () => {
    initializePage();
    loadContent();
});

// Initialize back to top button
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', scrollToTop);
}
