let layout = {};
let site = {};
site.title = "Ananda Marga Upavasa Fasting Calendar";
site.url = "https://infinite-happiness.github.io/Ananda-Marga-Fasting-Calendar";
site.githubUrl = "https://github.com/infinite-happiness/Ananda-Marga-Fasting-Calendar";
site.downloadUrl = "https://github.com/infinite-happiness/Ananda-Marga-Fasting-Calendar/archive/refs/heads/main.zip";
site.urlEncodedTitle = encodeURIComponent(site.title);
site.urlEncodedUrl = encodeURIComponent(site.url);

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
  <nav class="top yellow2">
  <a href="index.html">
    <i>Calendar_Month</i>
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
    Created 2024 by Rámanuja - Robin Manoli<br>
    AMUFC Website: <a class="yellow10-text" href="` + site.url + `">` + site.url + `</a><br>
    AMUFC GitHub: <a class="yellow10-text" href="` + site.githubUrl + `" target="_blank" rel="nofollow noopener">` + site.githubUrl + `</a><br>
    <a class="button yellow10-text yellow10-border border" href="` + site.downloadUrl + `" rel="nofollow noopener">Download AMUFC to Your Computer</a>
  </p>
`;
}

//scripts here
document.body.style.visibility = 'hidden';
// obfuscate script tag to make js files load: https://stackoverflow.com/a/17542683
document.write('<script defer src="js/alpine3.min.js"><\/script>');

document.getElementById('header').innerHTML = layout.head() + layout.header();
document.body.classList.add("yellow1");
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('bottom_content').innerHTML = layout.bottom_content();
  document.body.style.visibility = "visible";
}, false);
