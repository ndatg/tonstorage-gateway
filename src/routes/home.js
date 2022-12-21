module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => h.view('index'),
  },
];
