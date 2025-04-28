// Selecting the logo element and adding a click event listener to navigate to the homepage
const logo = document.querySelector('.logo');
logo.addEventListener('click', () => {
    window.location.href = '../index.html';
});

// Selecting various elements on the page for displaying movie details
const movieTitle = document.getElementById('movieTitle');
const moviePoster = document.getElementById('moviePoster');
const movieYear = document.getElementById('movieYear');
const rating = document.getElementById('rating');
const genre = document.getElementById('genre');
const plot = document.getElementById("plot");
const language = document.getElementById("language");
const iframe = document.getElementById("iframe");
const watchListBtn = document.querySelector('.watchListBtn');
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Season and Episode selectors
const seasonsContainer = document.getElementById('seasons-container');
const seasonSelect = document.getElementById('season-select');
const episodesList = document.getElementById('episodes-list');

// API key for TMDB API
const api_Key = 'e79515e88dfd7d9f6eeca36e49101ac2';

// Retrieve the TMDb ID and Media from the URL parameter
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const media = params.get("media");

// Function to fetch detailed information using its TMDb ID
async function fetchMovieDetails(id) {
    const response = await fetch(`https://api.themoviedb.org/3/${media}/${id}?api_key=${api_Key}`);
    const data = await response.json();
    return data;
}

// Function to fetch video details (trailers) for a movie or TV show
async function fetchVideoDetails(id) {
    const response = await fetch(`https://api.themoviedb.org/3/${media}/${id}/videos?api_key=${api_Key}`);
    const data = await response.json();
    return data.results;
}

// Function to fetch TV show seasons
async function fetchTVSeasons(id) {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${api_Key}`);
    const data = await response.json();
    return data.seasons;
}

// Function to fetch episodes for a specific season
async function fetchSeasonEpisodes(tvId, seasonNumber) {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${api_Key}`);
    const data = await response.json();
    return data.episodes;
}

document.getElementById('change-server-btn').addEventListener('click', () => {
    const serverSelector = document.getElementById('server-selector');
    serverSelector.style.display = (serverSelector.style.display === 'block') ? 'none' : 'block';

    // Log current state for debugging
    console.log(`Current media type: ${media}, ID: ${id}`);
    if (media === "tv") {
        const activeEpisode = document.querySelector('.episode-item.active');
        if (activeEpisode) {
            console.log(`Active episode - Season: ${activeEpisode.dataset.seasonNumber}, Episode: ${activeEpisode.dataset.episodeNumber}`);
        }
    }
});

document.getElementById('server-selector').addEventListener('click', (e) => {
  if (e.target !== document.getElementById('server')) {
    document.getElementById('server-selector').style.display = 'none';
  }
});

// Add event listener for the close button
document.querySelector('.close-button').addEventListener('click', () => {
  document.getElementById('server-selector').style.display = 'none';
});

document.getElementById('server').addEventListener('change', () => {
    changeServer();
    document.getElementById('server-selector').style.display = 'none'; // Hide dropdown after selection
});

// Function to create season dropdown items
function createSeasonOptions(seasons) {
    seasonSelect.innerHTML = '';

    seasons.forEach(season => {
        // Skip season 0 which is typically for specials
        if (season.season_number > 0) {
            const option = document.createElement('option');
            option.value = season.season_number;
            option.textContent = `Season ${season.season_number} (${season.episode_count} Episodes)`;
            seasonSelect.appendChild(option);
        }
    });

    // Set up event listener for season selection
    seasonSelect.addEventListener('change', function() {
        const selectedSeason = this.value;
        loadEpisodes(id, selectedSeason);
    });

    // Load the first season episodes by default
    if (seasons.length > 0) {
        // Find the first regular season (season_number > 0)
        const firstSeason = seasons.find(season => season.season_number > 0);
        if (firstSeason) {
            loadEpisodes(id, firstSeason.season_number);
        }
    }
}

// Function to create episode list items
function createEpisodesList(episodes) {
    episodesList.innerHTML = '';

    episodes.forEach(episode => {
        const episodeItem = document.createElement('div');
        episodeItem.className = 'episode-item';
        episodeItem.dataset.episodeNumber = episode.episode_number;
        episodeItem.dataset.seasonNumber = episode.season_number;

        // Create thumbnail container
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.className = 'thumbnail-container';

        // Create thumbnail image
        const thumbnail = document.createElement('img');
        thumbnail.className = 'episode-thumbnail';
        thumbnail.src = episode.still_path
            ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
            : 'https://via.placeholder.com/300x170?text=No+Image';
        thumbnail.alt = `${episode.name} Thumbnail`;

        // Create episode number badge
        const episodeNumber = document.createElement('div');
        episodeNumber.className = 'episode-number';
        episodeNumber.textContent = episode.episode_number;

        // Add thumbnail and number to container
        thumbnailContainer.appendChild(thumbnail);
        thumbnailContainer.appendChild(episodeNumber);

        // Create episode info container
        const episodeInfo = document.createElement('div');
        episodeInfo.className = 'episode-info';

        // Create episode title
        const episodeTitle = document.createElement('div');
        episodeTitle.className = 'episode-title';
        episodeTitle.textContent = episode.name;

        // Create episode description
        const episodeDescription = document.createElement('div');
        episodeDescription.className = 'episode-description';
        episodeDescription.textContent = episode.overview || 'No description available.';

        // Add title and description to info container
        episodeInfo.appendChild(episodeTitle);
        episodeInfo.appendChild(episodeDescription);

        // Add all elements to episode item
        episodeItem.appendChild(thumbnailContainer);
        episodeItem.appendChild(episodeInfo);

        // Add click event to play the episode
        episodeItem.addEventListener('click', () => {
            playEpisode(id, episode.season_number, episode.episode_number);
        });

        episodesList.appendChild(episodeItem);
    });
}

// Function to load episodes for a specific season
async function loadEpisodes(tvId, seasonNumber) {
    try {
        const episodes = await fetchSeasonEpisodes(tvId, seasonNumber);
        createEpisodesList(episodes);
    } catch (error) {
        console.error('Error loading episodes:', error);
        episodesList.innerHTML = '<p>Error loading episodes. Please try again.</p>';
    }
}

// Function to play a specific episode
function playEpisode(tvId, seasonNumber, episodeNumber) {
    const server = document.getElementById('server').value;
    let embedURL = "";

    // Update the URL for each server to include season and episode parameters
    switch (server) {
        case "vidlink.pro":
            embedURL = `https://vidlink.pro/tv/${tvId}/${seasonNumber}/${episodeNumber}?primaryColor=63b8bc&iconColor=ffffff&autoplay=false`;
            break;
        case "vidsrc.cc":
            embedURL = `https://vidsrc.cc/v2/embed/tv/${tvId}/${seasonNumber}/${episodeNumber}`;
            break;
        case "vidsrc.me":
            embedURL = `https://vidsrc.net/embed/tv/?tmdb=${tvId}&season=${seasonNumber}&episode=${episodeNumber}`;
            break;
        case "player.videasy.net":
            embedURL = `https://player.videasy.net/tv/${tvId}/${seasonNumber}/${episodeNumber}`;
            break;
        case "2embed":
            embedURL = `https://www.2embed.cc/embedtv/${tvId}&s=${seasonNumber}&e=${episodeNumber}`;
            break;
        case "movieapi.club":
            embedURL = `https://moviesapi.club/tv/${tvId}/${seasonNumber}/${episodeNumber}`;
            break;
        default:
            console.error("Selected server is not supported.");
            break;
    }

    if (embedURL) {
        // Log the URL for debugging
        console.log(`Loading TV episode from: ${embedURL}`);

        // Update the iframe source with the episode URL
        iframe.src = embedURL;
        iframe.style.display = "block";
        moviePoster.style.display = "none";

        // Mark the selected episode as active
        const episodes = document.querySelectorAll('.episode-item');
        episodes.forEach(item => item.classList.remove('active'));

        const currentEpisode = document.querySelector(`.episode-item[data-episode-number="${episodeNumber}"]`);
        if (currentEpisode) {
            currentEpisode.classList.add('active');
        }

        // Scroll to top of video for better mobile experience
        if (window.innerWidth <= 740) {
            window.scrollTo({
                top: iframe.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    }
}

// Function to handle video source change based on selected server
async function changeServer() {
    const server = document.getElementById('server').value; // Get the selected server
    const type = media === "movie" ? "movie" : "tv"; // Movie or TV type

    // Check if we're viewing a TV show with episode selected
    if (type === "tv" && seasonsContainer.style.display === "flex") {
        // If an episode is already selected (playing), update it with the new server
        const activeEpisode = document.querySelector('.episode-item.active');
        if (activeEpisode) {
            const seasonNumber = activeEpisode.dataset.seasonNumber;
            const episodeNumber = activeEpisode.dataset.episodeNumber;
            playEpisode(id, seasonNumber, episodeNumber);
            return;
        }
    }

    let embedURL = "";  // URL to embed video from the selected server

    // Set the video URL depending on the selected server
    switch (server) {
        case "vidlink.pro":
            if (type === "tv") {
                // For TV shows, default to first episode of first season
                embedURL = `https://vidlink.pro/tv/${id}/1/1?primaryColor=63b8bc&iconColor=ffffff&autoplay=false`;
            } else {
                embedURL = `https://vidlink.pro/movie/${id}?primaryColor=63b8bc&iconColor=ffffff&autoplay=false`;
            }
            break;
        case "vidsrc.cc":
            embedURL = `https://vidsrc.cc/v2/embed/${type}/${id}`;
            break;
        case "vidsrc.me":
            embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${id}`;
            break;
        case "player.videasy.net":
            embedURL = `https://player.videasy.net/${type}/${id}`;
            break;
        case "2embed":
            embedURL = `https://www.2embed.cc/embed/${id}`;
            break;
        case "movieapi.club":
            embedURL = `https://moviesapi.club/${type}/${id}`;
            break;
        default:
            console.error("Selected server is not supported.");
            break;
    }

    // If no URL was created, fallback to a default one
    if (!embedURL) {
        embedURL = "https://defaultserver.com/defaultEmbedUrl";  // Example fallback
    }

    // Log the URL for debugging
    console.log(`Loading ${type} from: ${embedURL}`);

    // Update the iframe source with the correct video URL
    iframe.src = embedURL;

    // Ensure iframe is visible and correctly sized
    iframe.style.display = "block";  // Show the iframe

    // Set responsive height based on device width
    if (window.innerWidth <= 560) {
        iframe.style.height = "250px";
    } else if (window.innerWidth <= 740) {
        iframe.style.height = "300px";
    } else if (window.innerWidth <= 840) {
        iframe.style.height = "350px";
    } else if (window.innerWidth <= 924) {
        iframe.style.height = "300px";
    } else if (window.innerWidth <= 1024) {
        iframe.style.height = "350px";
    } else {
        iframe.style.height = "400px";
    }

    iframe.style.width = (window.innerWidth <= 740) ? "95%" : "100%";

    // Hide the movie poster when the video is playing
    moviePoster.style.display = "none";  // Hide the movie poster image
}

// Function to display movie details on the page
async function displayMovieDetails() {
    try {
        const movieDetails = await fetchMovieDetails(id);

        var spokenlanguage = movieDetails.spoken_languages.map(language => language.english_name);
        language.textContent = spokenlanguage.join(', ');

        var genreNames = movieDetails.genres.map(genre => genre.name);
        genre.innerText = genreNames.join(', ');

        movieDetails.overview.length > 290
            ? plot.textContent = `${movieDetails.overview.substring(0, 290)}...`
            : plot.textContent = movieDetails.overview;

        movieTitle.textContent = movieDetails.name || movieDetails.title;

        if (movieDetails.backdrop_path) {
            moviePoster.src = `https://image.tmdb.org/t/p/w500${movieDetails.backdrop_path}`;
        } else if (movieDetails.poster_path) {
            moviePoster.src = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;
        } else {
            moviePoster.src = 'https://via.placeholder.com/500x281?text=No+Image+Available';
        }

        movieYear.textContent = `${movieDetails.release_date || movieDetails.first_air_date}`;
        rating.textContent = movieDetails.vote_average;

        // If this is a TV show, setup the seasons and episodes section
        if (media === "tv") {
            const seasons = await fetchTVSeasons(id);
            if (seasons && seasons.length > 0) {
                createSeasonOptions(seasons);
                // Display the seasons container
                seasonsContainer.style.display = "flex";
            }
        }

        // Call the changeServer function to update the video source
        changeServer();

        // Updating the favorite button text and adding a click event listener to toggle favorites
        if (watchlist.some(favoriteMovie => favoriteMovie.id === movieDetails.id)) {
            watchListBtn.textContent = "Remove From WatchList";
        } else {
            watchListBtn.textContent = "Add To WatchList";
        }

        watchListBtn.addEventListener('click', () => toggleFavorite(movieDetails));

    } catch (error) {
        console.error('Error displaying movie details:', error);
        movieTitle.textContent = "Details are not available right now! Please try after some time.";
    }
}

// Function to toggle adding/removing from favorites
function toggleFavorite(movieDetails) {
    const index = watchlist.findIndex(movie => movie.id === movieDetails.id);
    if (index !== -1) {
        watchlist.splice(index, 1);
        watchListBtn.textContent = "Add To WatchList";
    } else {
        watchlist.push(movieDetails);
        watchListBtn.textContent = "Remove From WatchList";
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

// Call the function to display movie details when the page loads
window.addEventListener('load', () => {
    displayMovieDetails();
});

// Function to handle changes when server selection is made
document.getElementById('server').addEventListener('change', () => {
    changeServer();
});

// Add window resize listener to ensure responsive video size
window.addEventListener('resize', () => {
    // Only update if iframe is visible
    if (iframe.style.display === "block") {
        changeServer();
    }
});
