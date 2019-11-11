/**
 * ItemsControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const csv = require('csvtojson');
const pathMovies = './../../movies_example/movies.csv';
const pathRatings = './../../movies_example/ratings.csv';
const pathUsers = './../../movies_example/users.csv';

module.exports = {

  euclidean: async function(req, res) {
    const user = req.param('user');

    let usersJson = await csv({delimiter: ';'}).fromFile(__dirname + pathUsers);

    if (user) {

      let userId = getUserId(user, usersJson);

      if ( userId !== 0) {
        let ratingsJson = await csv({delimiter: ';'}).fromFile(__dirname + pathRatings);
        let moviesJson= await csv({delimiter: ';'}).fromFile(__dirname + pathMovies);

        let userRatedMovies = getRatedMoviesForUser(userId, ratingsJson);
        let otherUsers = getOtherUsers(user, usersJson);

        let results = [];

        otherUsers.forEach(user =>{
          let eucValue = getEuclidean(userId, user.UserId, ratingsJson);
          let userName = getUserName(user.UserId, usersJson);
          let otherUserRatedMovies = getRatedMoviesForUser(user.UserId, ratingsJson);
          let moviesNotRated = getMoviesNotRated(userRatedMovies, otherUserRatedMovies);
          moviesNotRated.sort(sortHighestRatingFirst);
          let recommendationOrder = getMoviesWithNames(moviesNotRated, moviesJson);
          results.push({user: userName, eucValue: eucValue, recommendationOrder: recommendationOrder})
          results.sort(sortHighestEuclValueFirst);
        });

        return res.status(200).json(results);
      }
    }

  },
  pearson: async function(req, res) {
    return res.status(200).json({test: 'pearson'});
  },
  itembased: async function(req, res) {
    return res.status(200).json({test: 'itembased'});
  },
  userbased: async function(req, res) {
    return res.status(200).json({test: 'userbased'});
  },
};


function sortHighestEuclValueFirst(a, b) {
  if (a.eucValue > b.eucValue) {
    return -1;
  } else {
    if (a.eucValue < b.eucValue) {
      return 1;
    }
    return 0;
  }
}

function sortHighestRatingFirst(a, b) {
  if (a.Rating > b.Rating) {
    return -1;
  } else {
    if (a.Rating < b.Rating) {
      return 1;
    }
    return 0;
  }
}
function getUserId(name, users) {

  let user = users.find(user => {
    return user.Name === name;
  });

  return (user === undefined) ? 0 : user.UserId;
}

function getUserName(id, users) {

  let user = users.find(user => {
    return user.UserId === id;
  });

  return (user === undefined) ? 0 : user.Name;
}

function getRatedMoviesForUser(id, ratings) {

  return ratings.filter(rating => {
    return rating.UserId === id;
  });
}

function getOtherUsers(name, users) {

  let otherUsers = users.filter(user => {
    return user.Name !== name;
  });

  return otherUsers;
}

function getMoviesNotRated(ratings1, ratings2) {
  let movieIds = ratings1.map(movie => {
    return movie.MovieId;
  });

  let moviesNotRated = ratings2.filter(movie => {

    return !movieIds.includes(movie.MovieId);

  });

  return moviesNotRated;
}
function getMoviesWithNames(movies, moviesJson) {

  return movies.map(movie => {
    let actualMovie = JSON.parse(JSON.stringify(getMovieFromId(movie.MovieId, moviesJson)));
    actualMovie.Rating = movie.Rating;
    return actualMovie;
  });
}

function getMovieFromId(id, movies) {

  let movie = movies.find(movie => {
    return movie.MovieId === id;
  });

  return (movie === undefined) ? 0 : movie;
}


function getEuclidean(userA, userB, ratings) {
  let aRatedMovies = getRatedMoviesForUser(userA, ratings);
  let bRatedMovies = getRatedMoviesForUser(userB, ratings);
  let sim = 0;
  let n = 0;

  aRatedMovies.forEach(aMovie => {
    bRatedMovies.forEach(bMovie => {
      if (aMovie.MovieId === bMovie.MovieId) {
        sim += Math.pow((aMovie.Rating - bMovie.Rating), 2);
        n += 1;
      }
    });
  });
  return (n === 0) ? 0 : 1 / (1 + sim);
}
