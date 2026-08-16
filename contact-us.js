const LOCATIONS = [
  {
    country: "India",
    city: "Thane",
    tag: "Global HQ & Delivery",
    contactName: "Pankaj Cevolve",
    address: [
      "Casa Primia-G Wing",
      "Lakeshore Greens, Palava Phase-II",
      "Thane, Maharashtra 421204, India",
    ],
    tel: "+91-96191 33331",
    email: "info@cevolvetechnologies.com",
    coords: [19.170027, 73.111413],
  },
  {
    country: "United Arab Emirates",
    city: "Dubai",
    tag: "Tech & Delivery",
    contactName: "Ambrish Cevolve",
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
    contactName: "Satish Cevolve",
    address: [
      "2 Comte Cl",
      "Cranbourne West VIC 3977",
      "Victoria, Australia",
    ],
    tel: "+61 481 540 530",
    email: "info@cevolvetechnologies.com",
    coords: [-38.1021034, 145.2577401],
  },
];

const OFFICE_REGIONS = ["IN", "AE", "AU"];

/* Regional coverage: Middle East and New Zealand. */
const COVERAGE_REGIONS = [
  "SA", // Saudi Arabia
  "QA", // Qatar
  "KW", // Kuwait
  "OM", // Oman
  "BH", // Bahrain
  "JO", // Jordan
  "LB", // Lebanon
  "IQ", // Iraq
  "YE", // Yemen
  "IR", // Iran
  "IL", // Israel
  "PS", // Palestine
  "SY", // Syria
  "TR", // Turkey
  "EG", // Egypt
  "NZ", // New Zealand
];

/* Small Indian presence markers. These show only the location name. */
const INDIA_SUB_LOCATIONS = [
  {
    name: "Punjab",
    coords: [31.1471, 75.3412],
  },
  {
    name: "Delhi",
    coords: [28.6139, 77.209],
  },
  {
    name: "Lucknow, Uttar Pradesh",
    coords: [26.8467, 80.9462],
  },
  {
    name: "Bengaluru",
    coords: [12.9716, 77.5946],
  },
];

/* ================================================================
   GOOGLE MAPS LINK
   ================================================================ */

function gmapsUrl(location) {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    location.coords[0] +
    "," +
    location.coords[1]
  );
}

/* ================================================================
   ESCAPE HTML
   ================================================================ */

function escapeHtml(value) {
  const element = document.createElement("div");

  element.textContent =
    value === null || value === undefined ? "" : String(value);

  return element.innerHTML;
}

/* ================================================================
   LEAFLET OFFICE MAP
   ================================================================ */

(function initializeOfficeMap() {
  const mapElement = document.getElementById("worldMap");

  if (!mapElement) {
    return;
  }

  if (
    typeof L === "undefined" ||
    typeof am5geodata_worldLow === "undefined"
  ) {
    mapElement.classList.add("is-unavailable");

    console.warn(
      "[Cevolve] Leaflet or world geodata could not be loaded."
    );

    return;
  }

  const isMobile = window.matchMedia(
    "(max-width: 767px)"
  ).matches;

  const isTouchDevice =
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

  const supportsHover =
    !isTouchDevice &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const map = L.map(mapElement, {
    attributionControl: false,
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    dragging: true,
    tap: true,
    tapTolerance: 20,
    minZoom: 1,
    maxZoom: 8,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    worldCopyJump: false,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
  });

  /* Temporary position before fitBounds calculates final viewport. */
  map.setView([10, 90], 2);

  /* Genuine Leaflet control. CSS keeps this layer anchored inside the map. */
  const zoomControl = L.control.zoom({
    position: "topright",
  }).addTo(map);

  const zoomContainer = zoomControl.getContainer();
  let lockedPageScroll = null;

  function rememberPageScroll() {
    lockedPageScroll = {
      left: window.scrollX,
      top: window.scrollY,
    };
  }

  function restorePageScroll() {
    if (!lockedPageScroll) {
      return;
    }

    const savedPosition = lockedPageScroll;
    const rootElement = document.documentElement;
    const previousInlineScrollBehavior = rootElement.style.scrollBehavior;

    /* styles.css uses `scroll-behavior: smooth`. Temporarily switch it off
       so restoring the same position cannot animate the whole page. */
    rootElement.style.scrollBehavior = "auto";
    window.scrollTo(savedPosition.left, savedPosition.top);

    window.requestAnimationFrame(function finishScrollLock() {
      window.scrollTo(savedPosition.left, savedPosition.top);

      window.requestAnimationFrame(function releaseScrollLock() {
        rootElement.style.scrollBehavior = previousInlineScrollBehavior;
        lockedPageScroll = null;
      });
    });
  }

  /* Leaflet renders the zoom buttons as anchors with href="#". Removing
     that href prevents desktop browsers from scrolling the document to
     the top when + or - is clicked. The Leaflet zoom handlers continue
     to work normally. */
  /* Capture the position before Leaflet's own click handler runs. */
  zoomContainer.addEventListener(
    "click",
    function lockPageBeforeZoom(event) {
      if (!event.target.closest(".leaflet-control-zoom a")) {
        return;
      }

      rememberPageScroll();
      event.preventDefault();
    },
    true
  );

  zoomContainer
    .querySelectorAll("a")
    .forEach(function prepareZoomButton(button) {
      button.removeAttribute("href");
      button.setAttribute("role", "button");
      button.setAttribute("tabindex", "0");

      button.addEventListener("mousedown", function preventZoomFocus(event) {
        rememberPageScroll();
        event.preventDefault();
      });

      button.addEventListener("click", function preventPageJump(event) {
        event.preventDefault();
        button.blur();
        restorePageScroll();
      });

      button.addEventListener("keydown", function supportKeyboardZoom(event) {
        if (event.key === "Enter" || event.key === " ") {
          rememberPageScroll();
          event.preventDefault();
          button.click();
        }
      });
    });

  /* --------------------------------------------------------------
     COUNTRY POLYGON LAYER
     -------------------------------------------------------------- */

  const worldLayer = L.geoJSON(am5geodata_worldLow, {
    style(feature) {
      const isOfficeCountry = OFFICE_REGIONS.includes(feature.id);
      const isCoverageCountry = COVERAGE_REGIONS.includes(feature.id);

      return {
        fillColor: isOfficeCountry
          ? "#72aaf0"
          : isCoverageCountry
            ? "#91b9e9"
            : "#e8eef7",
        fillOpacity: 1,
        color: "#ffffff",
        opacity: 1,
        weight: 1,
      };
    },

    onEachFeature(feature, layer) {
      layer.on({
        mouseover(event) {
          const isOfficeCountry = OFFICE_REGIONS.includes(
            feature.id
          );
          const isCoverageCountry = COVERAGE_REGIONS.includes(
            feature.id
          );

          event.target.setStyle({
            fillColor: isOfficeCountry
              ? "#4f94e8"
              : isCoverageCountry
                ? "#6fa6df"
                : "#d8e5f6",
          });
        },

        mouseout(event) {
          worldLayer.resetStyle(event.target);
        },
      });
    },
  }).addTo(map);

  /* --------------------------------------------------------------
     CUSTOM PULSING MARKER
     -------------------------------------------------------------- */

  /* Ripple and solid dot are two separate Leaflet markers. This guarantees
     that the ripple can never open the office details. */
  const officePulseIcon = L.divIcon({
    className: "office-pulse-wrapper",
    html: '<div class="office-pulse-ring"></div>',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

  const officeDotIcon = L.divIcon({
    className: "office-dot-wrapper",
    html: '<div class="office-pin-dot"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  /* --------------------------------------------------------------
     TOOLTIP HTML
     -------------------------------------------------------------- */

  function createTooltipHtml(location) {
    const contactPerson = location.contactName
      ? `
        <div class="cev-am-tip-person">
          <i
            class="bi bi-person-fill"
            aria-hidden="true"
          ></i>

          <strong>Contact:</strong>

          <span>
            ${escapeHtml(location.contactName)}
          </span>
        </div>
      `
      : "";

    const phone = location.tel
      ? `
        <div>
          <strong>Phone:</strong>

          <span>
            ${escapeHtml(location.tel)}
          </span>
        </div>
      `
      : "";

    const subtitle = location.tag
      ? `${escapeHtml(location.city)} · ${escapeHtml(location.tag)}`
      : escapeHtml(location.city);

    return `
      <div class="cev-am-tip">
        <div class="cev-am-tip-country">
          ${escapeHtml(location.country)}
        </div>

        <div class="cev-am-tip-city">
          ${subtitle}
        </div>

        <div class="cev-am-tip-address">
          ${location.address.map(escapeHtml).join("<br>")}
        </div>

        <div class="cev-am-tip-contact">
          ${contactPerson}

          ${phone}

          <div>
            <strong>Email:</strong>

            <span>
              ${escapeHtml(location.email)}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------
     CREATE OFFICE MARKERS
     -------------------------------------------------------------- */

  function getTooltipPosition(marker) {
    const point = map.latLngToContainerPoint(marker.getLatLng());
    const mapSize = map.getSize();
    const mapRect = mapElement.getBoundingClientRect();
    const header = document.querySelector("header");

    const headerBottom = header
      ? header.getBoundingClientRect().bottom
      : 0;

    const safeTop =
      Math.max(0, headerBottom - mapRect.top) + 15;

    const cardWidth = isMobile ? 240 : 285;
    const cardHeight = isMobile ? 270 : 245;
    const gap = 18;

    const topSpace = point.y - safeTop;
    const bottomSpace = mapSize.y - point.y;
    const leftSpace = point.x;
    const rightSpace = mapSize.x - point.x;

    const horizontallyFits =
      point.x - cardWidth / 2 > 12 &&
      point.x + cardWidth / 2 < mapSize.x - 12;

    if (topSpace >= cardHeight + gap && horizontallyFits) {
      return "top";
    }

    if (bottomSpace >= cardHeight + gap && horizontallyFits) {
      return "bottom";
    }

    if (leftSpace >= cardWidth + gap) {
      return "left";
    }

    if (rightSpace >= cardWidth + gap) {
      return "right";
    }

    return topSpace > bottomSpace ? "top" : "bottom";
  }

  function getTooltipOffset(direction) {
    if (direction === "bottom") return L.point(0, 12);
    if (direction === "left") return L.point(-12, 0);
    if (direction === "right") return L.point(12, 0);

    return L.point(0, -12);
  }

  let activeOfficeMarker = null;
  let activeSubLocationMarker = null;

  LOCATIONS.forEach(function addOfficeMarker(location) {
    /* Decorative ripple layer: never interactive, focusable or clickable. */
    L.marker(location.coords, {
      icon: officePulseIcon,
      interactive: false,
      keyboard: false,
      bubblingMouseEvents: false,
      zIndexOffset: -10,
    }).addTo(map);

    /*
     * Native marker title is intentionally not added.
     * It prevents a second browser tooltip from appearing.
     */
    const marker = L.marker(location.coords, {
      icon: officeDotIcon,
      keyboard: true,
      interactive: true,
      bubblingMouseEvents: false,
      zIndexOffset: 10,
    }).addTo(map);

    marker.bindTooltip(createTooltipHtml(location), {
      direction: "top",
      offset: [0, -12],
      className: "cev-office-tooltip",
      opacity: 1,
      interactive: false,
    });

    marker.on("tooltipopen", function () {
      const tooltip = marker.getTooltip();
      const direction = getTooltipPosition(marker);

      tooltip.options.direction = direction;
      tooltip.options.offset = getTooltipOffset(direction);
      tooltip.update();
    });

    /* Always support tap/click. Some mobile browsers incorrectly report
       hover capability, so click handling must not live in an `else`. */
    marker.on("click", function openMobileTooltip(event) {
      if (event.originalEvent) {
        L.DomEvent.stopPropagation(event.originalEvent);
      }

      if (activeOfficeMarker && activeOfficeMarker !== marker) {
        activeOfficeMarker.closeTooltip();
      }

      if (activeSubLocationMarker) {
        activeSubLocationMarker.closeTooltip();
        activeSubLocationMarker = null;
      }

      activeOfficeMarker = marker;
      marker.openTooltip();

      /* Force positioning and repaint immediately in Chrome mobile
         emulation and on touch devices. */
      window.requestAnimationFrame(function refreshMobileTooltip() {
        const tooltip = marker.getTooltip();
        const direction = getTooltipPosition(marker);

        tooltip.options.direction = direction;
        tooltip.options.offset = getTooltipOffset(direction);
        tooltip.update();
      });
    });

    if (supportsHover) {
      marker.on("mouseover", function showTooltip() {
        marker.openTooltip();
      });

      marker.on("mouseout", function hideTooltip() {
        marker.closeTooltip();
      });

      marker.on("focus", function showKeyboardTooltip() {
        marker.openTooltip();
      });

      marker.on("blur", function hideKeyboardTooltip() {
        marker.closeTooltip();
      });
    }
  });

  /* Small Indian location markers: name only, no address popup. */
  INDIA_SUB_LOCATIONS.forEach(function addIndiaSubLocation(location) {
    const subMarker = L.circleMarker(location.coords, {
      radius: 4,
      fillColor: "#0361eb",
      fillOpacity: 1,
      color: "#ffffff",
      weight: 1.5,
      opacity: 1,
      interactive: !isTouchDevice,
      bubblingMouseEvents: false,
    }).addTo(map);

    /* Keep the visible dot small, but give touch devices a 32px invisible
       hit area so slight finger movement is not treated as map dragging. */
    const subLocationTarget = isTouchDevice
      ? L.circleMarker(location.coords, {
          radius: 16,
          fill: true,
          fillColor: "#0361eb",
          fillOpacity: 0.001,
          stroke: false,
          opacity: 1,
          interactive: true,
          bubblingMouseEvents: false,
        }).addTo(map)
      : subMarker;

    subLocationTarget.bindTooltip(escapeHtml(location.name), {
      direction: "top",
      offset: [0, -7],
      className: "cev-location-name-tooltip",
      opacity: 1,
      interactive: false,
    });

    subLocationTarget.on("click", function showSubLocationName(event) {
      if (event.originalEvent) {
        L.DomEvent.stopPropagation(event.originalEvent);
      }

      if (
        activeSubLocationMarker &&
        activeSubLocationMarker !== subLocationTarget
      ) {
        activeSubLocationMarker.closeTooltip();
      }

      if (activeOfficeMarker) {
        activeOfficeMarker.closeTooltip();
        activeOfficeMarker = null;
      }

      activeSubLocationMarker = subLocationTarget;
      subLocationTarget.openTooltip();

      window.requestAnimationFrame(function refreshSubLocationTooltip() {
        subLocationTarget.getTooltip().update();
      });
    });
  });

  map.on("click", function closeActiveOfficeTooltip() {
    if (activeOfficeMarker) {
      activeOfficeMarker.closeTooltip();
      activeOfficeMarker = null;
    }

    if (activeSubLocationMarker) {
      activeSubLocationMarker.closeTooltip();
      activeSubLocationMarker = null;
    }
  });

  /* --------------------------------------------------------------
     FIT INDIA, UAE AND AUSTRALIA IN THE INITIAL VIEW
     -------------------------------------------------------------- */

  const initialViewCoordinates = LOCATIONS.map(
    function getOfficeCoordinates(location) {
      return location.coords;
    }
  ).concat([
    [26, 30], // Western Middle East coverage anchor
    [-41.2865, 174.7762], // New Zealand coverage anchor
  ]);

  const officeBounds = L.latLngBounds(initialViewCoordinates);

  function fitAllOfficeLocations() {
    map.invalidateSize(false);

    map.fitBounds(officeBounds, {
      paddingTopLeft: isMobile
        ? [42, 44]
        : [180, 65],

      paddingBottomRight: isMobile
        ? [42, 44]
        : [180, 65],

      maxZoom: isMobile ? 1.75 : 2.25,
      animate: false,
    });
  }

  map.whenReady(function handleMapReady() {
    window.requestAnimationFrame(fitAllOfficeLocations);
  });

  let resizeTimer = null;

  window.addEventListener("resize", function handleMapResize() {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(function resizeMap() {
      map.invalidateSize(false);
    }, 150);
  });
})();

/* ================================================================
   OFFICE CARDS
   ================================================================ */

(function renderOfficeCards() {
  const officeList = document.getElementById("officeList");

  if (!officeList) {
    return;
  }

  officeList.innerHTML = "";

  LOCATIONS.forEach(function createOfficeCard(location) {
    const card = document.createElement("article");

    card.className = "office-card";

    const officeTag = location.tag
      ? `
        <span class="office-tag">
          ${escapeHtml(location.tag)}
        </span>
      `
      : "";

    const contactPerson = location.contactName
      ? `
        <span class="office-person">
          <i class="bi bi-person-fill"></i>
          ${escapeHtml(location.contactName)}
        </span>
      `
      : "";

    const phone = location.tel
      ? `
        <span>
          <i class="bi bi-telephone"></i>
          <a href="tel:${escapeHtml(location.tel.replace(/[^\d+]/g, ""))}">
            ${escapeHtml(location.tel)}
          </a>
        </span>
      `
      : "";

    card.innerHTML = `
      <div class="office-card-head">
        <h3 class="office-country">
          ${escapeHtml(location.country)}
        </h3>

        ${officeTag}
      </div>

      <div class="office-content">
        <p class="office-city">
          ${escapeHtml(location.city)}
        </p>

        <address class="office-address">
          ${location.address.map(escapeHtml).join("<br>")}
        </address>

        <p class="office-contact">
          ${contactPerson}

          ${phone}

          <span>
            <i class="bi bi-envelope"></i>

            <a href="mailto:${escapeHtml(location.email)}">
              ${escapeHtml(location.email)}
            </a>
          </span>
        </p>
      </div>

      <div class="office-footer">
        <a
          class="btn-map"
          href="${gmapsUrl(location)}"
          target="_blank"
          rel="noopener"
        >
          <i class="bi bi-geo-alt-fill"></i>
          View on Map
        </a>
      </div>
    `;

    officeList.appendChild(card);
  });
})();

/* ================================================================
   MOBILE NAVIGATION
   ================================================================ */

(function initializeMobileNavigation() {
  const hamburger = document.getElementById("hamburger");
  const mobileNavigation = document.getElementById("mobileNav");

  if (!hamburger || !mobileNavigation) {
    return;
  }

  hamburger.addEventListener("click", function toggleMenu() {
    hamburger.classList.toggle("open");
    mobileNavigation.classList.toggle("open");
  });

  mobileNavigation
    .querySelectorAll("a")
    .forEach(function attachNavigationHandler(link) {
      link.addEventListener("click", function closeMenu() {
        hamburger.classList.remove("open");
        mobileNavigation.classList.remove("open");
      });
    });
})();

/* ================================================================
   INTERNATIONAL PHONE FIELD
   ================================================================ */

let itiPhone = null;

(function initializePhoneInput() {
  const phoneInput = document.getElementById("phone");

  if (
    !phoneInput ||
    typeof window.intlTelInput === "undefined"
  ) {
    if (phoneInput) {
      console.warn(
        "[Cevolve] intl-tel-input could not be loaded."
      );
    }

    return;
  }

  itiPhone = window.intlTelInput(phoneInput, {
    initialCountry: "in",
    countryOrder: ["in", "ae", "au"],
    separateDialCode: true,
    strictMode: true,
    placeholderNumberPolicy: "OFF",
  });
})();

/* ================================================================
   CONTACT FORM
   ================================================================ */

const CONTACT_API =
  "https://cevolve-contact-api.onrender.com/api/contact";

async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const submitButton = document.getElementById("submitBtn");
  const messageElement = document.getElementById("formMsg");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitButton.innerHTML =
    '<i class="bi bi-hourglass-split"></i> Sending...';

  submitButton.disabled = true;
  messageElement.style.display = "none";

  const typedPhone = form.phone.value.trim();

  const selectedCountry = itiPhone
    ? itiPhone.getSelectedCountry()
    : null;

  const completePhone =
    itiPhone && typedPhone
      ? itiPhone.getNumber()
      : typedPhone;

  if (
    itiPhone &&
    typedPhone &&
    !itiPhone.isValidNumber()
  ) {
    showFormMessage(
      messageElement,
      false,
      "That phone number doesn't look valid for the selected country."
    );

    resetSubmitButton(submitButton);

    return;
  }

  const payload = {
    name: form.from_name.value.trim(),
    email: form.reply_to.value.trim(),
    phone: completePhone,
    company: form.company.value.trim(),
    service: form.service.value,
    message: form.message.value.trim(),

    country: selectedCountry
      ? selectedCountry.name
      : "",

    country_code: selectedCountry
      ? `+${selectedCountry.dialCode}`
      : "",

    country_iso: selectedCountry
      ? selectedCountry.iso2.toUpperCase()
      : "",
  };

  try {
    const response = await fetch(CONTACT_API, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    });

    let responseData = null;

    try {
      responseData = await response.json();
    } catch (error) {
      responseData = null;
    }

    if (!response.ok) {
      throw new Error(
        (responseData &&
          (responseData.message || responseData.error)) ||
        `Request failed (${response.status})`
      );
    }

    showFormMessage(
      messageElement,
      true,
      (responseData && responseData.message) ||
      "Thank you for contacting Cevolve Technologies. We have received your enquiry successfully."
    );

    submitButton.innerHTML =
      '<i class="bi bi-check2-circle"></i> Sent!';

    form.reset();

    if (itiPhone) {
      itiPhone.setSelectedCountry("in");
    }

    window.setTimeout(function resetSuccessMessage() {
      resetSubmitButton(submitButton);
      messageElement.style.display = "none";
    }, 5000);
  } catch (error) {
    console.error(
      "[Cevolve] Contact API error:",
      error
    );

    showFormMessage(
      messageElement,
      false,
      error.message ||
      "Message not sent. Please try again."
    );

    resetSubmitButton(submitButton);
  }
}

/* ================================================================
   FORM HELPERS
   ================================================================ */

function resetSubmitButton(button) {
  button.innerHTML =
    '<i class="bi bi-send"></i> Send Message';

  button.disabled = false;
}

function showFormMessage(element, isSuccessful, text) {
  element.style.display = "block";

  element.style.background = isSuccessful
    ? "rgba(34,197,94,0.12)"
    : "rgba(239,68,68,0.10)";

  element.style.color = isSuccessful
    ? "#15803d"
    : "#b91c1c";

  element.style.border = isSuccessful
    ? "1px solid rgba(34,197,94,0.35)"
    : "1px solid rgba(239,68,68,0.35)";

  element.innerHTML = `
    <i class="bi bi-${isSuccessful
      ? "check2-circle"
      : "exclamation-triangle"
    }"></i>
    ${escapeHtml(text)}
  `;
}