import packageJson from "./package.json" assert { type: "json" };

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  name: "Number One (NB1)",
  version: packageJson.version,
  description: packageJson.description,
  permissions: [
    "storage",
    "sidePanel",
    "tabs",
    "activeTab",
    "scripting",
    "clipboardWrite",
    "debugger",
    "management",
    "cookies",
  ],
  host_permissions: ["<all_urls>"],
  side_panel: {
    default_path: "src/pages/sidepanel/index.html",
  },
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_title: "Click to open side panel",
    default_icon: "icon-128.png",
  },
  icons: {
    128: "icon-128.png",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      css: ["assets/css/contentStyleGlobal.css"],
      run_at: "document_start",
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "assets/fonts/*",
        "icon-128.png",
        "sphere.png",
        "sphere.gif",
        "src/pages/permission/index.html",
        "src/pages/permission/requestPermissions.ts",
        "src/pages/tasks/index.html",
      ],
      matches: ["*://*/*"],
    },
  ],
};

export default manifest;
