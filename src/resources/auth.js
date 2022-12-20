const Boom = require('@hapi/boom');

module.exports = {
  signin(request, h) {
    if (request.auth.isAuthenticated) {
      const user = request.auth.credentials.profile;
      const data = { name: user.displayName, username: user.username };
      request.cookieAuth.set(data);

      return h.response({
        statusCode: 200,
        message: 'Authenticated',
      });
    }

    throw Boom.boomify(new Error('Could not authenticate with GitHub'), { statusCode: 400 });
  },

  signout(request, h) {
    request.cookieAuth.clear();
    return h.response({
      statusCode: 200,
      message: 'Successful signout',
    });
  },
};
