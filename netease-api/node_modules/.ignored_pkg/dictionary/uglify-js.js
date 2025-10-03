'use strict';

module.exports = {
  pkg: {
    // assets, not scripts because of custom
    // load_global (readFileSync + runInContext)
    assets: ['lib/**/*.js', 'tools/*.js'],
  },
};
