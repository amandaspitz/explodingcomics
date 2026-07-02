import { imagesEng, baseEng } from "./localEng";
import { basePor, imagesPor } from "./localPt";

const publicSiteUrl = "https://explodingcomics.com";
let isEnglish = getInitialLanguage() !== "pt";
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
const themeToggle = document.getElementById("themeToggle");
const toggleLanguage = document.getElementById("toggleLanguage");
const flag = document.getElementById("bandeirinha");
const issueSelector = document.getElementById("issueSelector");
const issueSelectorButton = document.getElementById("issueSelectorButton");
const issueSelectorValue = document.getElementById("issueSelectorValue");
const issueSelectorMenu = document.getElementById("issueSelectorMenu");
const themeRoot = document.documentElement;
const siteLogo = document.getElementById("siteLogo");
const themeStorageKey = "explodingComicsTheme";
const shareControls = setupShareControls();
const shareWrap = shareControls.wrap;
const shareButton = shareControls.trigger;
const shareMenu = shareControls.menu;
const shareWhatsApp = shareControls.whatsApp;
const shareFacebook = shareControls.facebook;
const shareTwitter = shareControls.twitter;
const shareLinkedIn = shareControls.linkedIn;
const copyShareLinkButton = shareControls.copyButton;

applyTheme(getStoredTheme());

firstBtn.addEventListener("click", showFirstImage);
previousBtn.addEventListener("click", showPreviousImage);
randomBtn.addEventListener("click", showRandomImage);
nextBtn.addEventListener("click", showNextImage);
lastBtn.addEventListener("click", showLastImage);
themeToggle.addEventListener("click", toggleTheme);
toggleLanguage.addEventListener("click", changeLanguage);
issueSelectorButton.addEventListener("click", toggleIssueSelector);
issueSelectorButton.addEventListener("keydown", handleIssueSelectorButtonKeydown);
issueSelectorMenu.addEventListener("keydown", handleIssueSelectorMenuKeydown);
document.addEventListener("click", handleDocumentClick);
document.addEventListener("keydown", handleDocumentKeydown);
window.addEventListener("load", handleRoute);

if (shareButton) {
  shareButton.addEventListener("click", handleShareButtonClick);
}

if (shareMenu) {
  shareMenu.addEventListener("click", handleShareMenuClick);
}

function setupShareControls() {
  let wrap = document.getElementById("shareWrap");
  let trigger = document.getElementById("shareButton");
  let menu = document.getElementById("shareMenu");

  if (!wrap || !trigger || !menu) {
    const legacyShareLink = findLegacyShareLink();

    if (legacyShareLink) {
      const legacyParent = legacyShareLink.parentNode;
      wrap = document.createElement("div");
      wrap.className = "shareWrap";
      wrap.id = "shareWrap";

      const legacyShareButton = convertShareTriggerToButton(legacyShareLink);
      legacyParent.insertBefore(wrap, legacyShareButton);
      legacyShareButton.remove();
      wrap.appendChild(legacyShareButton);
      trigger = legacyShareButton;

      menu = document.createElement("div");
      menu.id = "shareMenu";
      menu.className = "shareMenuPanel";
      menu.setAttribute("aria-hidden", "true");
      wrap.appendChild(menu);
    }
  }

  if (trigger && trigger.tagName !== "BUTTON") {
    trigger = convertShareTriggerToButton(trigger);
  }

  if (trigger) {
    trigger.classList.add("iconFootButton");
    trigger.setAttribute("id", "shareButton");
    trigger.setAttribute("type", "button");
    trigger.setAttribute("aria-label", "Share");
    trigger.setAttribute("title", "Share");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "shareMenu");
  }

  if (menu) {
    menu.id = "shareMenu";
    menu.className = "shareMenuPanel";
    menu.setAttribute("aria-hidden", "true");
    renderShareMenu(menu);
  }

  return {
    wrap,
    trigger,
    menu,
    whatsApp: document.getElementById("shareWhatsApp"),
    facebook: document.getElementById("shareFacebook"),
    twitter: document.getElementById("shareTwitter"),
    linkedIn: document.getElementById("shareLinkedIn"),
    copyButton: document.getElementById("copyShareLink"),
  };
}

function convertShareTriggerToButton(trigger) {
  if (!trigger || trigger.tagName === "BUTTON") {
    return trigger;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = trigger.className;
  button.innerHTML = trigger.innerHTML;

  if (trigger.id) {
    button.id = trigger.id;
  }

  trigger.parentNode.replaceChild(button, trigger);
  return button;
}

function renderShareMenu(menu) {
  menu.innerHTML = getShareMenuMarkup();
}

function getShareMenuMarkup() {
  return `
    <a id="shareWhatsApp" class="shareMenuItem" href="#" target="_blank" rel="noopener noreferrer">
      <span class="shareMenuItemIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="shareMenuItemSvg">
          <path d="M12 2.75a9.25 9.25 0 0 0-7.96 13.94l-1.2 4.56 4.67-1.16A9.25 9.25 0 1 0 12 2.75Zm0 2a7.25 7.25 0 0 1 6.29 10.86l-.29.48.7 2.66-2.73-.68-.46.27A7.25 7.25 0 1 1 12 4.75Zm-3.1 3.63c-.24 0-.48.06-.67.25-.32.3-.84.8-.84 1.96 0 1.17.86 2.3.98 2.47.12.17 1.67 2.67 4.18 3.63 2.08.79 2.51.63 2.97.59.46-.05 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.49-.29-.25-.12-1.48-.73-1.71-.81-.22-.08-.39-.12-.55.12-.16.25-.61.81-.75.98-.14.16-.28.18-.53.06-.25-.12-1.04-.38-1.98-1.23-.73-.65-1.22-1.45-1.36-1.69-.14-.25-.02-.38.1-.5.11-.11.25-.29.37-.43.12-.14.16-.24.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.84-.2-.47-.4-.49-.55-.5h-.47Z"></path>
        </svg>
      </span>
      <span class="shareMenuItemLabel">WhatsApp</span>
    </a>
    <a id="shareFacebook" class="shareMenuItem" href="#" target="_blank" rel="noopener noreferrer">
      <span class="shareMenuItemIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="shareMenuItemSvg">
          <path d="M13.35 21v-7.62h2.56l.38-2.96h-2.94V8.53c0-.86.24-1.44 1.47-1.44H16.4V4.44c-.27-.04-1.18-.12-2.25-.12-2.23 0-3.76 1.36-3.76 3.87v2.23H7.86v2.96h2.53V21h2.96Z"></path>
        </svg>
      </span>
      <span class="shareMenuItemLabel">Facebook</span>
    </a>
    <a id="shareTwitter" class="shareMenuItem" href="#" target="_blank" rel="noopener noreferrer">
      <span class="shareMenuItemIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="shareMenuItemSvg">
          <path d="M5.5 4.5h3.29l3.45 4.92 4.31-4.92h2.12l-5.48 6.27 6.31 8.73h-3.3l-4.04-5.75-5.02 5.75H5.02l6.17-7.08L5.5 4.5Zm2.43 1.57 8.74 11.86h1.29L9.21 6.07H7.93Z"></path>
        </svg>
      </span>
      <span class="shareMenuItemLabel">X</span>
    </a>
    <a id="shareLinkedIn" class="shareMenuItem" href="#" target="_blank" rel="noopener noreferrer">
      <span class="shareMenuItemIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="shareMenuItemSvg">
          <path d="M6.3 8.55a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Zm1.45 1.33H4.87V19.5h2.88V9.88Zm4.59 0H9.5V19.5h2.84v-4.77c0-1.26.24-2.48 1.8-2.48 1.53 0 1.55 1.43 1.55 2.56v4.69H18.5v-5.27c0-2.59-.56-4.58-3.58-4.58-1.45 0-2.42.8-2.82 1.56h-.04V9.88Z"></path>
        </svg>
      </span>
      <span class="shareMenuItemLabel">LinkedIn</span>
    </a>
    <button id="copyShareLink" type="button" class="shareMenuItem shareMenuCopyButton">
      <span class="shareMenuItemIcon" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="shareMenuItemSvg">
          <path d="M8.75 7A2.75 2.75 0 0 1 11.5 4.25h6.25A2.75 2.75 0 0 1 20.5 7v8A2.75 2.75 0 0 1 17.75 17.75H11.5A2.75 2.75 0 0 1 8.75 15V7Zm-4.5 2A2.75 2.75 0 0 1 7 6.25h.75v1.5H7A1.25 1.25 0 0 0 5.75 9v8A1.25 1.25 0 0 0 7 18.25h6.25A1.25 1.25 0 0 0 14.5 17v-.75H16V17a2.75 2.75 0 0 1-2.75 2.75H7A2.75 2.75 0 0 1 4.25 17V9Z"></path>
        </svg>
      </span>
      <span class="shareMenuItemLabel" data-share-copy-label>Copy link</span>
    </button>
  `;
}

function findLegacyShareLink() {
  return Array.from(document.querySelectorAll("footer a.iconFoot")).find((link) => {
    const icon = link.querySelector("img");

    if (!icon) {
      return false;
    }

    return icon.getAttribute("src")?.includes("share.svg");
  });
}

function getStoredTheme() {
  try {
    return localStorage.getItem(themeStorageKey) || "dark";
  } catch (error) {
    return "dark";
  }
}

function getInitialLanguage() {
  const searchParams = new URLSearchParams(window.location.search);
  const requestedLanguage = (searchParams.get("lang") || "").toLowerCase();

  if (["pt", "por", "pt-br", "br"].includes(requestedLanguage)) {
    return "pt";
  }

  return "eng";
}

function getLanguageCode() {
  return isEnglish ? "eng" : "pt";
}

function getIssueShareUrl(issue = images[currentImageIndex]) {
  return `${publicSiteUrl}/share/${getLanguageCode()}/${issue.issueNumber}.html`;
}

function updateBrowserUrl() {
  if (!images[currentImageIndex]) {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("lang", getLanguageCode());
  nextUrl.hash = `${images[currentImageIndex].issueNumber}`;
  history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
}

function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  themeRoot.setAttribute("data-theme", nextTheme);

  if (siteLogo) {
    siteLogo.src =
      nextTheme === "dark" ? siteLogo.dataset.darkSrc : siteLogo.dataset.lightSrc;
  }

  themeToggle.setAttribute(
    "aria-label",
    nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  themeToggle.setAttribute("title", nextTheme === "dark" ? "Light mode" : "Dark mode");
}

function toggleTheme() {
  const nextTheme = themeRoot.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(nextTheme);

  try {
    localStorage.setItem(themeStorageKey, nextTheme);
  } catch (error) {
    return;
  }
}

function toggleIssueSelector() {
  closeShareMenu();

  if (issueSelector.classList.contains("is-open")) {
    closeIssueSelector();
    return;
  }

  openIssueSelector();
}

function openIssueSelector() {
  issueSelector.classList.add("is-open");
  issueSelectorButton.setAttribute("aria-expanded", "true");
  issueSelectorMenu.setAttribute("aria-hidden", "false");
  setIssueOptionTabIndex(0);
}

function closeIssueSelector(options = {}) {
  const { focusTrigger = false } = options;

  issueSelector.classList.remove("is-open");
  issueSelectorButton.setAttribute("aria-expanded", "false");
  issueSelectorMenu.setAttribute("aria-hidden", "true");
  setIssueOptionTabIndex(-1);

  if (focusTrigger) {
    issueSelectorButton.focus();
  }
}

function handleDocumentClick(event) {
  if (!issueSelector.contains(event.target)) {
    closeIssueSelector();
  }

  if (shareWrap && !shareWrap.contains(event.target)) {
    closeShareMenu();
  }
}

function handleDocumentKeydown(event) {
  if (event.key === "Escape") {
    closeShareMenu();
  }
}

function handleIssueSelectorButtonKeydown(event) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    openIssueSelector();
    focusSelectedIssueOption();
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    openIssueSelector();
    focusLastIssueOption();
  }

  if (event.key === "Escape") {
    closeIssueSelector();
  }
}

function handleIssueSelectorMenuKeydown(event) {
  const options = getIssueOptions();
  const activeIndex = options.indexOf(document.activeElement);

  if (event.key === "Escape") {
    event.preventDefault();
    closeIssueSelector({ focusTrigger: true });
    return;
  }

  if (!options.length) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    options[(activeIndex + 1 + options.length) % options.length].focus();
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    options[(activeIndex - 1 + options.length) % options.length].focus();
  }

  if (event.key === "Home") {
    event.preventDefault();
    options[0].focus();
  }

  if (event.key === "End") {
    event.preventDefault();
    options[options.length - 1].focus();
  }
}

function getIssueOptions() {
  return Array.from(issueSelectorMenu.querySelectorAll(".issueSelectorOption"));
}

function setIssueOptionTabIndex(value) {
  getIssueOptions().forEach((option) => {
    option.tabIndex = value;
  });
}

function focusSelectedIssueOption() {
  const selectedOption =
    issueSelectorMenu.querySelector('.issueSelectorOption[aria-selected="true"]') ||
    getIssueOptions()[0];

  if (selectedOption) {
    selectedOption.focus();
    selectedOption.scrollIntoView({ block: "nearest" });
  }
}

function focusLastIssueOption() {
  const options = getIssueOptions();

  if (options.length) {
    options[options.length - 1].focus();
  }
}

function selectIssue(issueNumber) {
  images = isEnglish ? imagesEng : imagesPor;
  const index = images.findIndex((image) => image.issueNumber === issueNumber);

  if (index !== -1) {
    currentImageIndex = index;
    updateImageSource();
    closeIssueSelector({ focusTrigger: true });
  }
}

function populateIssueSelector() {
  issueSelectorMenu.innerHTML = "";

  images = isEnglish ? imagesEng : imagesPor;

  const sortedImages = [...images].sort((a, b) => b.issueNumber - a.issueNumber);

  sortedImages.forEach((image) => {
    const option = document.createElement("button");
    const optionLabel = `#${image.issueNumber} - ${image.issueTitle}`;
    const isSelected = image.issueNumber === images[currentImageIndex].issueNumber;

    option.type = "button";
    option.className = "issueSelectorOption";
    option.role = "option";
    option.id = `issue-option-${image.issueNumber}`;
    option.textContent = optionLabel;
    option.tabIndex = -1;
    option.setAttribute("aria-selected", isSelected ? "true" : "false");
    option.addEventListener("click", function () {
      selectIssue(image.issueNumber);
    });

    if (isSelected) {
      issueSelectorValue.textContent = optionLabel;
    }

    issueSelectorMenu.appendChild(option);
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

function getShareData() {
  const currentIssue = images[currentImageIndex];

  return {
    title: "Exploding Comics",
    text: isEnglish
      ? `Check out "${currentIssue.issueTitle}" on Exploding Comics`
      : `Confira "${currentIssue.issueTitle}" no Exploding Comics`,
    url: getIssueShareUrl(currentIssue),
  };
}

function updateShareActions() {
  if (!shareButton) {
    return;
  }

  const shareLabel = isEnglish ? "Share" : "Compartilhar";
  const copyLabel = isEnglish ? "Copy link" : "Copiar link";
  const shareData = getShareData();
  const encodedUrl = encodeURIComponent(shareData.url);
  const encodedText = encodeURIComponent(shareData.text);
  const encodedWhatsAppText = encodeURIComponent(`${shareData.text} ${shareData.url}`);
  const copyShareLabel = copyShareLinkButton?.querySelector("[data-share-copy-label]");

  shareButton.setAttribute("aria-label", shareLabel);
  shareButton.setAttribute("title", shareLabel);

  if (copyShareLabel) {
    copyShareLabel.textContent = copyLabel;
  }

  if (shareWhatsApp) {
    shareWhatsApp.href = `https://api.whatsapp.com/send?text=${encodedWhatsAppText}`;
  }

  if (shareFacebook) {
    shareFacebook.href =
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
  }

  if (shareTwitter) {
    shareTwitter.href = `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  }

  if (shareLinkedIn) {
    shareLinkedIn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }
}

function openShareMenu() {
  if (!shareWrap || !shareButton || !shareMenu) {
    return;
  }

  updateShareActions();
  shareWrap.classList.add("is-open");
  shareButton.setAttribute("aria-expanded", "true");
  shareMenu.setAttribute("aria-hidden", "false");
}

function closeShareMenu() {
  if (!shareWrap || !shareButton || !shareMenu) {
    return;
  }

  shareWrap.classList.remove("is-open");
  shareButton.setAttribute("aria-expanded", "false");
  shareMenu.setAttribute("aria-hidden", "true");
}

function handleShareMenuClick(event) {
  const copyButton = event.target.closest("#copyShareLink");
  const shareOption = event.target.closest(".shareMenuItem");

  if (copyButton) {
    event.preventDefault();
    event.stopPropagation();
    copyShareLink();
    return;
  }

  if (shareOption) {
    closeShareMenu();
  }
}

function handleShareButtonClick(event) {
  event.preventDefault();
  event.stopPropagation();
  closeIssueSelector();
  updateShareActions();

  if (shareWrap.classList.contains("is-open")) {
    closeShareMenu();
    return;
  }

  openShareMenu();
}

async function copyShareLink() {
  const copyLabel = isEnglish ? "Copy link" : "Copiar link";
  const copiedLabel = isEnglish ? "Copied!" : "Copiado!";
  const copyShareLabel = copyShareLinkButton?.querySelector("[data-share-copy-label]");
  const didCopy = await copyTextToClipboard(getShareData().url);

  if (!didCopy) {
    if (copyShareLabel) {
      copyShareLabel.textContent = copyLabel;
    }
    return;
  }

  if (copyShareLabel) {
    copyShareLabel.textContent = copiedLabel;
  }

  window.setTimeout(() => {
    updateShareActions();
    closeShareMenu();
  }, 1200);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return false;
    }
  }

  const fallbackField = document.createElement("textarea");
  fallbackField.value = text;
  fallbackField.setAttribute("readonly", "");
  fallbackField.style.position = "fixed";
  fallbackField.style.opacity = "0";
  document.body.appendChild(fallbackField);
  fallbackField.select();

  const didCopy = document.execCommand("copy");
  document.body.removeChild(fallbackField);

  return didCopy;
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

  updateBrowserUrl();

  populateIssueSelector();
  closeIssueSelector();
  updateShareActions();
  closeShareMenu();
}
