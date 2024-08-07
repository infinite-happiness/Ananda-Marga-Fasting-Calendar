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
<nav class="yellow2" :class="isInIframe()?'padding':'top'">
  <a href="index.html">
    <i><img src="media/android-chrome-192x192.png"></i>
    <div>Calendar</div>
  </a>
  <a href="share.html">
    <i>share</i>
    <div>Share</div>
  </a>
  <a href="science.html">
    <i>routine</i>
    <div>Science</div>
  </a>
  <a href="code.html">
    <i>code</i>
    <div>Code</div>
  </a>
</nav>
`;
}

layout.bottom_content = function () {
  return `
  <p>
    Created 2024 by Rámanuja - Robin Manoli - Sweden<br>
    AMUFC Website: <a class="yellow10-text" href="` + site.url + `">` + site.url + `</a><br>
    AMUFC GitHub: <a class="yellow10-text" href="` + site.githubUrl + `" target="_blank" rel="nofollow noopener">` + site.githubUrl + `</a><br>
    <a class="button yellow10-text yellow10-border border responsive margin" href="` + site.downloadUrl + `" rel="nofollow noopener">Download AMUFC to Your Computer</a>
  </p>
`;
}

//scripts here
document.body.style.visibility = 'hidden';
// obfuscate script tag to make js files load: https://stackoverflow.com/a/17542683
document.write('<script defer src="js/alpine3.min.js"><\/script>');

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
}, false);
