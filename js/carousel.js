const images = [
  {
    issueNumber: 001,
    issueTitle: "Back",
    url: "0001.png",
    text: "Yeap. We're back.  Its been a long time and much has changed. Throughout the past few years, I must have thought about Exploding Comics every single day. But it was last week when I was browsing TikTok, that a person I knew from the Dublin conventions commented saying he still missed my comics, that a fire started inside of me, and I thought: What the heck am I doing with my life, if not creating comics? This is part of what I have been since I was like 4. So I decided to combine the fact that I've been passionately studying software development, with the fact that I am a cartoonist and put EC back on track. If you are an old-time reader, I should tell you that everything is quite different, but as I noticed over the couple of storyboards I sketched, my sense of humor and punchline style have been pretty much the same. Can you expect more of the same? Yes. Also, my comics have always been 95% biographical, unless someone was writing the script for me. So I might have to tell you about a lot of not-so-funny situations and major changes I've been through. Still, if you're into simple, nonchalant small stories, this is your place. I missed you guys. A lot. One last thing: I put this whole text inside of a string in Javascript so the text won't have paragraphs 'till tomorrow. xD",
  },
  {
    issueNumber: 002,
    issueTitle: "Work and Stuff",
    url: "0002.png",
    text: "Bro the pandemic hit us hard.",
  },
  {
    issueNumber: 003,
    issueTitle: "The Curse",
    url: "0003.png",
    text: "I am this hypocrite we often talk about in social media.",
  },
  {
    issueNumber: 004,
    issueTitle: "A New Guy",
    url: "0004.png",
    text: "Oh, by the way, we have a new character, in the comic and in my life. We will eventually address that.",
  },
  {
    issueNumber: 005,
    issueTitle: "Mad Dawg",
    url: "0005.png",
    text: "Good morning people. I boldly put a bit of an archive of comics to get the page going, which will make me regret and curse once I run out of material to publish. From now on, the page should run on one comic per week, as it used to five years ago. You know, the internet is a strange place now. People read like fifty pages per minute, and I believe a page that publishes once a week will barely keep the usual readers interested, let alone attract new visitors. Im shoving this page down my friends and families throats. But as previously mentioned, this time Im not trying to break into the market or make my living out of it, so a lot of the pressure is off. This is like blogging about my dogs life, but with pictures. I am so happy and satisfied with all the positive feedback. I am also sooo happy to practice coding, and I am pretty satisfied with the work Ive done here so far. ATM I live in Curitiba, probably the best city in the world. I live in a tiny flat in a huge building, where I met some of the best friends a person could have. I have an amazing day job where I work alongside awesome people (ohhh, and they have a dress code, and its all black and white). Furthermore, I noticed a brutal change on my creative work, and even on my coding assignments. I do not feel like Im rushing to meet deadlines any more, I just feel like doing the things because I want to do them. My schedule is normally organized, and I dont feel like I am constantly letting myself down. I have a suspicion that I owe that to my incredible therapist, who has been with me for the past four years. (Still no paragraphs cause javascript told me so). ",
  },
  {
    issueNumber: 006,
    issueTitle: "Plump Dog",
    url: "0006.png",
    text: "Is it supposed to be a Monday comic? Yes. Do I get overly excited and share it on Sunday? Maybe.",
  },
];
const imagesPath = "assets/comics/";

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
