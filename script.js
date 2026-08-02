// ── HAMBURGER MENU
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
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

// const heroSwiper = new Swiper(".heroSwiper", {
//   loop: true,

//   speed: 900,

//   autoplay: {
//     delay: 4500,
//     disableOnInteraction: false,
//   },

//   grabCursor: true,

//   pagination: {
//     el: ".swiper-pagination",
//     clickable: true,
//   },

//   navigation: {
//     nextEl: ".swiper-button-next",
//     prevEl: ".swiper-button-prev",
//   },
// });

const heroSwiper = new Swiper(".heroSwiper", {
  loop: true,
  speed: 900,
  spaceBetween: 0, // ← removes the white gap between slides
  slidesPerView: 1, // ← exactly one full slide, no peeking
  autoplay: { delay: 4500, disableOnInteraction: false },
  grabCursor: true,
  pagination: { el: ".swiper-pagination", clickable: true },
  navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
});

const testimonialSwiper = new Swiper(".testimonialSwiper", {
  loop: true,
  speed: 700,
  autoHeight: false, // smoothly fits each quote's length
  autoplay: {
    delay: 3000,
    disableOnInteraction: true,
    pauseOnMouseEnter: true,
  },
  pagination: { el: ".testi-pagination", clickable: true }, // clickable dots
});

// ── SCROLL REVEAL
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 },
);
reveals.forEach((r) => io.observe(r));

// ── FORM SUBMIT via EmailJS

const EMAILJS_SERVICE_ID = "service_q3c9d6n";
const EMAILJS_TEMPLATE_ID = "template_ta01r3o"; // company email
const EMAILJS_AUTOREPLY_TEMPLATE = "template_6nfr2le"; // auto reply

async function handleSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById("submitBtn");
  const msg = document.getElementById("formMsg");

  // btn.textContent = "⏳ Sending...";
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
  btn.disabled = true;
  msg.style.display = "none";

  const form = e.target;

  const params = {
    from_name: form.from_name.value,
    reply_to: form.reply_to.value,
    user_name: form.from_name.value, // required for auto-reply
    company: form.company.value,
    phone: form.phone.value,
    service: form.service.value,
    message: form.message.value,
  };

  try {
    // ✅ 1. SEND TO COMPANY
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);

    // ✅ 2. AUTO REPLY TO USER
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_TEMPLATE, params);

    msg.style.display = "block";
    msg.style.background = "rgba(34,197,94,0.2)";
    msg.style.color = "#86efac";
    msg.style.border = "1px solid rgba(34,197,94,0.3)";
    msg.textContent = "✅ Message sent successfully! Please check your email.";

    // btn.textContent = "✅ Sent!";
    btn.innerHTML = '<i class="bi bi-check2-circle"></i> Sent!';
    form.reset();

    setTimeout(() => {
      // btn.textContent = "🚀 Send Message";
      btn.innerHTML = '<i class="bi bi-send"></i> Send Message';
      btn.disabled = false;
      msg.style.display = "none";
    }, 5000);
  } catch (err) {
    console.error("EmailJS Error:", err);

    msg.style.display = "block";
    msg.style.background = "rgba(239,68,68,0.2)";
    msg.style.color = "#fca5a5";
    msg.style.border = "1px solid rgba(239,68,68,0.3)";
    msg.textContent = "❌ Failed to send message. Please try again.";

    btn.textContent = "🚀 Send Message";
    btn.disabled = false;
  }
}

/* ── CLIENT LOGO MARQUEE: duplicate the row for a seamless loop ── */
// (function () {
//   const track = document.querySelector(".clients-track");
//   if (!track) return;

//   const items = Array.from(track.children);

//   // reveal-on-scroll would keep them invisible inside a moving track
//   items.forEach((el) => el.classList.remove("reveal", "reveal-delay-1", "reveal-delay-2",
//     "reveal-delay-3", "reveal-delay-4", "reveal-delay-5", "reveal-delay-6"));

//   items.forEach((el) => {
//     const clone = el.cloneNode(true);
//     clone.setAttribute("aria-hidden", "true");
//     track.appendChild(clone);
//   });
// })();

/* ── CLIENTS: tap a logo to stop the strip, tap outside to resume ── */
(function () {
  const marquee = document.querySelector(".clients-marquee");
  if (!marquee) return;

  const clearActive = () =>
    marquee
      .querySelectorAll(".client-logo.is-active")
      .forEach((c) => c.classList.remove("is-active"));

  const resume = () => {
    marquee.classList.remove("is-paused");
    clearActive();
  };

  // tap a card → pause + highlight it; tap the same card again → resume
  marquee.addEventListener("click", (e) => {
    const card = e.target.closest(".client-logo");
    if (!card) return;

    const wasActive = card.classList.contains("is-active");
    clearActive();

    if (wasActive) {
      marquee.classList.remove("is-paused");
      return;
    }
    card.classList.add("is-active");
    marquee.classList.add("is-paused");
  });

  // tap anywhere outside the strip → start moving again
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".clients-marquee")) resume();
  });

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!e.target.closest(".clients-marquee")) resume();
    },
    { passive: true },
  );
})();
