export function setAppBounced(app) {
  let bounceId = app.dock.bounce();
  app.on('ready', () => {
    app.dock.cancelBounce(bounceId);
  })
};
