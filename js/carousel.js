let isEnglish = true;

let scriptElement = document.createElement("script");

scriptElement.type = "text/javascript";

document.getElementById("explodingSite").appendChild(scriptElement);

function toggleLanguage() {
  if (isEnglish) {
    scriptElement.remove(); // Remove the existing script element
    scriptElement = document.createElement("script"); // Create a new script element
    scriptElement.src = "js/localEng.js"; // Set the source file for the English version
    document.getElementById("explodingSite").appendChild(scriptElement);
    console.log(scriptElement.src);
  } else {
    scriptElement.remove(); // Remove the existing script element
    scriptElement = document.createElement("script"); // Create a new script element
    scriptElement.src = "js/localPt.js"; // Set the source file for the Portuguese version
    document.getElementById("explodingSite").appendChild(scriptElement);

  }
  
}

toggleLanguage();

let currentImageIndex = 0; //Keeps track of the currently displayed image

//here is the event listener:
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
//here is the callback or event handler for the event listener:
firstBtn.addEventListener("click", showFirstImage);
previousBtn.addEventListener("click", showPreviousImage);
randomBtn.addEventListener("click", showRandomImage);
nextBtn.addEventListener("click", showNextImage);
lastBtn.addEventListener("click", showLastImage);

showLastImage();

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

firstBtn.textContent = first;
previousBtn.textContent = previous;
randomBtn.textContent = random;
nextBtn.textContent = next;
lastBtn.textContent = last;

topMenuLang.textContent = topTitle;
