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
const pathMoviesLarge = './../../movies_large/movies.csv';
const pathRatingsLarge = './../../movies_large/ratings.csv';
const pathUsersLarge = './../../movies_large/users.csv';

module.exports = {

  getUsers: async function(req, res) {
    return res.status(200).send(await getUsersJson('demo'));
  },

  getLargeUsers: async function(req, res) {
    return res.status(200).send(await getUsersJson('large'));
  },

  getRecommendations: async function(req, res) {
    const user = req.param('user');
    const size = req.options.locals.size;
    let usersJson = await getUsersJson(size);

    if (user) {

      let userId = getUserId(user, usersJson);

      if ( userId !== 0) {
        let ratingsJson = await getRatingsJson(size);
        let moviesJson = await getMoviesJson(size);

        let userRatedMovies = getRatedMoviesForUser(userId, ratingsJson);
        let otherUsers = getOtherUsers(user, usersJson);

        let userMoviesNotRated = getMoviesNotRated(userRatedMovies, moviesJson);

        let results = [];
        let sumSimiliarty = 0;

        otherUsers.forEach(user => {

          let simIndex = 0;
          let aRatedMovies = getRatedMoviesForUser(userId, ratingsJson);
          let bRatedMovies = getRatedMoviesForUser(user.UserId, ratingsJson);

          if (req.options.locals.act === 'euclidean') {
            simIndex = getEuclidean(aRatedMovies, bRatedMovies, 'movieId');
          }
          if (req.options.locals.act === 'pearson') {
            simIndex = getPearson(aRatedMovies, bRatedMovies);
          }

          let userName = getUserName(user.UserId, usersJson);
          let otherUserRatedMovies = getRatedMoviesForUser(user.UserId, ratingsJson);
          let moviesNotRated = getMoviesNotRated(userRatedMovies, otherUserRatedMovies);
          let weightedScores = getWeightedScoreForMovies(simIndex, moviesNotRated)
          moviesNotRated.sort(sortHighestRatingFirst);
          sumSimiliarty += simIndex;
          let recommendationOrder = getMoviesWithNames(moviesNotRated, moviesJson);
          results.push({user: userName, simIndex: simIndex, recommendationOrder: recommendationOrder, weightedScores: weightedScores});
          results.sort(sortHighestEuclValueFirst);
        });

        let weightedMovieScores = userMoviesNotRated.map(movie => {
          let weightedScore = 0;
          let sim = sumSimiliarty;
          results.forEach(user => {
            if (user.weightedScores.filter(mov => mov.MovieId === movie.MovieId)) {
              let actualMovie = user.weightedScores.find(movie2 => movie2.MovieId === movie.MovieId);
              if (actualMovie) {
                if (actualMovie.WeightedScore > 0) { //pearson check
                  weightedScore+= actualMovie.WeightedScore;
                } else {
                  sim -= user.simIndex;
                }
              } else {
                sim -= user.simIndex;
              }
            }
          });
          let currentMovie = getMovieFromId(movie.MovieId, moviesJson)
          return {Title: currentMovie.Title, MovieId: currentMovie.MovieId, RecommendValue: weightedScore/sim}
        });
        weightedMovieScores.sort(sortHighestRecommendValue);

        return res.status(200).json({recommended: weightedMovieScores, result: results});
      }
    }

  },
  itembased: async function(req, res) {
    const user = req.param('user');
    const size = req.options.locals.size;
    let usersJson = await getUsersJson(size);

    if (user) {

      let userId = getUserId(user, usersJson);

      if ( userId !== 0) {

        let ratingsJson = await getRatingsJson(size);
        let moviesJson = await getMoviesJson(size);
        let userRatedMovies = getRatedMoviesForUser(userId, ratingsJson);
        let moviesSimIndexValues = [];

        userRatedMovies.forEach(movie => {
          let simIndexValues = [];
          let movieRatings = getRatingsForMovie(movie.MovieId, ratingsJson);
          let otherMovies = getOtherMovies(movie.MovieId, moviesJson);
          otherMovies.forEach(movie => {
            let otherMovieRatings = getRatingsForMovie(movie.MovieId, ratingsJson);
            simIndexValues.push({Title: movie.Title, MovieId: movie.MovieId, value: getEuclidean(movieRatings, otherMovieRatings, 'userId')});
          });
          moviesSimIndexValues.push({userRating: movie.Rating, Title: getMovieFromId(movie.MovieId, moviesJson).Title, MovieId: movie.MovieId, simIndexValues});
        });

        let userMoviesNotRated = getMoviesNotRated(userRatedMovies, moviesJson);
        let simForMovies = [];
        userMoviesNotRated.forEach(movieNotRated => {
          let simValue = 0;
          let wrValue = 0;
          moviesSimIndexValues.forEach(movieRated => {
            movieRated.simIndexValues.forEach(movie => {
              if (movie.MovieId === movieNotRated.MovieId) {
                simValue += movie.value;
                wrValue += movie.value*movieRated.userRating;
              }
            });
          });
          simForMovies.push({Title: movieNotRated.Title, MovieId: movieNotRated.MovieId, RecommendValue: wrValue/simValue});
        });

        simForMovies.sort(sortHighestRecommendValue);
        return res.status(200).json({recommended: simForMovies, result: []});

      }
    }
  },
};


async function getUsersJson(size) {
  return (size === 'large') ? await csv({delimiter: ';'}).fromFile(__dirname + pathUsersLarge) : await csv({delimiter: ';'}).fromFile(__dirname + pathUsers);
}

async function getMoviesJson(size) {
  return (size === 'large') ? await csv({delimiter: ';'}).fromFile(__dirname + pathMoviesLarge) : await csv({delimiter: ';'}).fromFile(__dirname + pathMovies);
}

async function getRatingsJson(size) {
  return (size === 'large') ? await csv({delimiter: ';'}).fromFile(__dirname + pathRatingsLarge) : await csv({delimiter: ';'}).fromFile(__dirname + pathRatings);
}

function getOtherMovies(id, movies) {
  return movies.filter(movie => {
    return movie.MovieId !== id;
  });
}

function getWeightedScoreForMovies(simIndex, moviesNotRated) {
  return moviesNotRated.map(movie => {
    return {MovieId: movie.MovieId, WeightedScore: movie.Rating*simIndex}
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

function getRatingsForMovie(id, ratings) {
  return ratings.filter(rating => {
    return rating.MovieId === id;
  });

}


function sortHighestEuclValueFirst(a, b) {
  if (a.simIndex > b.simIndex) {
    return -1;
  } else {
    if (a.simIndex < b.simIndex) {
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

function getPearson(aRatedMovies, bRatedMovies) {
  let sum1 = 0;
  let sum2 = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;
  let pSum = 0;
  let n = 0;
  let den = 0;

  aRatedMovies.forEach(aMovie => {
    bRatedMovies.forEach(bMovie => {
      if (aMovie.MovieId === bMovie.MovieId) {
        sum1 += Number(aMovie.Rating);
        sum2 += Number(bMovie.Rating);
        sum1Sq += Math.pow(Number(aMovie.Rating), 2);
        sum2Sq += Math.pow(Number(bMovie.Rating), 2);
        pSum += aMovie.Rating * bMovie.Rating;
        n += 1;
      }
    });
  });

  if (n === 0) {
    return 0;
  }

  num = pSum - (sum1 * sum2 / n);
  den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) * (sum2Sq - Math.pow(sum2, 2) / n ));
  return num/den;
}

function getEuclidean(aRatedMovies, bRatedMovies, action) {

  let sim = 0;
  let n = 0;

  aRatedMovies.forEach(aMovie => {
    bRatedMovies.forEach(bMovie => {
      if (action === 'movieId'){
        if (aMovie.MovieId === bMovie.MovieId) {
          sim += Math.pow((aMovie.Rating - bMovie.Rating), 2);
          n += 1;
        }
      } else {
        if (aMovie.UserId === bMovie.UserId) {
          sim += Math.pow((aMovie.Rating - bMovie.Rating), 2);
          n += 1;
        }
      }

    });
  });
  return (n === 0) ? 0 : 1 / (1 + sim);
}
