// /* =====================================================================
//    CEVOLVE · CONTACT-US PAGE
//    1. LOCATIONS  → edit addresses / coords here only
//    2. World map: inert countries, rippling markers, address tooltip
//    3. Office cards (View on map → Google Maps)
//    4. Header + form (same EmailJS flow as index.html)
//    ===================================================================== */

// /* ---------------------------------------------------------------------
//    1 · OFFICE DATA  ← the only block you normally need to touch.
//    coords: [latitude, longitude]  (Google Maps: right-click a pin →
//    the first number is lat, the second is lng)
//    NOTE: street lines below are placeholders — swap in the real ones.
//    --------------------------------------------------------------------- */
// // const LOCATIONS = [
// //   {
// //     country: "India",
// //     city: "Mumbai",
// //     tag: "Headquarters",
// //     address: [
// //       "Office No. 402, Business Hub",
// //       "Andheri East, Mumbai 400069",
// //       "Maharashtra, India",
// //     ],
// //     tel: "+91 98191 33331",
// //     email: "info@cevolvetechnologies.com",
// //     coords: [19.076, 72.8777],
// //   },
// //   {
// //     country: "United Arab Emirates",
// //     city: "Dubai",
// //     tag: "Sales Office",
// //     address: [
// //       "Business Bay, Bay Square",
// //       "Building 7, Office 210",
// //       "Dubai, United Arab Emirates",
// //     ],
// //     tel: "+971 4 000 0000",
// //     email: "info@cevolvetechnologies.com",
// //     coords: [25.2048, 55.2708],
// //   },
// //   {
// //     country: "United Arab Emirates",
// //     city: "Abu Dhabi",
// //     tag: "",
// //     address: ["Al Maryah Island", "Abu Dhabi, United Arab Emirates"],
// //     tel: "+971 2 000 0000",
// //     email: "info@cevolvetechnologies.com",
// //     coords: [24.4539, 54.3773],
// //   },
// //   {
// //     country: "Saudi Arabia",
// //     city: "Riyadh",
// //     tag: "",
// //     address: ["King Fahd Road, Olaya District", "Riyadh 12211, Saudi Arabia"],
// //     tel: "+966 11 000 0000",
// //     email: "info@cevolvetechnologies.com",
// //     coords: [24.7136, 46.6753],
// //   },
// //   {
// //     country: "Qatar",
// //     city: "Doha",
// //     tag: "",
// //     address: ["West Bay, Al Dafna", "Doha, Qatar"],
// //     tel: "+974 4000 0000",
// //     email: "info@cevolvetechnologies.com",
// //     coords: [25.2854, 51.531],
// //   },
// // ];

// /* ---------------------------------------------------------------------
//    1 · OFFICE DATA  ← the only block you normally need to touch.
//    coords: [latitude, longitude]  (Google Maps: right-click a pin →
//    the first number is lat, the second is lng)
//    Leave `tel` as "" if you don't have a number yet — the line is skipped.
//    --------------------------------------------------------------------- */
// const LOCATIONS = [
//   {
//     country: "India",
//     city: "Dombivli East",
//     tag: "Headquarters",
//     address: [
//       "Casa Primia G Wing",
//       "Lakeshore Greens, Palava Phase 2",
//       "Dombivli East, Maharashtra 421204, India",
//     ],
//     tel: "+91 98191 33331",
//     email: "info@cevolvetechnologies.com",
//     coords: [19.170027, 73.111413],
//   },
//   {
//     country: "United Arab Emirates",
//     city: "Dubai",
//     tag: "UAE Office",
//     address: [
//       "Building A3, 3rd Floor",
//       "Business Park, Dubai South",
//       "Dubai, United Arab Emirates",
//     ],
//     tel: "",
//     email: "info@cevolvetechnologies.com",
//     coords: [24.908952, 55.118497],
//   },

//   /* Australia — add the address and this office gets a marker + card
//      automatically. The country is already highlighted via OFFICE_REGIONS.
//   ,{
//     country: "Australia",
//     city: "",
//     tag: "",
//     address: ["", ""],
//     tel: "",
//     email: "info@cevolvetechnologies.com",
//     coords: [0, 0]
//   }
//   */
// ];

// /* Countries filled on the map — ISO 3166-1 alpha-2 codes.
//    AU is listed even though its address isn't in LOCATIONS yet. */
// const OFFICE_REGIONS = ["IN", "AE", "AU"];

// /* small helper — Google Maps link for a location */
// function gmapsUrl(loc) {
//   return (
//     "https://www.google.com/maps/search/?api=1&query=" +
//     loc.coords[0] +
//     "," +
//     loc.coords[1]
//   );
// }

// /* ---------------------------------------------------------------------
//    2 · WORLD MAP — inert countries, zoom buttons, pulsing markers,
//        and our own edge-aware address card.

//    NOTE: every style this section needs is injected below, so the overlay
//    cannot be broken by rule ordering in styles.css.
//    --------------------------------------------------------------------- */
// (function () {
//   const mapEl = document.getElementById("worldMap");
//   if (!mapEl) return;

//   if (typeof jsVectorMap === "undefined") {
//     mapEl.classList.add("is-unavailable");
//     console.warn("[cevolve] jsVectorMap did not load — check the CDN tags.");
//     return;
//   }

//   /* brand colours read straight from :root in styles.css */
//   const css = getComputedStyle(document.documentElement);
//   const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
//   const BLUE = v("--blue", "#0361EB");
//   const NAVY = v("--charcoal", "#011438");
//   const ACCENT = v("--accent", "#00A5FA");
//   const MUTED = v("--muted", "#6D6D6D");
//   const FONT = v("--font", "Helvetica, Arial, sans-serif");

//   const DARK = v("--dark", "#002A61");

//   const reduceMotion = window.matchMedia(
//     "(prefers-reduced-motion: reduce)",
//   ).matches;
//   /* hover and touch are separate questions — conflating them made the
//      marker taps fire twice on phones */
//   const hasHover = window.matchMedia(
//     "(hover: hover) and (pointer: fine)",
//   ).matches;
//   const isTouch = !hasHover || window.matchMedia("(max-width: 767px)").matches;
//   const HIT = isTouch ? 44 : 34;

//   /* ---- self-contained styles (appended last, so they always win) ---- */
//   (function injectStyles() {
//     if (document.getElementById("cev-map-styles")) return;
//     const s = document.createElement("style");
//     s.id = "cev-map-styles";
//     s.textContent =
//       ".jvm-tooltip{display:none!important}" +
//       ".cev-layer{position:absolute;inset:0;z-index:5;pointer-events:none}" +
//       ".cev-pulse{position:absolute;width:0;height:0}" +
//       ".cev-pulse i{position:absolute;left:0;top:0;width:18px;height:18px;" +
//       "margin:-9px 0 0 -9px;border:2px solid " + BLUE + ";border-radius:50%;" + +
//       ACCENT +
//       ";border-radius:50%;" +
//       "pointer-events:none;animation:cevPulse 2.4s ease-out infinite}" +
//       ".cev-pulse i:nth-child(2){animation-delay:1.2s}" +
//       "@keyframes cevPulse{0%{transform:scale(1);opacity:.8;border-width:2px}" +
//       "100%{transform:scale(2.9);opacity:0;border-width:.5px}}" +
//       ".cev-hit{position:absolute;left:0;top:0;width:" +
//       HIT +
//       "px;height:" +
//       HIT +
//       "px;" +
//       "margin:" +
//       -HIT / 2 +
//       "px 0 0 " +
//       -HIT / 2 +
//       "px;padding:0;border:0;" +
//       "border-radius:50%;background:transparent;cursor:pointer;pointer-events:auto;" +
//       "touch-action:manipulation;-webkit-tap-highlight-color:transparent;" +
//       "-webkit-appearance:none;appearance:none}" +
//       ".cev-hit:focus-visible{outline:2px solid " + BLUE + ";outline-offset:2px}" + +
//       ACCENT +
//       ";outline-offset:2px}" +
//       ".cev-tip{position:absolute;left:0;top:0;z-index:40;display:none;" +
//       "width:max-content;max-width:min(320px,calc(100% - 24px));padding:16px 18px;" +
//       "background:#fff;border:1px solid #e8edf2;border-radius:12px;" +
//       "box-shadow:0 18px 44px rgba(1,20,56,.18);font-family:" +
//       FONT +
//       ";" +
//       "font-size:14px;line-height:1.65;color:" +
//       MUTED +
//       ";text-align:left;" +
//       "pointer-events:none}" +
//       ".cev-tip.is-open{display:block}" +
//       ".cev-tip .mt-country{display:block;font-size:16px;font-weight:800;color:" +
//       NAVY +
//       "}" +
//       ".cev-tip .mt-city{display:block;font-size:11.5px;font-weight:700;letter-spacing:1.2px;" +
//       "text-transform:uppercase;color:" +
//       BLUE +
//       ";margin-bottom:10px}" +
//       ".cev-tip .mt-address{display:block;margin-bottom:10px}" +
//       ".cev-tip .mt-line{display:block;font-size:13.5px;color:" +
//       NAVY +
//       "}" +
//       ".cev-tip .mt-line strong{color:" +
//       MUTED +
//       ";font-weight:600;margin-right:4px}" +
//       "@media (prefers-reduced-motion: reduce){.cev-pulse i{animation:none;opacity:0}}";
//     document.head.appendChild(s);
//   })();

//   const map = new jsVectorMap({
//     selector: "#worldMap",
//     map: "world",
//     backgroundColor: "transparent",

//     /* zoom via the buttons only — the wheel keeps scrolling the page.
//        `draggable` is the real option name (there is no `panOnDrag`), and it
//        is off on touch so the map never eats vertical page scroll. */
//     zoomOnScroll: false,
//     zoomButtons: true,
//     zoomMin: 1,
//     zoomMax: 8,
//     draggable: !isTouch,
//     regionsSelectable: false,

//     // regionStyle: {
//     //   initial: { fill: BLUE, stroke: "#fff", strokeWidth: 0.4, fillOpacity: 1 },
//     //   hover: { fill: BLUE, fillOpacity: 1 } /* countries never react */,
//     // },

//     regionStyle: {
//      initial: { r: 8, fill: BLUE, stroke: "#fff", strokeWidth: 2.5, fillOpacity: 1 },
//       hover: { fill: "none", fillOpacity: 1 } /* countries never react */,
//       selected: {
//         fill: BLUE,
//         fillOpacity: 0.16,
//         stroke: DARK,
//         strokeWidth: 0.7,
//       },
//     },
//     selectedRegions: OFFICE_REGIONS,

//     markers: LOCATIONS.map((l) => ({
//       name: l.city + ", " + l.country,
//       coords: l.coords,
//     })),

//     markerStyle: {
//       initial: {
//         r: 8,
//         fill: NAVY,
//         stroke: "#fff",
//         strokeWidth: 2.5,
//         fillOpacity: 1,
//       },
//     },

//     /* both built-in tooltips are suppressed: no country names, and the
//        marker card is drawn by us so it can flip away from the edges */
//     onRegionTooltipShow(event) {
//       event.preventDefault();
//     },
//     onMarkerTooltipShow(event) {
//       event.preventDefault();
//     },
//     onViewportChange() {
//       sync(900);
//     },
//   });

//   /* ---- overlays: pulse rings + tap targets (under) and the card (over) ---- */
//   const layer = document.createElement("div");
//   layer.className = "cev-layer";
//   mapEl.appendChild(layer);

//   const tip = document.createElement("div");
//   tip.className = "cev-tip";
//   mapEl.appendChild(tip);

//   let markers = [];
//   let pulses = [];
//   let openIndex = -1;

//   function findMarkers() {
//     const svg = mapEl.querySelector("svg");
//     if (!svg) return [];
//     /* markers are the only <circle>s here — regions are all <path> */
//     let list = svg.querySelectorAll(".jvm-marker");
//     if (!list.length) list = svg.querySelectorAll("circle");
//     return Array.prototype.slice.call(list);
//   }

//   function centreOf(el) {
//     const box = mapEl.getBoundingClientRect();
//     const r = el.getBoundingClientRect();
//     return {
//       x: r.left + r.width / 2 - box.left,
//       y: r.top + r.height / 2 - box.top,
//       w: box.width,
//       h: box.height,
//     };
//   }

//   function highlightMarker(index, on) {
//     const m = markers[index];
//     if (!m) return;
//     m.setAttribute("r", on ? 9.5 : 8);
//     m.style.fill = on ? ACCENT : BLUE;
//   }

//   /* built once and only repositioned, so the pulse never restarts */
//   function buildOverlay() {
//     layer.innerHTML = "";
//     pulses = [];

//     markers.forEach((m, i) => {
//       const loc = LOCATIONS[i];

//       const wrap = document.createElement("span");
//       wrap.className = "cev-pulse";
//       if (!reduceMotion) wrap.innerHTML = "<i></i><i></i>";

//       const hit = document.createElement("button");
//       hit.type = "button";
//       hit.className = "cev-hit";
//       hit.setAttribute(
//         "aria-label",
//         loc ? loc.city + ", " + loc.country + " office" : "Office location",
//       );

//       const open = () => {
//         markers.forEach((_, j) => highlightMarker(j, false));
//         openTip(i);
//         highlightMarker(i, true);
//       };
//       const close = () => {
//         closeTip();
//         highlightMarker(i, false);
//       };

//       if (hasHover) {
//         hit.addEventListener("mouseenter", open);
//         hit.addEventListener("mouseleave", close);
//         hit.addEventListener("click", (e) => e.stopPropagation());
//       } else {
//         /* touch: one tap toggles. mouseenter is deliberately NOT bound —
//            the browser synthesises it before click, which was opening and
//            then instantly closing the card on the first tap. */
//         hit.addEventListener("click", (e) => {
//           e.stopPropagation();
//           if (openIndex === i) close();
//           else open();
//         });
//       }

//       hit.addEventListener("focus", open);
//       hit.addEventListener("blur", close);

//       wrap.appendChild(hit);
//       layer.appendChild(wrap);
//       pulses.push(wrap);
//     });
//   }

//   function positionPulses() {
//     pulses.forEach((p, i) => {
//       const m = markers[i];
//       if (!m) return;
//       const c = centreOf(m);
//       p.style.left = c.x + "px";
//       p.style.top = c.y + "px";
//     });
//   }

//   function tipHtml(loc) {
//     return (
//       '<span class="mt-country">' +
//       loc.country +
//       "</span>" +
//       '<span class="mt-city">' +
//       loc.city +
//       (loc.tag ? " &middot; " + loc.tag : "") +
//       "</span>" +
//       '<span class="mt-address">' +
//       loc.address.join("<br />") +
//       "</span>" +
//       '<span class="mt-line"><strong>Tel</strong> ' +
//     (loc.tel ? '<span class="mt-line"><strong>Tel</strong> ' + loc.tel + "</span>" : "") +
//       "</span>" +
//       '<span class="mt-line"><strong>Email</strong> ' +
//       loc.email +
//       "</span>"
//     );
//   }

//   /* places the card wherever there is room and never lets it hang
//      outside the map — this is what was breaking on small screens */
//   function positionTip() {
//     const m = markers[openIndex];
//     if (!m) return;

//     const c = centreOf(m);
//     const t = tip.getBoundingClientRect();
//     const pad = 12;
//     const gap = 18;

//     let top = c.y - t.height - gap; /* above the marker if it fits */
//     if (top < pad) top = c.y + gap; /* otherwise below */
//     if (top + t.height > c.h - pad) top = Math.max(pad, c.h - t.height - pad);

//     let left = c.x - t.width / 2; /* centred, then clamped */
//     left = Math.min(Math.max(pad, left), Math.max(pad, c.w - t.width - pad));

//     tip.style.left = left + "px";
//     tip.style.top = top + "px";
//   }

//   function openTip(index) {
//     const loc = LOCATIONS[index];
//     if (!loc || !markers[index]) return;
//     openIndex = index;
//     tip.innerHTML = tipHtml(loc);
//     tip.classList.add("is-open");
//     positionTip();
//   }

//   function closeTip() {
//     openIndex = -1;
//     tip.classList.remove("is-open");
//   }

//   /* keeps the overlays glued to the markers during zoom / pan / resize */
//   let syncUntil = 0;
//   let ticking = false;

//   function sync(ms) {
//     syncUntil = Math.max(syncUntil, performance.now() + (ms || 700));
//     if (ticking) return;
//     ticking = true;

//     (function step() {
//       positionPulses();
//       if (openIndex > -1) positionTip();
//       if (performance.now() < syncUntil) requestAnimationFrame(step);
//       else ticking = false;
//     })();
//   }

//   function wire() {
//     markers = findMarkers();
//     if (!markers.length) return false;
//     buildOverlay();
//     positionPulses();
//     return true;
//   }

//   /* jsVectorMap defers its own render to DOMContentLoaded, so the markers
//      are NOT in the DOM when this file runs. Poll until they appear. */
//   let tries = 0;
//   (function init() {
//     if (wire()) return;
//     if (tries++ > 40) {
//       console.warn("[cevolve] map markers never appeared — overlay skipped.");
//       return;
//     }
//     setTimeout(init, 100);
//   })();

//   /* anything that can move the map re-syncs the overlays */
//   mapEl.addEventListener("pointerdown", () => sync(1400));
//   mapEl.addEventListener("pointerup", () => sync(900));
//   mapEl.addEventListener("click", (e) => {
//     if (e.target.closest && e.target.closest(".jvm-zoom-btn")) sync(1400);
//   });
//   window.addEventListener("load", () => sync(600));
//   window.addEventListener("resize", () => sync(600));

//   /* tap / click anywhere off a marker closes the card */
//   document.addEventListener("click", () => {
//     if (openIndex > -1) closeTip();
//   });
// })();

// /* ---------------------------------------------------------------------
//    3 · OFFICE CARDS
//    --------------------------------------------------------------------- */
// (function () {
//   const listEl = document.getElementById("officeList");
//   if (!listEl) return;

//   LOCATIONS.forEach((loc) => {
//     const card = document.createElement("article");
//     card.className = "office-card";
//     card.innerHTML =
//       '<div class="office-card-head">' +
//       '<h3 class="office-country">' +
//       loc.country +
//       "</h3>" +
//       (loc.tag ? '<span class="office-tag">' + loc.tag + "</span>" : "") +
//       "</div>" +
//       '<p class="office-city">' +
//       loc.city +
//       "</p>" +
//       '<address class="office-address">' +
//       loc.address.join("<br />") +
//       "</address>" +
//       '<p class="office-contact">' +
//       '<span><i class="bi bi-telephone"></i> ' +
//       loc.tel +
//       "</span>" +
//       '<span><i class="bi bi-envelope"></i> <a href="mailto:' +
//       loc.email +
//       '">' +
//       loc.email +
//       "</a></span>" +
//       "</p>" +
//       '<a class="btn-map" href="' +
//       gmapsUrl(loc) +
//       '" target="_blank" rel="noopener">' +
//       '<i class="bi bi-geo-alt-fill"></i> View on map</a>';

//     listEl.appendChild(card);
//   });
// })();

// /* ---------------------------------------------------------------------
//    4a · HAMBURGER (same behaviour as script.js)
//    --------------------------------------------------------------------- */
// (function () {
//   const hamburger = document.getElementById("hamburger");
//   const mobileNav = document.getElementById("mobileNav");
//   if (!hamburger || !mobileNav) return;

//   hamburger.addEventListener("click", () => {
//     hamburger.classList.toggle("open");
//     mobileNav.classList.toggle("open");
//   });
//   mobileNav.querySelectorAll("a").forEach((a) => {
//     a.addEventListener("click", () => {
//       hamburger.classList.remove("open");
//       mobileNav.classList.remove("open");
//     });
//   });
// })();

// /* ---------------------------------------------------------------------
//    4b · FORM SUBMIT via EmailJS (identical to script.js)
//    --------------------------------------------------------------------- */
// const EMAILJS_SERVICE_ID = "service_q3c9d6n";
// const EMAILJS_TEMPLATE_ID = "template_ta01r3o"; // company email
// const EMAILJS_AUTOREPLY_TEMPLATE = "template_6nfr2le"; // auto reply

// async function handleSubmit(e) {
//   e.preventDefault();

//   const btn = document.getElementById("submitBtn");
//   const msg = document.getElementById("formMsg");

//   btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
//   btn.disabled = true;
//   msg.style.display = "none";

//   const form = e.target;

//   const params = {
//     from_name: form.from_name.value,
//     reply_to: form.reply_to.value,
//     user_name: form.from_name.value, // required for auto-reply
//     company: form.company.value,
//     phone: form.phone.value,
//     service: form.service.value,
//     message: form.message.value,
//   };

//   try {
//     await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
//     await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_TEMPLATE, params);

//     msg.style.display = "block";
//     msg.style.background = "rgba(34,197,94,0.12)";
//     msg.style.color = "#15803d";
//     msg.style.border = "1px solid rgba(34,197,94,0.35)";
//     msg.innerHTML =
//       '<i class="bi bi-check2-circle"></i> Message sent successfully. Please check your email.';

//     btn.innerHTML = '<i class="bi bi-check2-circle"></i> Sent!';
//     form.reset();

//     setTimeout(() => {
//       btn.innerHTML = '<i class="bi bi-send"></i> Send Message';
//       btn.disabled = false;
//       msg.style.display = "none";
//     }, 5000);
//   } catch (err) {
//     console.error("EmailJS Error:", err);

//     msg.style.display = "block";
//     msg.style.background = "rgba(239,68,68,0.10)";
//     msg.style.color = "#b91c1c";
//     msg.style.border = "1px solid rgba(239,68,68,0.35)";
//     msg.innerHTML =
//       '<i class="bi bi-exclamation-triangle"></i> Message not sent. Please try again.';

//     btn.innerHTML = '<i class="bi bi-send"></i> Send Message';
//     btn.disabled = false;
//   }
// }

// v2

/* =====================================================================
   CEVOLVE · CONTACT-US PAGE
   1. LOCATIONS + OFFICE_REGIONS  → the only block you edit
   2. World map: outline-only countries, office countries highlighted,
      round blue pointers with an address card
   3. Office cards (View on map → Google Maps)
   4. Header + form (same EmailJS flow as index.html)
   ===================================================================== */

/* ---------------------------------------------------------------------
   1 · OFFICE DATA
   coords: [latitude, longitude]  (Google Maps: right-click a pin →
   the first number is lat, the second is lng)
   Leave `tel` as "" if you don't have a number yet — the line is skipped.
   --------------------------------------------------------------------- */
const LOCATIONS = [
  {
    country: "India",
    city: "Thane",
    tag: "Tech & Delivery",
    address: [
      "Casa Primia-G Wing",
      "Lakeshore Greens, Palava Phase-II",
      "Thane, Maharashtra 421204, India",
    ],
    tel: "+91 98191 33331",
    email: "info@cevolvetechnologies.com",
    coords: [19.170027, 73.111413],
  },
  {
    country: "United Arab Emirates",
    city: "Dubai",
    tag: "Global HQ & Delivery",
    address: [
      "Building A3, 3rd Floor",
      "Business Park, Dubai South",
      "Dubai, United Arab Emirates",
    ],
    tel: "+971-508027984",
    email: "info@cevolvetechnologies.com",
    coords: [24.908952, 55.118497],
  },
  {
    country: "Australia",
    city: "Cranbourne West",
    tag: "Regional Office",
    address: ["2 Comte Cl", "Cranbourne West VIC 3977", "Victoria, Australia"],
    tel: "+61 481 540 530",
    email: "info@cevolvetechnologies.com",
    coords: [-38.1021034, 145.2577401],
  },
];

/* Countries filled on the map — ISO 3166-1 alpha-2 codes.
   AU is listed so Australia highlights even before its address exists. */
const OFFICE_REGIONS = ["IN", "AE", "AU"];

/* small helper — Google Maps link for a location */
function gmapsUrl(loc) {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    loc.coords[0] +
    "," +
    loc.coords[1]
  );
}

/* ---------------------------------------------------------------------
   2 · WORLD MAP
   Every style this section needs is injected below, so the overlay
   cannot be broken by rule ordering in styles.css.
   --------------------------------------------------------------------- */
(function () {
  const mapEl = document.getElementById("worldMap");
  if (!mapEl) return;

  if (typeof jsVectorMap === "undefined") {
    mapEl.classList.add("is-unavailable");
    console.warn("[cevolve] jsVectorMap did not load — check the CDN tags.");
    return;
  }

  /* brand colours read straight from :root in styles.css */
  const css = getComputedStyle(document.documentElement);
  const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  const BLUE = v("--blue", "#0361EB"); /* pointers + office fill */
  const DARK = v("--dark", "#002A61"); /* country outlines */
  const NAVY = v("--charcoal", "#011438");
  const MUTED = v("--muted", "#6D6D6D");
  const FONT = v("--font", "Helvetica, Arial, sans-serif");

  const OFFICE_FILL_OPACITY = 0.28;

  /* how strongly the office countries are tinted. Keep this low — a solid
     #0361EB country would swallow the #0361EB pointer sitting on it. */
  //   const OFFICE_FILL_OPACITY = 0.15;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  /* hover and touch are separate questions — conflating them made the
     marker taps fire twice on phones */
  const hasHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  const isTouch = !hasHover || window.matchMedia("(max-width: 767px)").matches;
  const HIT = isTouch ? 44 : 34;

  /* ---- self-contained styles (appended last, so they always win) ---- */
  (function injectStyles() {
    if (document.getElementById("cev-map-styles")) return;
    const s = document.createElement("style");
    s.id = "cev-map-styles";
    s.textContent =
      ".jvm-tooltip{display:none!important}" +
      ".cev-layer{position:absolute;inset:0;z-index:5;pointer-events:none}" +
      ".cev-pulse{position:absolute;width:0;height:0}" +
      ".cev-pulse i{position:absolute;left:0;top:0;width:18px;height:18px;" +
      "margin:-9px 0 0 -9px;border:2px solid " +
      BLUE +
      ";border-radius:50%;pointer-events:none;" +
      "animation:cevPulse 2.4s ease-out infinite}" +
      ".cev-pulse i:nth-child(2){animation-delay:1.2s}" +
      "@keyframes cevPulse{0%{transform:scale(1);opacity:.8;border-width:2px}" +
      "100%{transform:scale(2.9);opacity:0;border-width:.5px}}" +
      ".cev-hit{position:absolute;left:0;top:0;width:" +
      HIT +
      "px;height:" +
      HIT +
      "px;margin:" +
      -HIT / 2 +
      "px 0 0 " +
      -HIT / 2 +
      "px;padding:0;border:0;border-radius:50%;background:transparent;" +
      "cursor:pointer;pointer-events:auto;touch-action:manipulation;" +
      "-webkit-tap-highlight-color:transparent;-webkit-appearance:none;appearance:none}" +
      ".cev-hit:focus-visible{outline:2px solid " +
      BLUE +
      ";outline-offset:2px}" +
      ".cev-tip{position:absolute;left:0;top:0;z-index:40;display:none;" +
      "width:max-content;max-width:min(320px,calc(100% - 24px));padding:16px 18px;" +
      "background:#fff;border:1px solid #e8edf2;border-radius:12px;" +
      "box-shadow:0 18px 44px rgba(1,20,56,.18);font-family:" +
      FONT +
      ";font-size:14px;line-height:1.65;color:" +
      MUTED +
      ";text-align:left;pointer-events:none}" +
      ".cev-tip.is-open{display:block}" +
      ".cev-tip .mt-country{display:block;font-size:16px;font-weight:800;color:" +
      NAVY +
      "}" +
      ".cev-tip .mt-city{display:block;font-size:11.5px;font-weight:700;" +
      "letter-spacing:1.2px;text-transform:uppercase;color:" +
      BLUE +
      ";margin-bottom:10px}" +
      ".cev-tip .mt-address{display:block;margin-bottom:10px}" +
      ".cev-tip .mt-line{display:block;font-size:13.5px;color:" +
      NAVY +
      "}" +
      ".cev-tip .mt-line strong{color:" +
      MUTED +
      ";font-weight:600;margin-right:4px}" +
      "@media (prefers-reduced-motion: reduce){.cev-pulse i{animation:none;opacity:0}}";
    document.head.appendChild(s);
  })();

  const map = new jsVectorMap({
    selector: "#worldMap",
    map: "world",
    backgroundColor: "transparent",

    /* zoom via the buttons only — the wheel keeps scrolling the page.
       `draggable` is the real option name (there is no `panOnDrag`), and it
       is off on touch so the map never eats vertical page scroll. */
    zoomOnScroll: false,
    zoomButtons: true,
    zoomMin: 1,
    zoomMax: 8,
    draggable: !isTouch,
    regionsSelectable: false,

    /* OUTLINE ONLY: every country is an unfilled shape with a navy border.
       The office countries listed in OFFICE_REGIONS get the `selected`
       style instead — that is the highlight. */
    // regionStyle: {
    //   initial: {
    //     fill: "none",
    //     stroke: DARK,
    //     strokeWidth: 0.7,
    //     fillOpacity: 1,
    //   },
    //   hover: { fill: "none", fillOpacity: 1 } /* countries never react */,
    //   selected: {
    //     fill: BLUE,
    //     fillOpacity: OFFICE_FILL_OPACITY,
    //     stroke: DARK,
    //     strokeWidth: 0.7,
    //   },
    // },

    regionStyle: {
      initial: { fill: "#e8eef7", stroke: "none", fillOpacity: 1 },
      hover: { fill: "#e8eef7", fillOpacity: 1 } /* countries never react */,
      selected: {
        fill: BLUE,
        fillOpacity: OFFICE_FILL_OPACITY,
        stroke: "none",
      },
    },
    selectedRegions: OFFICE_REGIONS,

    /* one pointer per entry in LOCATIONS — nothing else */
    markers: LOCATIONS.map((l) => ({
      name: l.city + ", " + l.country,
      coords: l.coords,
    })),

    markerStyle: {
      initial: {
        r: 8,
        fill: BLUE,
        stroke: "#fff",
        strokeWidth: 2.5,
        fillOpacity: 1,
      },
    },

    /* both built-in tooltips are suppressed: no country names, and the
       marker card is drawn by us so it can flip away from the edges */
    onRegionTooltipShow(event) {
      event.preventDefault();
    },
    onMarkerTooltipShow(event) {
      event.preventDefault();
    },
    onViewportChange() {
      sync(900);
    },
  });

  /* ---- overlays: pulse rings + tap targets (under) and the card (over) ---- */
  const layer = document.createElement("div");
  layer.className = "cev-layer";
  mapEl.appendChild(layer);

  const tip = document.createElement("div");
  tip.className = "cev-tip";
  mapEl.appendChild(tip);

  let markers = [];
  let pulses = [];
  let openIndex = -1;

  function findMarkers() {
    const svg = mapEl.querySelector("svg");
    if (!svg) return [];
    /* markers are the only <circle>s here — regions are all <path> */
    let list = svg.querySelectorAll(".jvm-marker");
    if (!list.length) list = svg.querySelectorAll("circle");
    return Array.prototype.slice.call(list);
  }

  function centreOf(el) {
    const box = mapEl.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - box.left,
      y: r.top + r.height / 2 - box.top,
      w: box.width,
      h: box.height,
    };
  }

  /* pointers stay #0361EB at all times — only the radius reacts */
  function highlightMarker(index, on) {
    const m = markers[index];
    if (!m) return;
    m.setAttribute("r", on ? 10 : 8);
    m.style.fill = BLUE;
  }

  /* built once and only repositioned, so the pulse never restarts */
  function buildOverlay() {
    layer.innerHTML = "";
    pulses = [];

    markers.forEach((m, i) => {
      const loc = LOCATIONS[i];

      const wrap = document.createElement("span");
      wrap.className = "cev-pulse";
      if (!reduceMotion) wrap.innerHTML = "<i></i><i></i>";

      const hit = document.createElement("button");
      hit.type = "button";
      hit.className = "cev-hit";
      hit.setAttribute(
        "aria-label",
        loc ? loc.city + ", " + loc.country + " office" : "Office location",
      );

      const open = () => {
        markers.forEach((_, j) => highlightMarker(j, false));
        openTip(i);
        highlightMarker(i, true);
      };
      const close = () => {
        closeTip();
        highlightMarker(i, false);
      };

      if (hasHover) {
        hit.addEventListener("mouseenter", open);
        hit.addEventListener("mouseleave", close);
        hit.addEventListener("click", (e) => e.stopPropagation());
      } else {
        /* touch: one tap toggles. mouseenter is deliberately NOT bound —
           the browser synthesises it before click, which was opening and
           then instantly closing the card on the first tap. */
        hit.addEventListener("click", (e) => {
          e.stopPropagation();
          if (openIndex === i) close();
          else open();
        });
      }

      hit.addEventListener("focus", open);
      hit.addEventListener("blur", close);

      wrap.appendChild(hit);
      layer.appendChild(wrap);
      pulses.push(wrap);
    });
  }

  function positionPulses() {
    pulses.forEach((p, i) => {
      const m = markers[i];
      if (!m) return;
      const c = centreOf(m);
      p.style.left = c.x + "px";
      p.style.top = c.y + "px";
    });
  }

  function tipHtml(loc) {
    return (
      '<span class="mt-country">' +
      loc.country +
      "</span>" +
      '<span class="mt-city">' +
      loc.city +
      (loc.tag ? " &middot; " + loc.tag : "") +
      "</span>" +
      '<span class="mt-address">' +
      loc.address.join("<br />") +
      "</span>" +
      (loc.tel
        ? '<span class="mt-line"><strong>Tel</strong> ' + loc.tel + "</span>"
        : "") +
      '<span class="mt-line"><strong>Email</strong> ' +
      loc.email +
      "</span>"
    );
  }

  /* places the card wherever there is room and never lets it hang
     outside the map — this is what was breaking on small screens */
  function positionTip() {
    const m = markers[openIndex];
    if (!m) return;

    const c = centreOf(m);
    const t = tip.getBoundingClientRect();
    const pad = 12;
    const gap = 18;

    let top = c.y - t.height - gap; /* above the marker if it fits */
    if (top < pad) top = c.y + gap; /* otherwise below */
    if (top + t.height > c.h - pad) top = Math.max(pad, c.h - t.height - pad);

    let left = c.x - t.width / 2; /* centred, then clamped */
    left = Math.min(Math.max(pad, left), Math.max(pad, c.w - t.width - pad));

    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }

  function openTip(index) {
    const loc = LOCATIONS[index];
    if (!loc || !markers[index]) return;
    openIndex = index;
    tip.innerHTML = tipHtml(loc);
    tip.classList.add("is-open");
    positionTip();
  }

  function closeTip() {
    openIndex = -1;
    tip.classList.remove("is-open");
  }

  /* keeps the overlays glued to the markers during zoom / pan / resize */
  let syncUntil = 0;
  let ticking = false;

  function sync(ms) {
    syncUntil = Math.max(syncUntil, performance.now() + (ms || 700));
    if (ticking) return;
    ticking = true;

    (function step() {
      positionPulses();
      if (openIndex > -1) positionTip();
      if (performance.now() < syncUntil) requestAnimationFrame(step);
      else ticking = false;
    })();
  }

  function wire() {
    markers = findMarkers();
    if (!markers.length) return false;
    buildOverlay();
    positionPulses();
    return true;
  }

  /* jsVectorMap defers its own render to DOMContentLoaded, so the markers
     are NOT in the DOM when this file runs. Poll until they appear. */
  let tries = 0;
  (function init() {
    if (wire()) return;
    if (tries++ > 40) {
      console.warn("[cevolve] map markers never appeared — overlay skipped.");
      return;
    }
    setTimeout(init, 100);
  })();

  /* anything that can move the map re-syncs the overlays */
  mapEl.addEventListener("pointerdown", () => sync(1400));
  mapEl.addEventListener("pointerup", () => sync(900));
  mapEl.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest(".jvm-zoom-btn")) sync(1400);
  });
  window.addEventListener("load", () => sync(600));
  window.addEventListener("resize", () => sync(600));

  /* tap / click anywhere off a marker closes the card */
  document.addEventListener("click", () => {
    if (openIndex > -1) closeTip();
  });
})();

/* ---------------------------------------------------------------------
   3 · OFFICE CARDS
   --------------------------------------------------------------------- */
(function () {
  const listEl = document.getElementById("officeList");
  if (!listEl) return;

  LOCATIONS.forEach((loc) => {
    const card = document.createElement("article");
    card.className = "office-card";
    // card.innerHTML =
    //   '<div class="office-card-head">' +
    //   '<h3 class="office-country">' +
    //   loc.country +
    //   "</h3>" +
    //   (loc.tag ? '<span class="office-tag">' + loc.tag + "</span>" : "") +
    //   "</div>" +
    //   '<p class="office-city">' +
    //   loc.city +
    //   "</p>" +
    //   '<address class="office-address">' +
    //   loc.address.join("<br />") +
    //   "</address>" +
    //   '<p class="office-contact">' +
    //   (loc.tel
    //     ? '<span><i class="bi bi-telephone"></i> ' + loc.tel + "</span>"
    //     : "") +
    //   '<span><i class="bi bi-envelope"></i> <a href="mailto:' +
    //   loc.email +
    //   '">' +
    //   loc.email +
    //   "</a></span>" +
    //   "</p>" +
    //   '<a class="btn-map" href="' +
    //   gmapsUrl(loc) +
    //   '" target="_blank" rel="noopener">' +
    //   '<i class="bi bi-geo-alt-fill"></i> View on map</a>';
    card.innerHTML =
      '<div class="office-card-head">' +
      '<h3 class="office-country">' +
      loc.country +
      '</h3>' +
      (loc.tag ? '<span class="office-tag">' + loc.tag + '</span>' : '') +
      '</div>' +

      '<div class="office-content">' +

      '<p class="office-city">' +
      loc.city +
      '</p>' +

      '<address class="office-address">' +
      loc.address.join("<br />") +
      '</address>' +

      '<p class="office-contact">' +
      (loc.tel
        ? '<span><i class="bi bi-telephone"></i> ' + loc.tel + '</span>'
        : '') +

      '<span><i class="bi bi-envelope"></i> <a href="mailto:' +
      loc.email +
      '">' +
      loc.email +
      '</a></span>' +
      '</p>' +

      '</div>' +

      '<div class="office-footer">' +
      '<a class="btn-map" href="' +
      gmapsUrl(loc) +
      '" target="_blank" rel="noopener">' +
      '<i class="bi bi-geo-alt-fill"></i> View on Map' +
      '</a>' +
      '</div>';


    listEl.appendChild(card);
  });
})();

/* ---------------------------------------------------------------------
   4a · HAMBURGER (same behaviour as script.js)
   --------------------------------------------------------------------- */
(function () {
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    mobileNav.classList.toggle("open");
  });
  mobileNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      hamburger.classList.remove("open");
      mobileNav.classList.remove("open");
    });
  });
})();

/* ---------------------------------------------------------------------
   4c · PHONE FIELD — country selector (intl-tel-input v29)
   --------------------------------------------------------------------- */
let itiPhone = null;

(function initPhoneInput() {
  const input = document.getElementById("phone");
  if (!input || typeof window.intlTelInput === "undefined") {
    if (input) console.warn("[cevolve] intl-tel-input did not load.");
    return;
  }

  itiPhone = window.intlTelInput(input, {
    initialCountry: "in",
    countryOrder: ["in", "ae", "au"] /* our office countries first */,
    separateDialCode: true,
    strictMode: true /* blocks impossible digits as you type */,
    placeholderNumberPolicy: "OFF",
  });
})();

/* ---------------------------------------------------------------------
   4b · FORM SUBMIT via EmailJS (identical to script.js)
   --------------------------------------------------------------------- */
// const EMAILJS_SERVICE_ID = "service_q3c9d6n";
// const EMAILJS_TEMPLATE_ID = "template_ta01r3o"; // company email
// const EMAILJS_AUTOREPLY_TEMPLATE = "template_6nfr2le"; // auto reply

// async function handleSubmit(e) {
//   e.preventDefault();

//   const btn = document.getElementById("submitBtn");
//   const msg = document.getElementById("formMsg");

//   btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
//   btn.disabled = true;
//   msg.style.display = "none";

//   // const form = e.target;

//   // const params = {
//   //   from_name: form.from_name.value,
//   //   reply_to: form.reply_to.value,
//   //   user_name: form.from_name.value, // required for auto-reply
//   //   company: form.company.value,
//   //   phone: form.phone.value,
//   //   service: form.service.value,
//   //   message: form.message.value,
//   // };

//   // with contry code
//   const form = e.target;

//   /* full international number + the picked country.
//      NOTE: v29's method is getSelectedCountry(), not getSelectedCountryData(). */
//   const typed = form.phone.value.trim();
//   const country = itiPhone ? itiPhone.getSelectedCountry() : null;
//   const phoneFull = itiPhone && typed ? itiPhone.getNumber() : typed;

//   /* phone is optional — only validate if something was entered */
//   if (itiPhone && typed && !itiPhone.isValidNumber()) {
//     msg.style.display = "block";
//     msg.style.background = "rgba(239,68,68,0.10)";
//     msg.style.color = "#b91c1c";
//     msg.style.border = "1px solid rgba(239,68,68,0.35)";
//     msg.innerHTML =
//       '<i class="bi bi-exclamation-triangle"></i> That phone number doesn\'t look valid for the selected country.';
//     btn.innerHTML = '<i class="bi bi-send"></i> Send Message';
//     btn.disabled = false;
//     return;
//   }

//   const params = {
//     from_name: form.from_name.value,
//     reply_to: form.reply_to.value,
//     user_name: form.from_name.value, // required for auto-reply
//     company: form.company.value,
//     phone: phoneFull, // E.164, e.g. +61481540530
//     country: country ? country.name : "", // e.g. "Australia"
//     country_code: country ? "+" + country.dialCode : "", // e.g. "+61"
//     country_iso: country ? country.iso2.toUpperCase() : "", // e.g. "AU"
//     service: form.service.value,
//     message: form.message.value,
//   };

//   try {
//     await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
//     await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_TEMPLATE, params);

//     msg.style.display = "block";
//     msg.style.background = "rgba(34,197,94,0.12)";
//     msg.style.color = "#15803d";
//     msg.style.border = "1px solid rgba(34,197,94,0.35)";
//     msg.innerHTML =
//       '<i class="bi bi-check2-circle"></i> Message sent successfully. Please check your email.';

//     btn.innerHTML = '<i class="bi bi-check2-circle"></i> Sent!';
//     form.reset();

//     setTimeout(() => {
//       btn.innerHTML = '<i class="bi bi-send"></i> Send Message';
//       btn.disabled = false;
//       msg.style.display = "none";
//     }, 5000);
//   } catch (err) {
//     console.error("EmailJS Error:", err);

//     msg.style.display = "block";
//     msg.style.background = "rgba(239,68,68,0.10)";
//     msg.style.color = "#b91c1c";
//     msg.style.border = "1px solid rgba(239,68,68,0.35)";
//     msg.innerHTML =
//       '<i class="bi bi-exclamation-triangle"></i> Message not sent. Please try again.';

//     btn.innerHTML = '<i class="bi bi-send"></i> Send Message';
//     btn.disabled = false;
//   }
// }


const CONTACT_API = "https://cevolve-contact-api.onrender.com/api/contact";

async function handleSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById("submitBtn");
  const msg = document.getElementById("formMsg");
  const form = e.target;
  console.log("form submit", form);

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
  btn.disabled = true;
  msg.style.display = "none";

  /* full international number + the picked country.
     NOTE: v29's method is getSelectedCountry(), not getSelectedCountryData(). */
  const typed = form.phone.value.trim();
  const country = itiPhone ? itiPhone.getSelectedCountry() : null;
  const phoneFull = itiPhone && typed ? itiPhone.getNumber() : typed;

  /* phone is optional — only validate if something was entered */
  if (itiPhone && typed && !itiPhone.isValidNumber()) {
    showMsg(
      msg,
      false,
      "That phone number doesn't look valid for the selected country.",
    );
    resetBtn(btn);
    return;
  }

  const payload = {
    name: form.from_name.value.trim(),
    email: form.reply_to.value.trim(),
    phone: phoneFull, // E.164, e.g. +61481540530
    company: form.company.value.trim(),
    service: form.service.value,
    message: form.message.value.trim(),
    country: country ? country.name : "", // e.g. "Australia"
    country_code: country ? "+" + country.dialCode : "", // e.g. "+61"
    country_iso: country ? country.iso2.toUpperCase() : "", // e.g. "AU"
  };

  try {
    const res = await fetch(CONTACT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    /* read the body either way — errors usually carry a reason */
    let data = null;
    try {
      data = await res.json();
    } catch (_) {
      /* endpoint returned no JSON; the status alone decides */
    }

    if (!res.ok) {
      throw new Error(
        (data && (data.message || data.error)) ||
        "Request failed (" + res.status + ")",
      );
    }

    // showMsg(msg, true, "Message sent successfully. We'll be in touch shortly.");
    showMsg(
      msg,
      true,
      (data && data.message) ||
      "Thank you for contacting Cevolve Technologies. We have received your enquiry successfully.",
    );
    btn.innerHTML = '<i class="bi bi-check2-circle"></i> Sent!';
    form.reset();
    /* form.reset() doesn't reset the flag dropdown */
    if (itiPhone) itiPhone.setSelectedCountry("in");

    setTimeout(() => {
      resetBtn(btn);
      msg.style.display = "none";
    }, 5000);
  } catch (err) {
    console.error("[cevolve] contact API error:", err);
    showMsg(msg, false, err.message || "Message not sent. Please try again.");
    resetBtn(btn);
  }
}

function resetBtn(btn) {
  btn.innerHTML = '<i class="bi bi-send"></i> Send Message';
  btn.disabled = false;
}

function showMsg(el, ok, text) {
  el.style.display = "block";
  el.style.background = ok ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.10)";
  el.style.color = ok ? "#15803d" : "#b91c1c";
  el.style.border = ok
    ? "1px solid rgba(34,197,94,0.35)"
    : "1px solid rgba(239,68,68,0.35)";
  el.innerHTML =
    '<i class="bi bi-' +
    (ok ? "check2-circle" : "exclamation-triangle") +
    '"></i> ' +
    text;
}