const { DEFAULT_SCRIPT_ID } = require("./data/scripts");

App({
  globalData: {
    session: {
      userId: "dev_001",
      currentStep: 1,
      history: [],
      isCheckInComplete: false,
      landmarkId: "",
      composedImagePath: "",
      scriptId: DEFAULT_SCRIPT_ID
    }
  },

  onLaunch() {
    if (!wx.cloud) {
      return;
    }

    try {
      wx.cloud.init({
        traceUser: true
      });
    } catch (err) {
      // Keep app usable in simulator even if cloud env is not ready.
      console.warn("cloud init failed:", err);
    }
  },

  resetSession(landmarkId = "", scriptId) {
    const currentScriptId = scriptId || this.globalData.session.scriptId || DEFAULT_SCRIPT_ID;
    this.globalData.session = {
      userId: "dev_001",
      currentStep: 1,
      history: [],
      isCheckInComplete: false,
      landmarkId,
      composedImagePath: "",
      scriptId: currentScriptId
    };
  },

  setActiveScript(scriptId) {
    if (!scriptId) {
      return;
    }
    this.globalData.session.scriptId = scriptId;
  }
});
