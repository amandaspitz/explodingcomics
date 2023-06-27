import { imagesEng, baseEng } from "./localEng";
import { basePor, imagesPor } from "./localPt";

let isEnglish = true;
let scriptElement;
let currentImageIndex = 0;
let images = []
let base = []

isEnglish ? images = imagesEng : images = imagesPor;
isEnglish ? base = baseEng : base = basePor;

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
const toggleLanguage = document.getElementById("toggleLanguage")
const flag = document.getElementById("bandeirinha")

firstBtn.addEventListener("click", showFirstImage);
previousBtn.addEventListener("click", showPreviousImage);
randomBtn.addEventListener("click", showRandomImage);
nextBtn.addEventListener("click", showNextImage);
lastBtn.addEventListener("click", showLastImage);
toggleLanguage.addEventListener("click", changeLanguage);

function changeLanguage() {
  const flagPath = 'assets/images/'
  isEnglish = !isEnglish;
  isEnglish ? flag.src = flagPath + 'flag-uk.png' : flag.src = flagPath + 'flag-br.png'
  
  updateImageSource();
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
  isEnglish ? images = imagesEng : images = imagesPor;
  isEnglish ? base = baseEng : base = basePor;

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
  imageElement.alt = `Comic Strip #${currentImageIndex + 1}`;
  text.textContent = images[currentImageIndex].text;
  issueNumber.textContent = "#" + images[currentImageIndex].issueNumber;
  issueTitle.textContent = images[currentImageIndex].issueTitle;
}

showLastImage();
