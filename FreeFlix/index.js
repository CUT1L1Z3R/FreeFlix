/*
// Get references to HTML elements
*/
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const goToWatchlistBtn = document.getElementById('goToWatchlist');

// Event listener to navigate to WatchList page
goToWatchlistBtn.addEventListener('click', () => {
    window.location.href = 'watchList/watchlist.html';
});

const scrollDistance = 1200;

// Get references to the header and other elements
const header = document.querySelector('.header');
let lastScrollTop = 0; // Keep track of the last scroll position

// Function to handle scroll events
window.addEventListener('scroll', () => {
    let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollTop > lastScrollTop) {
        // Scrolling down: hide the header
        header.style.top = "-120px"; // Move the header out of view (assuming the header height is 70px)
    } else {
        // Scrolling up: show the header
        header.style.top = "0px"; // Reset the header position to the top
    }

    lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // Prevent negative scroll value
});

// Define a function to handle scrolling
function setupScroll(containerClass, previousButtonClass, nextButtonClass) {
    const previousButtons = document.querySelectorAll(`.${previousButtonClass}`);
    const nextButtons = document.querySelectorAll(`.${nextButtonClass}`);
    const containers = document.querySelectorAll(`.${containerClass}`);

    containers.forEach((container, index) => {
        const previousButton = previousButtons[index];
        const nextButton = nextButtons[index];

        nextButton.addEventListener('click', () => {
            container.scrollBy({
                left: scrollDistance,
                behavior: 'smooth',
            });
        });

        previousButton.addEventListener('click', () => {
            container.scrollBy({
                left: -scrollDistance,
                behavior: 'smooth',
            });
        });
    });
}

// SetupScroll function called for each section
setupScroll('trending-container', 'trending-previous', 'trending-next');
setupScroll('netflix-container', 'netflix-previous', 'netflix-next');
setupScroll('top-container', 'top-previous', 'top-next');
setupScroll('horror-container', 'horror-previous', 'horror-next');
setupScroll('comedy-container', 'comedy-previous', 'comedy-next');
setupScroll('action-container', 'action-previous', 'action-next');

// TMDB API key
const api_Key = '84259f99204eeb7d45c7e3d8e36c6123';

// Function to get appropriate star color based on rating
function getRatingColor(rating) {
    if (rating >= 8) return '#4CAF50'; // Green for high ratings
    if (rating >= 6) return '#8d16c9'; // Purple (main theme color) for good ratings
    if (rating >= 4) return '#FFC107'; // Amber for average ratings
    return '#F44336'; // Red for low ratings
}

// Function to fetch and display movies or TV shows
function fetchMedia(containerClass, endpoint, mediaType, usePosterPath = false) {
    console.log(`Fetching media for ${containerClass} with endpoint ${endpoint}`);
    const containers = document.querySelectorAll(`.${containerClass}`);

    containers.forEach((container) => {
        fetch(`https://api.themoviedb.org/3/${endpoint}&api_key=${api_Key}`)
            .then(response => response.json())
            .then(data => {
                console.log(`Got data for ${containerClass}, found ${data.results.length} items`);
                const fetchResults = data.results;
                container.innerHTML = ''; // Clear the container first to prevent duplicates

                // Process each movie/show item
                fetchResults.forEach(item => {
                    // Use poster_path for Netflix Originals (portrait) or backdrop_path for others (landscape)
                    const imageUrl = usePosterPath ? item.poster_path : item.backdrop_path;
                    if (!imageUrl) return;

                    const title = item.title || item.name || 'Unknown Title';
                    console.log(`Processing item: ${title}`);

                    // Create the main item element with fixed dimensions
                    const itemElement = document.createElement('div');
                    itemElement.className = 'movie-item'; // Add a specific class for styling

                    // Set fixed dimensions based on container type
                    if (usePosterPath) {
                        // Netflix Originals - portrait style
                        itemElement.style.width = '250px';
                        itemElement.style.height = '340px';
                    } else {
                        // Regular movies - landscape style
                        itemElement.style.width = '290px';
                        itemElement.style.height = '170px';
                    }

                    itemElement.style.flexShrink = '0'; // Prevent shrinking
                    itemElement.style.margin = '20px 0';

                    // Create a wrapper for the image to maintain aspect ratio
                    const imgWrapper = document.createElement('div');
                    imgWrapper.className = 'image-wrapper';
                    imgWrapper.style.width = '100%';
                    imgWrapper.style.height = '100%';
                    imgWrapper.style.overflow = 'hidden';
                    imgWrapper.style.borderRadius = '5px';
                    imgWrapper.style.position = 'relative';

                    // Create and add the image
                    // Use w500 for posters (taller) and w780 for backdrops (wider)
                    const img = document.createElement('img');
                    const imageSize = usePosterPath ? 'w500' : 'w780';
                    img.src = `https://image.tmdb.org/t/p/${imageSize}${imageUrl}`;
                    img.alt = title;
                    img.loading = 'lazy'; // Add lazy loading for better performance
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '5px';
                    img.style.transition = 'all 0.5s ease-in-out';

                    imgWrapper.appendChild(img);

                    // Add the image wrapper to the item element
                    itemElement.appendChild(imgWrapper);

                    // Add the item to the container
                    container.appendChild(itemElement);

                    // Add click event to navigate to movie details
                    itemElement.addEventListener('click', () => {
                        const media_Type = item.media_type || mediaType;
                        window.location.href = `movie_details/movie_details.html?media=${media_Type}&id=${item.id}`;
                    });

                    // Defer overlay creation to ensure DOM is rendered
                    setTimeout(() => {
                        // Check if overlay already exists (prevent duplicates)
                        if (imgWrapper.querySelector('.movie-overlay')) return;

                        // Create the overlay with title and rating - only for non-Netflix Originals
                        if (!usePosterPath) {
                            // Create the overlay with title and rating
                            const overlay = document.createElement('div');
                            overlay.className = 'movie-overlay';
                            overlay.style.position = 'absolute';
                            overlay.style.bottom = '0';
                            overlay.style.left = '0';
                            overlay.style.width = '100%';
                            overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 70%)';
                            overlay.style.borderTop = '2px solid rgba(141, 22, 201, 0.6)'; // Add purple stripe for better separation
                            overlay.style.color = 'white';
                            overlay.style.padding = '10px 12px'; // Slightly larger padding
                            overlay.style.borderRadius = '0 0 5px 5px';
                            overlay.style.boxSizing = 'border-box';
                            overlay.style.zIndex = '10';
                            overlay.style.display = 'flex';
                            overlay.style.justifyContent = 'space-between';
                            overlay.style.alignItems = 'center';
                            overlay.style.pointerEvents = 'none';

                            // Create title element
                            const titleElement = document.createElement('div');
                            titleElement.className = 'movie-title';
                            titleElement.textContent = title;
                            titleElement.style.color = 'white';
                            titleElement.style.fontSize = '14px';
                            titleElement.style.fontWeight = 'bold';
                            titleElement.style.margin = '0';
                            titleElement.style.maxWidth = '70%';
                            titleElement.style.whiteSpace = 'nowrap';
                            titleElement.style.overflow = 'hidden';
                            titleElement.style.textOverflow = 'ellipsis';
                            titleElement.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 1)';
                            titleElement.style.letterSpacing = '0.5px';

                            // Enhanced star rating visibility
                            const rating = document.createElement('div');
                            rating.className = 'movie-rating';
                            rating.style.display = 'flex';
                            rating.style.alignItems = 'center';
                            rating.style.gap = '2px';
                            rating.style.marginLeft = 'auto';

                            const star = document.createElement('span');
                            star.className = 'rating-star';
                            star.innerHTML = '★';
                            star.style.fontSize = '15px'; // Slightly larger star
                            star.style.textShadow = '0px 0px 3px rgba(0, 0, 0, 0.8)';

                            const ratingValue = document.createElement('span');
                            ratingValue.className = 'rating-value';
                            ratingValue.style.fontSize = '13px'; // Slightly larger text
                            ratingValue.style.fontWeight = 'bold';
                            ratingValue.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 1)';
                            ratingValue.style.color = 'white';

                            // Format the rating to show only one decimal place
                            const voteAverage = item.vote_average || 0;
                            const formattedRating = voteAverage !== 0 ? voteAverage.toFixed(1) : 'N/A';
                            ratingValue.textContent = formattedRating;

                            // Set color based on rating
                            if (formattedRating !== 'N/A') {
                                star.style.color = getRatingColor(voteAverage);
                            }

                            // Build the overlay structure
                            rating.appendChild(star);
                            rating.appendChild(ratingValue);
                            overlay.appendChild(titleElement);
                            overlay.appendChild(rating);

                            // Add overlay to the image wrapper
                            imgWrapper.appendChild(overlay);
                            console.log(`Added overlay for ${title}`);
                        }
                    }, 10); // Small delay for rendering
                });

                // Special handling for the trending banner
                if (containerClass === 'trending-container') {
                    const banner = document.getElementById('banner');
                    const play = document.getElementById('play-button');
                    const info = document.getElementById('more-info');
                    const title = document.getElementById('banner-title');

                    // Get all trending movies
                    const bannerMovies = fetchResults.filter(movie => movie.backdrop_path).slice(0, 10); // Take first 10 trending movies with backdrop images

                    let currentBannerIndex = 0;

                    function displayBanner(index) {
                        const movie = bannerMovies[index];
                        banner.src = `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`;
                        title.textContent = movie.title || movie.name || 'Unknown Title';

                        // Update button click events
                        function redirectToMovieDetails() {
                            const media_Type = movie.media_type || 'movie'; // fallback to movie
                            window.location.href = `movie_details/movie_details.html?media=${media_Type}&id=${movie.id}`;
                        }
                        play.onclick = redirectToMovieDetails;
                        info.onclick = redirectToMovieDetails;
                    }

                    // Show first banner
                    if (bannerMovies.length > 0) {
                        displayBanner(currentBannerIndex);

                        // Change banner every 5 seconds
                        setInterval(() => {
                            currentBannerIndex = (currentBannerIndex + 1) % bannerMovies.length;
                            displayBanner(currentBannerIndex);
                        }, 5000);
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });
}

// Initial fetch of movies
fetchMedia('netflix-container', 'discover/tv?with_networks=213', 'tv', true); // Netflix originals with poster_path
fetchMedia('trending-container', 'trending/all/week?');
fetchMedia('top-container', 'movie/top_rated?', 'movie');
fetchMedia('horror-container', 'discover/movie?with_genres=27', 'movie');
fetchMedia('comedy-container', 'discover/movie?with_genres=35', 'movie');
fetchMedia('action-container', 'discover/movie?with_genres=28', 'movie');

// Retrieve watchlist from local storage or create an empty array if it doesn't exist
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Function to handle search input changes
async function handleSearchInput() {
    const query = searchInput.value;
    if (query.length > 2) {
        const results = await fetchSearchResults(query);
        if (results.length !== 0) {
            searchResults.style.visibility = "visible";
        }
        displaySearchResults(results);
    } else {
        searchResults.innerHTML = '';
        searchResults.style.visibility = "hidden";
    }
}

// Event listener for search input changes
searchInput.addEventListener('input', handleSearchInput);

// Event listener for Enter key press in search input
searchInput.addEventListener('keyup', async event => {
    if (event.key === 'Enter') {
        handleSearchInput();
    }
});

// Function to fetch search results from TMDB API
async function fetchSearchResults(query) {
    const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${api_Key}&query=${query}`);
    const data = await response.json();
    return data.results || [];
}

// Function to display search results
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    results.map(movie => {
        // Skip items without poster images
        if (!movie.poster_path) return;

        const shortenedTitle = movie.title || movie.name || 'Unknown Title';
        const date = movie.release_date || movie.first_air_date || '';

        let buttonText = "Add to WatchList"; // Set default button text

        // Check if the movie is already in WatchList
        if (watchlist.find(watchlistItem => watchlistItem.id === movie.id)) {
            buttonText = "Go to WatchList"; // Change button text
        }

        const movieItem = document.createElement('div');
        // Create HTML structure for each movie
        movieItem.innerHTML = `<div class = "search-item-thumbnail">
                                    <img src ="https://image.tmdb.org/t/p/w780${movie.poster_path}">
                                </div>
                                <div class ="search-item-info">
                                    <h3>${shortenedTitle}</h3>
                                    <p>${movie.media_type || 'unknown'} <span> &nbsp; ${date}</span></p>
                                </div>
                                <button class="watchListBtn" id="${movie.id}">${buttonText}</button>`;

        const watchListBtn = movieItem.querySelector('.watchListBtn');

        // Add event listener to WatchList button
        watchListBtn.addEventListener('click', () => {
            if (buttonText === "Add to WatchList") {
                addToWatchList(movie);
            } else {
                window.location.href = 'watchList/watchlist.html'; // Navigate to the WatchList page
            }
        });

        const thumbnail = movieItem.querySelector('.search-item-thumbnail');
        const info = movieItem.querySelector('.search-item-info');

        // Add event listener to navigate to movie details page
        thumbnail.addEventListener('click', () => {
            window.location.href = `movie_details/movie_details.html?media=${movie.media_type}&id=${movie.id}`;
        });

        info.addEventListener('click', () => {
            window.location.href = `movie_details/movie_details.html?media=${movie.media_type}&id=${movie.id}`;
        });

        movieItem.setAttribute('class', 'movie-list');

        // Append movie item to search results
        searchResults.appendChild(movieItem);
    });
}

// Function to add a movie to WatchList
function addToWatchList(movie) {
    // Check if the movie is not already in the WatchList list
    if (!watchlist.find(watchlistItem => watchlistItem.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Store in Local Storage
        const watchListBtn = document.querySelector(`[id="${movie.id}"]`);
        if (watchListBtn) {
            watchListBtn.textContent = "Go to WatchList";
            watchListBtn.addEventListener('click', () => {
                window.location.href = 'watchList/watchlist.html'; // Navigate to the WatchList page
            });
        }
    }
}

// Event listener to close search results when clicking outside
document.addEventListener('click', event => {
    if (!searchResults.contains(event.target)) {
        searchResults.innerHTML = '';
        searchResults.style.visibility = "hidden";
    }
});
