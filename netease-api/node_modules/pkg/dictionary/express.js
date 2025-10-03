'use strict';

module.exports = {
  pkg: {
    patches: {
      'lib/view.js': [
        'path = join(this.root, path)',
        'path = process.pkg.path.resolve(this.root, path)', // for 3.x
        'loc = resolve(root, name)',
        'loc = process.pkg.path.resolve(root, name)', // for 4.x
      ],
    },
  },
};
