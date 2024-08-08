// Pengaturan awal untuk FollowBox
let FollowBox = "#Wrap .FollowBox";
gsap.set(FollowBox, {
  xPercent: -50,
  yPercent: -50,
  opacity: 0,
});

function enableFollowBoxAnimation() {
  window.addEventListener("mousemove", handleMousemove);
}

function disableFollowBoxAnimation() {
  window.removeEventListener("mousemove", handleMousemove);
}

let lastMouseX = 0;
let lastMouseY = 0;
const spacing = 30; // Jarak antar gambar

function handleMousemove(e) {
  let followBoxElements = document.querySelectorAll(FollowBox);

  let x = e.clientX;
  let y = e.clientY;

  gsap.to(followBoxElements, {
    duration: 1, // Tambah durasi untuk gerakan yang lebih halus
    overwrite: "auto",
    x: (index) => x + (index * spacing),
    y: y,
    stagger: 0.15,
    ease: "power2.out", // Gunakan fungsi easing yang lebih halus
  });

  let TL = gsap.timeline({
    defaults: { duration: 1, ease: "power2.out" }, // Tambah durasi dan gunakan easing yang lebih halus
  });

  // Pastikan kotak yang pertama kali muncul menghilang lebih dulu
  TL.to(followBoxElements, {
    opacity: 1,
    stagger: { each: 0.15, from: "start" },
    overwrite: "auto",
  });
  TL.to(
    followBoxElements,
    {
      opacity: 0,
      stagger: { each: 0.15, from: "start" }, // Hilangkan dari yang paling depan ke belakang
      overwrite: "auto",
    },
    "<+=2.5"
  );

  lastMouseX = x;
  lastMouseY = y;
}

// Animasi Opening Homepage
function showLoadingPage() {
  document.body.classList.add("show-loading-page");
  document.querySelector(".loading-page").style.display = "flex";
  document.querySelector(".after-load").style.display = "none";
  document.querySelector(".loading").style.display = "none";
  document.body.classList.add("no-scroll");

  // Pastikan halaman di-scroll ke atas segera
  window.scrollTo(0, 0);

  // Aktifkan animasi FollowBox setelah animasi loading-entry selesai
  setTimeout(enableFollowBoxAnimation, 500); // Sesuaikan waktu ini jika perlu
  sessionStorage.setItem("currentPage", "loading"); // Set halaman saat ini ke loading
}

function hideLoadingPage() {
  disableFollowBoxAnimation(); // Nonaktifkan animasi FollowBox setelah halaman loading
  document.querySelector(".loading-page").style.display = "none";
  document.querySelector(".after-load").style.display = "flex";
  gsap.to(".after-load", { opacity: 1, duration: 0 });
  document.body.classList.add("no-scroll");

  gsap.fromTo(
    ".after-load h4",
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 1.5 }
  );

  setTimeout(function () {
    document.querySelector(".after-load").style.display = "none";
    document.body.classList.remove("no-scroll");
    sessionStorage.setItem("currentPage", "main"); // Set halaman saat ini ke main
    sessionStorage.setItem("hasVisited", "true"); // Indikasikan bahwa situs telah dikunjungi
    window.scrollTo(0, 0); // Pastikan halaman di-scroll ke atas
  }, 2500);
}

function handleLoadingEntryClick() {
  const loadingEntry = document.querySelector(".loading-entry");
  loadingEntry.style.transform = "scale(0.9)";
  setTimeout(hideLoadingPage, 300); // Tunggu efek zoom selesai
}

function animateLoadingPercentage(speedKbps) {
  const loadingPercentageElement = document.getElementById("loading-percentage");
  document.querySelector(".loading").style.display = "flex";
  document.body.classList.add("no-scroll");

  // Periksa apakah halaman telah dikunjungi sebelumnya dan sesuaikan durasi
  const hasVisited = sessionStorage.getItem("hasVisited");
  const duration = hasVisited ? 100 : Math.max(1000, 5000 / speedKbps);
  let startTime = null;

  function updateLoadingPercentage(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percentage = Math.min(100, (progress / duration) * 100).toFixed(0);

    loadingPercentageElement.textContent = `${percentage}%`;

    if (percentage < 100) {
      requestAnimationFrame(updateLoadingPercentage);
    } else {
      // Sembunyikan animasi loading setelah selesai
      document.querySelector(".loading").style.display = "none";
      document.body.classList.remove("no-scroll");
      showMainContent();
    }
  }

  requestAnimationFrame(updateLoadingPercentage);
}

function showMainContent() {
  document.body.classList.remove("show-loading-page");
  document.body.style.visibility = "visible";
  // Jangan scroll ke atas untuk mempertahankan posisi saat ini
}

function estimateSpeed() {
  const image = new Image();
  const startTime = new Date().getTime();
  const imageUrl = "https://www.google.com/images/phd/px.gif"; // File gambar kecil untuk menguji kecepatan unduh

  return new Promise((resolve) => {
    image.onload = () => {
      const endTime = new Date().getTime();
      const duration = endTime - startTime; // Waktu yang dibutuhkan untuk mengunduh gambar
      const fileSize = 1148; // Ukuran gambar dalam byte (sesuaikan jika perlu)
      const speedBps = (fileSize * 8) / (duration / 1000); // Kecepatan dalam bit per detik
      const speedKbps = speedBps / 1024; // Kecepatan dalam kilobit per detik
      resolve(speedKbps);
    };
    image.src = `${imageUrl}?cachebust=${startTime}`; // Mencegah caching
  });
}

window.addEventListener("load", function () {
  const svgElement = document.getElementById("svg");
  const loadingEntry = document.querySelector(".loading-entry");
  const swoosh = document.getElementById("swoosh");

  svgElement.addEventListener("animationend", function () {
    // Jangan lakukan apapun di sini untuk mencegah transisi otomatis
  });

  loadingEntry.addEventListener("click", handleLoadingEntryClick);
  swoosh.addEventListener("click", showLoadingPage); // Event listener untuk klik swoosh

  const currentPage = sessionStorage.getItem("currentPage");
  if (currentPage === "loading") {
    showLoadingPage();
  } else if (currentPage === "main") {
    document.body.style.visibility = "visible"; // Pastikan konten utama terlihat pada load berikutnya
    animateLoadingPercentage(10000); // Set nilai tinggi untuk loading cepat saat refresh
  } else {
    showLoadingPage();
  }
});


// Lazy load rendering
// document.addEventListener("DOMContentLoaded", function () {
//   let lazySections = document.querySelectorAll(".lazy-section");

//   let observerOptions = {
//     root: null, // default is the viewport
//     rootMargin: "0px",
//     threshold: 0.1, // triggers when 10% of the section is visible
//   };

//   let observer = new IntersectionObserver((entries, observer) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         entry.target.classList.remove("hid");
//         entry.target.classList.add("visible");
//         observer.unobserve(entry.target); // stop observing after loading
//       }
//     });
//   }, observerOptions);

//   lazySections.forEach((section) => {
//     observer.observe(section);
//   });
// });

// Function myCV
document.addEventListener("DOMContentLoaded", (event) => {
  if (localStorage.getItem("myCVVisible") === "true") {
    document.getElementById("myCV").style.display = "block";
    document.body.classList.add("no-scroll"); // Nonaktifkan overflow pada body
  }
});

function showCV(event) {
  event.preventDefault();
  document.getElementById("myCV").style.display = "block";
  document.body.classList.add("no-scroll"); // Nonaktifkan overflow pada body
  localStorage.setItem("myCVVisible", "true"); // Simpan status tampilan
}

function closeView(event) {
  event.preventDefault();
  document.getElementById("myCV").style.display = "none";
  document.body.classList.remove("no-scroll"); // Aktifkan kembali overflow pada body
  localStorage.setItem("myCVVisible", "false"); // Hapus status tampilan
}

// Animation Hover Footer CV
document.querySelectorAll(".footer a").forEach((link) => {
  const staticImg = link.querySelector(".static-img");
  const gifImg = link.querySelector(".gif-img");

  link.addEventListener("mouseover", () => {
    if (staticImg && gifImg) {
      staticImg.style.display = "none";
      gifImg.style.display = "block";
    }
  });

  link.addEventListener("mouseout", () => {
    if (staticImg && gifImg) {
      staticImg.style.display = "block";
      gifImg.style.display = "none";
    }
  });
});

// Animation Hover Resume
document.querySelectorAll(".resume , .social a").forEach((link) => {
  const resumeContainer = document.querySelector(".resume");
  const staticImg = resumeContainer.querySelector(".static-img");
  const gifImg = resumeContainer.querySelector(".gif-img");

  link.addEventListener("mouseover", () => {
    if (link.closest(".resume") && staticImg && gifImg) {
      staticImg.style.display = "none";
      gifImg.style.display = "block";
    }
  });

  link.addEventListener("mouseout", () => {
    if (link.closest(".resume") && staticImg && gifImg) {
      staticImg.style.display = "block";
      gifImg.style.display = "none";
    }
  });
});

// Animation Hover Social
document.querySelectorAll(".social-links a").forEach((link) => {
  const staticImg = link.querySelector(".static-img");
  const gifImg = link.querySelector(".gif-img");

  link.addEventListener("mouseover", () => {
    if (staticImg && gifImg) {
      staticImg.style.display = "none";
      gifImg.style.display = "block";
    }
  });

  link.addEventListener("mouseout", () => {
    if (staticImg && gifImg) {
      staticImg.style.display = "block";
      gifImg.style.display = "none";
    }
  });
});

// Animation Contact
document.querySelectorAll(".icon-contact").forEach((contact) => {
  const staticImg = contact.querySelector(".static-img");
  const gifImg = contact.querySelector(".gif-img");

  contact.addEventListener("mouseover", () => {
    staticImg.style.display = "none";
    gifImg.style.display = "block";
  });

  contact.addEventListener("mouseout", () => {
    staticImg.style.display = "block";
    gifImg.style.display = "none";
  });
});

// HIRE ME
const targetText = "HIRE ME!";
let index = 0;
let animationRunning = false;

function getNextChar(currentChar) {
  const chars = "ABCDEFGHIJKLMNOPQ!RSTUVWXYZ ";
  const currentIndex = chars.indexOf(currentChar);
  return chars[(currentIndex + 1) % chars.length];
}

function typeWriter() {
  if (index < targetText.length) {
    const currentChar = targetText.charAt(index);
    let displayedChar = document
      .getElementById("hire-me")
      .innerHTML.charAt(index);

    if (displayedChar === "") {
      displayedChar = "A";
    }

    if (displayedChar !== currentChar) {
      displayedChar = getNextChar(displayedChar);
      document.getElementById("hire-me").innerHTML =
        document.getElementById("hire-me").innerHTML.slice(0, index) +
        displayedChar +
        document.getElementById("hire-me").innerHTML.slice(index + 1);
      setTimeout(typeWriter, 30); // Adjust the speed here
    } else {
      index++;
      setTimeout(typeWriter, 30); // Move to the next character
    }
  } else {
    animationRunning = false;
  }
}

function startAnimation() {
  if (!animationRunning) {
    animationRunning = true;
    index = 0;
    document.getElementById("hire-me").innerHTML = " ".repeat(
      targetText.length
    );
    typeWriter();
  }
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startAnimation();
      }
    });
  },
  { threshold: 0.1 }
);

window.onload = () => {
  const hireMeElement = document.getElementById("hire-me");
  observer.observe(hireMeElement);
};

// TEXT GET IN TOUCH
window.addEventListener("scroll", () => {
  const section = document.querySelector("section.five");
  const topText = section.querySelector(".top");
  const bottomText = section.querySelector(".bottom");
  const sectionRect = section.getBoundingClientRect();

  // Calculate the scroll position relative to the section
  const scrollPosition = window.scrollY - section.offsetTop;

  // Calculate the width of one "GET IN TOUCH" text
  const textWidth = bottomText.scrollWidth / 7; // Assuming there are 7 repetitions

  // Only apply the transform if the section is in view
  if (sectionRect.top < window.innerHeight && sectionRect.bottom >= 0) {
    const slowScrollPosition = scrollPosition / 8; // Reduce the scroll speed
    // Top text starts from the middle
    topText.style.transform = `translateX(${
      slowScrollPosition - textWidth * 1.5
    }px)`; // Adjust the offset to start from the middle
    // Bot text starts from the middle
    bottomText.style.transform = `translateX(${
      -slowScrollPosition - textWidth * 5
    }px)`;
  }
});

// Globe Location
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("globe-container");

  if (container.clientWidth === 0 || container.clientHeight === 0) {
    console.error(
      "Dimensi kontainer adalah nol. Periksa struktur CSS atau HTML."
    );
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ alpha: true });

  // Mengatur ukuran renderer agar sesuai dengan dimensi kontainer
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Kontrol orbit untuk memungkinkan interaksi dengan kursor
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Penambahan damping (inertia) ke kontrol
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.3;

  // Cahaya directional
  const light = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(light);

  // Cahaya ambient dengan intensitas yang lebih tinggi
  const ambientLight = new THREE.AmbientLight(0x999999); // Intensitas lebih tinggi
  scene.add(ambientLight);

  const loader = new THREE.TextureLoader();
  loader.load("asset/icon/earth.jpg", function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);

    // Membuat geometri bola dengan radius 1 (Anda bisa menyesuaikan ini jika diperlukan)
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    // Menambahkan parameter emissive untuk memberikan cahaya tambahan pada bagian yang gelap
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      emissive: 0x333333, // Warna abu-abu gelap untuk cahaya tambahan
      emissiveIntensity: 0.5, // Intensitas cahaya tambahan
    });

    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    camera.position.z = 2; // Sesuaikan jarak kamera jika diperlukan

    let autoRotate = true;
    let lastInteraction = Date.now();
    const rotationSpeed = 0.01; // Kecepatan rotasi manual

    function animate() {
      requestAnimationFrame(animate);

      const now = Date.now();
      if (autoRotate) {
        // Rotasi otomatis saat tidak ada interaksi
        globe.rotation.y += rotationSpeed;
      } else {
        // Mengembalikan rotasi ke rotasi bumi sebenarnya setelah interaksi
        const timeSinceInteraction = (now - lastInteraction) / 1000; // Dalam detik
        const earthRotation = ((2 * Math.PI) / 86400) * timeSinceInteraction; // Rotasi bumi per detik
        globe.rotation.y += earthRotation;
      }

      const time = Date.now() * 0.001; // Waktu dalam detik
      light.position.set(Math.sin(time) * 5, 3, Math.cos(time) * 5); // Rotasi cahaya

      controls.update(); // Update kontrol orbit
      renderer.render(scene, camera);
    }

    animate();

    // Menghentikan rotasi otomatis saat mouse ditekan
    controls.addEventListener("start", () => {
      autoRotate = false;
    });

    // Memulai kembali rotasi otomatis saat mouse dilepas
    controls.addEventListener("end", () => {
      autoRotate = true;
      lastInteraction = Date.now(); // Catat waktu terakhir interaksi
    });
  });

  window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Mengupdate ukuran renderer saat jendela diubah ukurannya
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
});

// Tambahkan event listener untuk setiap tautan navigasi
$(".nav-link").on("click", function () {
  $("#takeover-nav").removeClass("shown");
  closeMenuAnimation_1();
});

// Fungsi closeMenuAnimation_1 yang sudah ada
function closeMenuAnimation_1() {
  if (!arrowDisappearComplete_1) {
    arrowDisappearAnimation_1();
  } else if (!menuAppearComplete_1) {
    menuAppearAnimation_1();
  }
}

$("#nav-btn").on("click", function () {
  $("#takeover-nav").toggleClass("shown");
  $(".sticky-nav").toggleClass("difference");
});

///Initiation Variables
var icon_1 = document.getElementById("nav-btn");
var topLine_1 = document.getElementById("top-line-1");
var middleLine_1 = document.getElementById("middle-line-1");
var bottomLine_1 = document.getElementById("bottom-line-1");
var state_1 = "menu"; // can be "menu" or "arrow"
var topLineY_1;
var middleLineY_1;
var bottomLineY_1;
var topLeftY_1;
var topRightY_1;
var bottomLeftY_1;
var bottomRightY_1;
var topLeftX_1;
var topRightX_1;
var bottomLeftX_1;
var bottomRightX_1;

///Animation Variables
var segmentDuration_1 = 15;
var menuDisappearDurationInFrames_1 = segmentDuration_1;
var arrowAppearDurationInFrames_1 = segmentDuration_1;
var arrowDisappearDurationInFrames_1 = segmentDuration_1;
var menuAppearDurationInFrames_1 = segmentDuration_1;
var menuDisappearComplete_1 = false;
var arrowAppearComplete_1 = false;
var arrowDisappearComplete_1 = false;
var menuAppearComplete_1 = false;
var currentFrame_1 = 1;

// Animation Teks About
$(document).ready(function () {
  var texts = ["Hallo", "Apa Kabar", "Bonjour", "Hola", "Konichiwa"];
  var currentIndex = 0;
  setInterval(function () {
    var heroTitle = $(".animated-text");
    heroTitle.html("<span>" + texts[currentIndex] + "</span>");
    heroTitle.removeClass("animate");
    void heroTitle[0].offsetWidth; // Trigger reflow to restart animation
    heroTitle.addClass("animate");
    currentIndex = (currentIndex + 1) % texts.length;
  }, 2000);
});

///Menu Disappear
function menuDisappearAnimation_1() {
  currentFrame_1++;
  if (currentFrame_1 <= menuDisappearDurationInFrames_1) {
    window.requestAnimationFrame(() => {
      //top line
      topLineY_1 = AJS.easeInBack(
        37,
        50,
        menuDisappearDurationInFrames_1,
        currentFrame_1
      );
      topLine_1.setAttribute("d", "M30," + topLineY_1 + " L70," + topLineY_1);
      //bottom line
      bottomLineY_1 = AJS.easeInBack(
        63,
        50,
        menuDisappearDurationInFrames_1,
        currentFrame_1
      );
      bottomLine_1.setAttribute(
        "d",
        "M30," + bottomLineY_1 + " L70," + bottomLineY_1
      );
      //recursion
      menuDisappearAnimation_1();
    });
  } else {
    middleLine_1.style.opacity = "0";
    currentFrame_1 = 1;
    menuDisappearComplete_1 = true;
    openMenuAnimation_1();
  }
}

///Cross Appear
function arrowAppearAnimation_1() {
  currentFrame_1++;
  if (currentFrame_1 <= arrowAppearDurationInFrames_1) {
    window.requestAnimationFrame(() => {
      //top line
      topLeftX_1 = AJS.easeOutBack(
        30,
        35,
        arrowAppearDurationInFrames_1,
        currentFrame_1
      );
      topLeftY_1 = AJS.easeOutBack(
        50,
        35,
        arrowAppearDurationInFrames_1,
        currentFrame_1
      );
      bottomRightX_1 = AJS.easeOutBack(
        70,
        65,
        arrowAppearDurationInFrames_1,
        currentFrame_1
      );
      bottomRightY_1 = AJS.easeOutBack(
        50,
        65,
        arrowAppearDurationInFrames_1,
        currentFrame_1
      );
      topLine_1.setAttribute(
        "d",
        "M" +
          topLeftX_1 +
          "," +
          topLeftY_1 +
          " L" +
          bottomRightX_1 +
          "," +
          bottomRightY_1
      );
      //bottom line
      bottomLeftX_1 = AJS.easeOutBack(
        30,
        35,
        arrowAppearDurationInFrames_1,
        currentFrame_1
      );
      bottomLeftY_1 = AJS.easeOutBack(
        50,
        65,
        arrowAppearDurationInFrames_1,
        currentFrame_1
      );
      topRightX_1 = AJS.easeOutBack(
        70,
        65,
        arrowAppearDurationInFrames_1,
        currentFrame_1
      );
      topRightY_1 = AJS.easeOutBack(
        50,
        35,
        arrowAppearDurationInFrames_1,
        currentFrame_1
      );
      bottomLine_1.setAttribute(
        "d",
        "M" +
          bottomLeftX_1 +
          "," +
          bottomLeftY_1 +
          " L" +
          topRightX_1 +
          "," +
          topRightY_1
      );
      //recursion
      arrowAppearAnimation_1();
    });
  } else {
    currentFrame_1 = 1;
    arrowAppearComplete_1 = true;
    openMenuAnimation_1();
  }
}

///Combined Open Menu Animation
function openMenuAnimation_1() {
  if (!menuDisappearComplete_1) {
    menuDisappearAnimation_1();
  } else if (!arrowAppearComplete_1) {
    arrowAppearAnimation_1();
  }
}

///Cross Disappear
function arrowDisappearAnimation_1() {
  currentFrame_1++;
  if (currentFrame_1 <= arrowDisappearDurationInFrames_1) {
    window.requestAnimationFrame(() => {
      //top line
      topLeftX_1 = AJS.easeInBack(
        35,
        30,
        arrowDisappearDurationInFrames_1,
        currentFrame_1
      );
      topLeftY_1 = AJS.easeInBack(
        35,
        50,
        arrowDisappearDurationInFrames_1,
        currentFrame_1
      );
      bottomRightX_1 = AJS.easeInBack(
        65,
        70,
        arrowDisappearDurationInFrames_1,
        currentFrame_1
      );
      bottomRightY_1 = AJS.easeInBack(
        65,
        50,
        arrowDisappearDurationInFrames_1,
        currentFrame_1
      );
      topLine_1.setAttribute(
        "d",
        "M" +
          topLeftX_1 +
          "," +
          topLeftY_1 +
          " L" +
          bottomRightX_1 +
          "," +
          bottomRightY_1
      );
      //bottom line
      bottomLeftX_1 = AJS.easeInBack(
        35,
        30,
        arrowDisappearDurationInFrames_1,
        currentFrame_1
      );
      bottomLeftY_1 = AJS.easeInBack(
        65,
        50,
        arrowDisappearDurationInFrames_1,
        currentFrame_1
      );
      topRightX_1 = AJS.easeInBack(
        65,
        70,
        arrowDisappearDurationInFrames_1,
        currentFrame_1
      );
      topRightY_1 = AJS.easeInBack(
        35,
        50,
        arrowDisappearDurationInFrames_1,
        currentFrame_1
      );
      bottomLine_1.setAttribute(
        "d",
        "M" +
          bottomLeftX_1 +
          "," +
          bottomLeftY_1 +
          " L" +
          topRightX_1 +
          "," +
          topRightY_1
      );
      //recursion
      arrowDisappearAnimation_1();
    });
  } else {
    middleLine_1.style.opacity = "1";
    currentFrame_1 = 1;
    arrowDisappearComplete_1 = true;
    closeMenuAnimation_1();
  }
}

///Menu Appear
function menuAppearAnimation_1() {
  currentFrame_1++;
  if (currentFrame_1 <= menuAppearDurationInFrames_1) {
    window.requestAnimationFrame(() => {
      //top line
      topLineY_1 = AJS.easeOutBack(
        50,
        37,
        menuDisappearDurationInFrames_1,
        currentFrame_1
      );
      topLine_1.setAttribute("d", "M30," + topLineY_1 + " L70," + topLineY_1);
      //bottom line
      bottomLineY_1 = AJS.easeOutBack(
        50,
        63,
        menuDisappearDurationInFrames_1,
        currentFrame_1
      );
      bottomLine_1.setAttribute(
        "d",
        "M30," + bottomLineY_1 + " L70," + bottomLineY_1
      );
      //recursion
      menuAppearAnimation_1();
    });
  } else {
    currentFrame_1 = 1;
    menuAppearComplete_1 = true;
    closeMenuAnimation_1();
  }
}

///Close Menu Animation
function closeMenuAnimation_1() {
  if (!arrowDisappearComplete_1) {
    arrowDisappearAnimation_1();
  } else if (!menuAppearComplete_1) {
    menuAppearAnimation_1();
  }
}

///Events
icon_1.addEventListener("click", () => {
  if (state_1 === "menu") {
    openMenuAnimation_1();
    state_1 = "arrow";
    arrowDisappearComplete_1 = false;
    menuAppearComplete_1 = false;
  } else if (state_1 === "arrow") {
    closeMenuAnimation_1();
    state_1 = "menu";
    menuDisappearComplete_1 = false;
    arrowAppearComplete_1 = false;
  }
});

// Cursor
document.addEventListener("DOMContentLoaded", function (event) {
  var cursor = document.querySelector(".custom-cursor");
  var links = document.querySelectorAll("a, button, #nav-btn, input.btn");

  var initCursor = false;

  for (var i = 0; i < links.length; i++) {
    var selfLink = links[i];

    selfLink.addEventListener("mouseover", function () {
      cursor.classList.add("custom-cursor--link");
    });
    selfLink.addEventListener("mouseout", function () {
      cursor.classList.remove("custom-cursor--link");
    });
  }

  window.onmousemove = function (e) {
    var mouseX = e.clientX;
    var mouseY = e.clientY;

    if (!initCursor) {
      // cursor.style.opacity = 1;
      TweenLite.to(cursor, 0.5, {
        opacity: 1,
      });
      initCursor = true;
    }

    TweenLite.to(cursor, 0, {
      top: mouseY + "px",
      left: mouseX + "px",
    });
  };

  window.ontouchmove = function (e) {
    var mouseX = e.touches[0].clientX;
    var mouseY = e.touches[0].clientY;
    if (!initCursor) {
      // cursor.style.opacity = 1;
      TweenLite.to(cursor, 0.3, {
        opacity: 1,
      });
      initCursor = true;
    }

    TweenLite.to(cursor, 0, {
      top: mouseY + "px",
      left: mouseX + "px",
    });
  };

  window.onmouseout = function (e) {
    TweenLite.to(cursor, 0.3, {
      opacity: 0,
    });
    initCursor = false;
  };

  window.ontouchstart = function (e) {
    TweenLite.to(cursor, 0.3, {
      opacity: 1,
    });
  };

  window.ontouchend = function (e) {
    setTimeout(function () {
      TweenLite.to(cursor, 0.3, {
        opacity: 0,
      });
    }, 200);
  };
});
