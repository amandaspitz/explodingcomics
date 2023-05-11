const images = [
  { url: "0001.png", text: "Yeap! We're back." },
  { url: "0002.png", text: "For now I'm just rushing to get this thing online, but probably by the weekend I will have more news to tell." },
];
const imagesPath = "assets/comics/";

let currentImageIndex = 0;

const firstBtn = document.getElementById("first");
const previousBtn = document.getElementById("previous");
const randomBtn = document.getElementById("random");
const nextBtn = document.getElementById("next");
const lastBtn = document.getElementById("last");
const imageElement = document.getElementById("imageCarousel");
const text = document.getElementById("blog-text");
text.textContent = images[currentImageIndex].text;

firstBtn.addEventListener("click", showFirstImage);
previousBtn.addEventListener("click", showPreviousImage);
randomBtn.addEventListener("click", showRandomImage);
nextBtn.addEventListener("click", showNextImage);
lastBtn.addEventListener("click", showLastImage);

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
}
