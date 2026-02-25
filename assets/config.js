/* ==========================================================
   Aspen Meridian — config.js
   PURPOSE:
   - This is the ONLY file you need to edit for “site settings”
   - Replace the values marked  ##PUT_YOURS_HERE##  (including quotes)
   - Do NOT duplicate this file contents (only one window.ASPEN_CONFIG)
   ========================================================== */

window.ASPEN_CONFIG = {
  /* --------------------------
     BRAND / TEXT
     -------------------------- */
  // Replace with your exact brand name
  BRAND_NAME: "##PUT_YOUR_BRAND_NAME_HERE##", // e.g. "ASPEN MERIDIAN"

  // Replace the year (and optionally the whole tagline)
  EST_YEAR: "##PUT_EST_YEAR_HERE##", // e.g. "2000"
  TAGLINE_TOP: "FORENSIC DIGITAL INVESTIGATIONS • PRIVATE INTELLIGENCE • EST. ##PUT_EST_YEAR_HERE##",

  /* --------------------------
     CONTACT DETAILS (DISPLAY)
     -------------------------- */
  // The email address shown on the site (footer + header areas)
  EMAIL_DISPLAY: "##PUT_YOUR_INBOX_EMAIL_HERE##", // e.g. "enquiries@aspenmeridian.im"

  // Phone number shown on the site
  PHONE_DISPLAY: "07624 48 80 97",

  // Phone number used for the clickable tel: link (international format recommended)
  PHONE_TEL: "+447624488097",

  // Optional address line shown (if you use it in pages later)
  ADDRESS_LINE: "##PUT_ADDRESS_LINE_HERE_OR_LEAVE_BLANK##", // e.g. "##Registered Office##, Douglas, Isle of Man"
  JURISDICTION_LINE: "Isle of Man",

  /* --------------------------
     FORM DELIVERY (IMPORTANT)
     -------------------------- */
  // This is the endpoint that ACTUALLY receives the form submission.
  // For Formspree, it looks like: https://formspree.io/f/abcdwxyz
  // Put your real Formspree endpoint here:
  FORM_ENDPOINT: "##PASTE_YOUR_FORMSPREE_ENDPOINT_HERE##",

  /* --------------------------
     LEGAL NOTICES MODAL
     -------------------------- */
  // If true, shows the Legal Notices modal on first visit only
  SHOW_LEGAL_MODAL_ON_FIRST_VISIT: true,

  // Cookie name + duration used to remember that they acknowledged the modal
  LEGAL_COOKIE_NAME: "am_legal_notice_viewed",
  LEGAL_COOKIE_DAYS: 365,

  // Footer version label (displayed on some pages)
  LEGAL_VERSION_LABEL: "Current as of February 2026",

  /* --------------------------
     OPTIONAL SOCIAL LINKS
     -------------------------- */
  // Leave as "" if you don’t want to show them anywhere
  LINKEDIN_URL: "##PUT_LINKEDIN_URL_HERE_OR_LEAVE_BLANK##",
  X_URL: "##PUT_X_URL_HERE_OR_LEAVE_BLANK##"
};

/* ==========================================================
   EXAMPLE (so you can see a correct real-world config)
   ----------------------------------------------------------
   window.ASPEN_CONFIG = {
     BRAND_NAME: "ASPEN MERIDIAN",
     EST_YEAR: "2000",
     TAGLINE_TOP: "FORENSIC DIGITAL INVESTIGATIONS • PRIVATE INTELLIGENCE • EST. 2000",
     EMAIL_DISPLAY: "enquiries@aspenmeridian.im",
     PHONE_DISPLAY: "07624 48 80 97",
     PHONE_TEL: "+447624488097",
     ADDRESS_LINE: "",
     JURISDICTION_LINE: "Isle of Man",
     FORM_ENDPOINT: "https://formspree.io/f/abcdwxyz",
     SHOW_LEGAL_MODAL_ON_FIRST_VISIT: true,
     LEGAL_COOKIE_NAME: "am_legal_notice_viewed",
     LEGAL_COOKIE_DAYS: 365,
     LEGAL_VERSION_LABEL: "Current as of February 2026",
     LINKEDIN_URL: "",
     X_URL: ""
   };
   ========================================================== */
