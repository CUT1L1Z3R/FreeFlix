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

document.getElementById('change-server-btn').addEventListener('click', () => {
  document.getElementById('server-selector').style.display = 'block';
});

document.getElementById('server-selector').addEventListener('click', (e) => {
  if (e.target !== document.getElementById('server')) {
    document.getElementById('server-selector').style.display = 'none';
  }
});

document.getElementById('server').addEventListener('change', () => {
  document.getElementById('server-selector').style.display = 'none';
});

// Function to handle video source change based on selected server
async function changeServer() {
    const server = document.getElementById('server').value; // Get the selected server
    const type = media === "movie" ? "movie" : "tv"; // Movie or TV type
    let embedURL = "";  // URL to embed video from the selected server

    // Set the video URL depending on the selected server
    switch (server) {
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
        default:
            console.error("Selected server is not supported.");
            break;
    }

    // If no URL was created, fallback to a default one
    if (!embedURL) {
        embedURL = "https://defaultserver.com/defaultEmbedUrl";  // Example fallback
    }

    // Update the iframe source with the correct video URL
    iframe.src = embedURL;

    // Ensure iframe is visible and correctly sized
    iframe.style.display = "block";  // Show the iframe
    iframe.style.width = "100%"; // or adjust to a fixed size
    iframe.style.height = "400px"; // or adjust height as needed

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
        moviePoster.src = `https://image.tmdb.org/t/p/w500${movieDetails.backdrop_path}`;
        movieYear.textContent = `${movieDetails.release_date || movieDetails.first_air_date}`;
        rating.textContent = movieDetails.vote_average;

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
