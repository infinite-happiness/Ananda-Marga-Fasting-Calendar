let layout = {};
let site = {};
site.title = "Ananda Marga Upavasa Fasting Calendar";
site.url = "https://infinite-happiness.github.io/Ananda-Marga-Fasting-Calendar";
site.githubUrl = "https://github.com/infinite-happiness/Ananda-Marga-Fasting-Calendar";
site.downloadUrl = "https://github.com/infinite-happiness/Ananda-Marga-Fasting-Calendar/archive/refs/heads/main.zip";
site.imageUrl = site.url + '/media/Moon-Paths-Ekadashii-Amavasya-Purnima.min.png';
site.tags = "Ananda Marga, Fasting, Calendar, Yoga, Tantra";
site.urlEncodedTitle = encodeURIComponent(site.title);
site.urlEncodedUrl = encodeURIComponent(site.url);
site.urlEncodedImage = encodeURIComponent(site.imageUrl);
site.urlEncodedTags = encodeURIComponent(site.imageUrl);
const urlParams = new URLSearchParams(window.location.search);


layout.head = function () {
  if (document.title == "") document.title = site.title;
  else document.title += " - " + site.title;
  //console.log(document.title);
  return `
  <link href="css/beer.min.css" rel="stylesheet">
  <link href="css/style.css" rel="stylesheet">
  `;
  // script src won't work here, see below
}

layout.header = function () {
  return `
<nav id="navbar_main" class="yellow2" :class="isInIframe()?'padding':'top'">
  <a href="index.html">
    <i><img src="media/android-chrome-192x192.png"></i>
    <div>Calendar</div>
  </a>
  <a href="share.html">
    <i>share</i>
    <div>Share</div>
  </a>
  <a href="fasting.html">
    <i>no_meals</i>
    <div>Fasting</div>
  </a>
  <a href="science.html">
    <i>routine</i>
    <div>Science</div>
  </a>
</nav>
`;
}

layout.bottom_content = function () {
  return `
  <p>
    Created 2024 by Rámanuja - Robin Manoli - Sweden<br>
    AMSFC Website: <a class="yellow10-text" href="` + site.url + `">` + site.url + `</a><br>
    <a class="yellow10-text" href="share.html" target="_blank" rel="nofollow noopener">Share / Embed / Download</a><br>
    <a class="yellow10-text" href="fasting.html" target="_blank" rel="nofollow noopener">Fasting System</a><br>
    <a class="yellow10-text" href="science.html" target="_blank" rel="nofollow noopener">Astronomical Science of Fasting Days</a><br>
    <a class="yellow10-text" href="code.html" target="_blank" rel="nofollow noopener">Code Guide</a><br>
    <a class="yellow10-text" href="` + site.githubUrl + `" target="_blank" rel="nofollow noopener">GitHub</a><br>
    <a class="yellow10-text" href="https://github.com/glowinthedark/Ananda-Marga-Fasting-Calendar-Android" target="_blank" rel="nofollow noopener">GitHub Android</a><br>
    <a class="yellow10-text" href="` + site.url + `/sitemap.xml" target="_blank">Sitemap</a><br>
    You can run AMSFC locally from your computer without an internet connection, by downloading it. Then unzip it, and open index.html with your browser.
    <a class="button yellow10-text yellow10-border border responsive margin" href="` + site.downloadUrl + `" rel="nofollow noopener">Download AMSFC to Your Computer</a><br>
  </p>
`;
}

//scripts here
document.body.style.visibility = 'hidden';
// obfuscate script tag to make js files load: https://stackoverflow.com/a/17542683
document.write('<script defer src="js/alpine3.min.js"><\/script>');
if (urlParams.has('d') || urlParams.has('debug')) {
  document.write('<script src="js/eruda.js"><\/script>');
}

function isInIframe() {
  //console.log("isInIframe", window.self !== window.top);
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

document.body.classList.add("yellow1");
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('header').innerHTML = layout.head() + layout.header();
  document.getElementById('bottom_content').innerHTML = layout.bottom_content();
  document.body.style.visibility = "visible";

  if (urlParams.has('d') || urlParams.has('debug')) {
    eruda.init();
  }

}, false);
