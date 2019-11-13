/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  'get /': {
    view: 'assets/index.html'
  },
  //ITEM CONTROLLER
  'get /item/users': {
    controller: 'ItemsController',
    action: 'getUsers'
  },

  'get /item/large/users': {
    controller: 'ItemsController',
    action: 'getLargeUsers'
  },

  'get /item/movies': {
    controller: 'ItemsController',
    action: 'getMovies'
  },

  'get /item/large/movies': {
    controller: 'ItemsController',
    action: 'getLargeMovies'
  },

  'get /item/euclidean/:user': {
    controller: 'ItemsController',
    action: 'getRecommendations',
    locals: {
      size: 'demo',
      act: 'euclidean'
    }
  },

  'get /item/pearson/:user': {
    controller: 'ItemsController',
    action: 'getRecommendations',
    locals: {
      size: 'demo',
      act: 'pearson'
    }
  },

  'get /item/large/pearson/:user': {
    controller: 'ItemsController',
    action: 'getRecommendations',
    locals: {
      size: 'large',
      act: 'pearson'
    }
  },

  'get /item/large/euclidean/:user': {
    controller: 'ItemsController',
    action: 'getRecommendations',
    locals: {
      size: 'large',
      act: 'euclidean'
    }
  },

  'get /item/itembased/:user': {
    controller: 'ItemsController',
    action: 'itembased',
    locals: {
      size: 'demo'
    }
  },

  'get /item/large/itembased/:user': {
    controller: 'ItemsController',
    action: 'itembased',
    locals: {
      size: 'large'
    }
  },


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
