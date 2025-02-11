module.exports = function (settings, trigger) {
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  // Override dataLayer.push to capture all pushes
  const originalPush = window.dataLayer.push;
  window.dataLayer.push = function (...args) {
    originalPush.apply(this, args); // Call the original push
    console.log("dataLayer.push called with:", args);

    // Trigger the rule for each push
    trigger({
      pushData: args[0],
    });
  };

  console.log("dataLayerPush event listener initialized.");
};
