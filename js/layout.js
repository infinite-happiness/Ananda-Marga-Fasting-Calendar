let layout = {};

layout.head = function () {
  if (document.title == "") document.title = "Ananda Marga Fasting Calendar";
  else document.title += " - Ananda Marga Fasting Calendar";
  console.log(document.title);
  return `
  <link href="css/beer.min.css" rel="stylesheet">
  <link href="css/style.css" rel="stylesheet">
  `;
  // scripts won't work here
}

layout.header = function () {
  return `
  <nav class="top yellow2">
  <a href="index.html">
    <i>home</i>
    <div>Home</div>
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
    Created 2024 by Ramanuja - Robin Manoli<br>
    Project website: <a href="https://infinite-happiness.github.io/Ananda-Marga-Fasting-Calendar/">https://infinite-happiness.github.io/Ananda-Marga-Fasting-Calendar/</a><br>
    GitHub: <a href="https://github.com/infinite-happiness/Ananda-Marga-Fasting-Calendar" target="_blank">https://github.com/infinite-happiness/Ananda-Marga-Fasting-Calendar</a><br>
  </p>
`;
}

document.getElementById('header').innerHTML = layout.head() + layout.header();
document.body.classList.add("yellow1");
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('bottom_content').innerHTML = layout.bottom_content();
  document.body.style.visibility = "visible";
}, false);
