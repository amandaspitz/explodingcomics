let isEnglish = false;
let scriptElement;
let currentImageIndex = 0;

const firstBtn = document.getElementById("first");
const previousBtn = document.getElementById("previous");
const randomBtn = document.getElementById("random");
const nextBtn = document.getElementById("next");
const lastBtn = document.getElementById("last");
const issueNumber = document.getElementById("numberStrip");
const issueTitle = document.getElementById("nameStrip");
const imageElement = document.getElementById("imageCarousel");
const text = document.getElementById("blog-text");
const topMenuLang = document.getElementById("topText");
text.textContent = images[currentImageIndex].text;
issueNumber.textContent = "#" + images[currentImageIndex].issueNumber;
issueTitle.textContent = images[currentImageIndex].issueTitle;
firstBtn.addEventListener("click", showFirstImage);
previousBtn.addEventListener("click", showPreviousImage);
randomBtn.addEventListener("click", showRandomImage);
nextBtn.addEventListener("click", showNextImage);
lastBtn.addEventListener("click", showLastImage);
firstBtn.textContent = first;
previousBtn.textContent = previous;
randomBtn.textContent = random;
nextBtn.textContent = next;
lastBtn.textContent = last;
topMenuLang.textContent = topTitle;

// function loadLanguage(url) {
//   return new Promise((resolve, reject) => {
//     scriptElement = document.createElement("script");
//     scriptElement.src = url;
//     scriptElement.onload = resolve;
//     scriptElement.onerror = reject;
//     document.getElementById("explodingSite").appendChild(scriptElement);
//   });
// }

// function toggleLanguage() {
//   if (isEnglish) {
//     loadLanguage("js/localEng.js")
//       .then(() => {
//         console.log("INGREIS");
//       })
//       .catch((error) => {
//         console.error("Erro: ", error);
//       });
//   } else {
//     loadLanguage("js/localPt.js")
//       .then(() => {
//         console.log("PORTUGAYS");
//       })
//       .catch((error) => {
//         console.error("Erro: ", error);
//       });
//   }
// }

// function removeScriptElement() {
//   if (scriptElement && scriptElement.parentNode) {
//     scriptElement.parentNode.removeChild(scriptElement);
//     scriptElement = null;
//   }
// }

// function changeLanguage() {
//   isEnglish = !isEnglish;
//   removeScriptElement();
//   toggleLanguage();
//   updateImageSource();
// }

function showFirstImage() {
  currentImageIndex = 0;
  updateImageSource();
}

function showPreviousImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    updateImageSource();
  }
}

function showRandomImage() {
  currentImageIndex = Math.floor(Math.random() * images.length);
  updateImageSource();
}

function showNextImage() {
  if (currentImageIndex < images.length - 1) {
    currentImageIndex++;
    updateImageSource();
    
  }
}

function showLastImage() {
  currentImageIndex = images.length - 1;
  updateImageSource();
}

function updateImageSource() {
  const imageUrl = images[currentImageIndex].url;
  imageElement.src = imagesPath + imageUrl;
  imageElement.alt = `Comic Strip #${currentImageIndex + 1}`;
  text.textContent = images[currentImageIndex].text;
  issueNumber.textContent = "#" + images[currentImageIndex].issueNumber;
  issueTitle.textContent = images[currentImageIndex].issueTitle;
}

showLastImage();
