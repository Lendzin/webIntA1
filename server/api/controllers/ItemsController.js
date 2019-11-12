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

  getUsers: async function(req, res) {
    return res.status(200).send(await csv({delimiter: ';'}).fromFile(__dirname + pathUsers));
  },

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

        let userMoviesNotRated = getMoviesNotRated(userRatedMovies, moviesJson);

        let results = [];
        let sumSimiliarty = 0;
        let sumWeighted = 0;

        otherUsers.forEach(user => {
          let eucValue = getEuclidean(userId, user.UserId, ratingsJson);
          let userName = getUserName(user.UserId, usersJson);
          let otherUserRatedMovies = getRatedMoviesForUser(user.UserId, ratingsJson);
          let moviesNotRated = getMoviesNotRated(userRatedMovies, otherUserRatedMovies);
          let weightedScores = getWeightedScoreForMovies(eucValue, moviesNotRated)
          moviesNotRated.sort(sortHighestRatingFirst);
          sumSimiliarty += eucValue;
          let recommendationOrder = getMoviesWithNames(moviesNotRated, moviesJson);
          results.push({user: userName, eucValue: eucValue, recommendationOrder: recommendationOrder, weightedScores: weightedScores})
          results.sort(sortHighestEuclValueFirst);
        });

        
        let weightedMovieScores = userMoviesNotRated.map(movie => {
          let weightedScore = 0;
          let sim = sumSimiliarty;
          results.forEach(user => {
            if (user.weightedScores.filter(mov => mov.MovieId === movie.MovieId)) {
              let actualMovie = user.weightedScores.find(movie2 => movie2.MovieId === movie.MovieId);
              if (actualMovie) {
                weightedScore+= actualMovie.WeightedScore;
              } else {
                sim -= user.eucValue;
              }
              
            }
          });
          return {MovieId: getMovieFromId(movie.MovieId, moviesJson), RecommendValue: weightedScore/sim}
        });
        weightedMovieScores.sort(sortHighestRecommendValue);

        return res.status(200).json({recommended: weightedMovieScores, result: results});
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

function getWeightedScoreForMovies(eucValue, moviesNotRated) {
  return moviesNotRated.map(movie => {
    return {MovieId: movie.MovieId, WeightedScore: movie.Rating*eucValue}
  });
}

function sortHighestRecommendValue(a, b) {
  if (a.RecommendValue > b.RecommendValue) {
    return -1;
  } else {
    if (a.RecommendValue < b.RecommendValue) {
      return 1;
    }
    return 0;
  }
}


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
