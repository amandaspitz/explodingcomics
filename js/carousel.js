import { imagesEng, baseEng } from "./localEng";
import { basePor, imagesPor } from "./localPt";

let isEnglish = true;
let currentImageIndex = 0;
let images = [];
let base = [];

isEnglish ? (images = imagesEng) : (images = imagesPor);
isEnglish ? (base = baseEng) : (base = basePor);

const firstBtn = document.getElementById("first");
const previousBtn = document.getElementById("previous");
const randomBtn = document.getElementById("random");
const nextBtn = document.getElementById("next");
const lastBtn = document.getElementById("last");
const issueNumber = document.getElementById("numberStrip");
const issueTitle = document.getElementById("nameStrip");
const imageElement = document.getElementById("imageCarousel");
const blogText = document.getElementById("blog-text");
const topMenuLang = document.getElementById("topText");
const toggleLanguage = document.getElementById("toggleLanguage");
const flag = document.getElementById("bandeirinha");
const issueSelector = document.getElementById("issueSelector");

firstBtn.addEventListener("click", showFirstImage);
previousBtn.addEventListener("click", showPreviousImage);
randomBtn.addEventListener("click", showRandomImage);
nextBtn.addEventListener("click", showNextImage);
lastBtn.addEventListener("click", showLastImage);
toggleLanguage.addEventListener("click", changeLanguage);
window.addEventListener("load", handleRoute);
issueSelector.addEventListener("change", function () {
  const selectedIssueNumber = parseInt(this.value);
  images = isEnglish ? imagesEng : imagesPor;
  const index = images.findIndex((image) => image.issueNumber == selectedIssueNumber);
  if (index !== -1) {
    currentImageIndex = index;
    updateImageSource();
  }
});

function populateIssueSelector() {
  issueSelector.innerHTML = "";

  images = isEnglish ? imagesEng : imagesPor;

  const sortedImages = [...images].sort((a, b) => b.issueNumber - a.issueNumber);

  sortedImages.forEach((image) => {
    const option = document.createElement("option");
    option.value = image.issueNumber;
    option.textContent = `${image.issueTitle} - #${image.issueNumber}`;
    if (image.issueNumber === images[currentImageIndex].issueNumber) {
      option.selected = true;
    }
    issueSelector.appendChild(option);
  });
}

function changeLanguage() {
  const flagPath = "assets/images/";
  isEnglish = !isEnglish;
  flag.src = isEnglish ? flagPath + "flag-uk.png" : flagPath + "flag-br.png";

  images = isEnglish ? imagesEng : imagesPor;
  base = isEnglish ? baseEng : basePor;

  populateIssueSelector();
  updateImageSource();
}

function handleRoute() {
  let hash = window.location.hash.substring(1);
  if (hash && /^\d+$/.test(hash)) {
    let issueNum = parseInt(hash);
    images = isEnglish ? imagesEng : imagesPor;
    let index = images.findIndex((image) => image.issueNumber == issueNum);
    if (index !== -1) {
      currentImageIndex = index;
      updateImageSource();
      return;
    }
  }
  showLastImage();
}

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
  images = isEnglish ? imagesEng : imagesPor;
  base = isEnglish ? baseEng : basePor;

  blogText.textContent = images[currentImageIndex].text;
  issueNumber.textContent = "#" + images[currentImageIndex].issueNumber;
  issueTitle.textContent = images[currentImageIndex].issueTitle;
  firstBtn.textContent = base.first;
  previousBtn.textContent = base.previous;
  randomBtn.textContent = base.random;
  nextBtn.textContent = base.next;
  lastBtn.textContent = base.last;
  topMenuLang.textContent = base.topTitle;

  const imageUrl = images[currentImageIndex].url;
  imageElement.src = base.imagesPath + imageUrl;
  imageElement.alt = `Comic Strip #${images[currentImageIndex].issueNumber}`;

  window.location.hash = images[currentImageIndex].issueNumber;

  populateIssueSelector();
}