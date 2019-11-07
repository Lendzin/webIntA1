/**
 * ItemsControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  euclidean: async function(req, res) {
    return res.status(200).json({data: 'euclidean'});
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

