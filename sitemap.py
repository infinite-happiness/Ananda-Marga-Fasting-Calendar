import os
import datetime
from xml.etree import ElementTree as ET


def generate_sitemap(base_url, files):
    """Generates a sitemap.xml file from HTML files in a given directory.

    Args:
      directory: The directory to scan for HTML files.
    """

    sitemap = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for file in files:
        filename = file[0]
        changefreq = file[1]
        priority = file[2]
        set_lastmod_to_now = file[3]

        if filename == "index.html":
            url = base_url
        else:
            url = base_url + filename

        last_modified = datetime.datetime.fromtimestamp(
            os.path.getmtime(filename)
        ).strftime("%Y-%m-%dT%H:%M:%SZ")
        if set_lastmod_to_now:
            last_modified = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
            print(file, last_modified)
        url_element = ET.SubElement(sitemap, "url")
        ET.SubElement(url_element, "loc").text = url
        ET.SubElement(url_element, "lastmod").text = last_modified
        ET.SubElement(url_element, "changefreq").text = changefreq
        ET.SubElement(url_element, "priority").text = str(priority)
        # Add other elements like <changefreq> and <priority> if needed

    tree = ET.ElementTree(sitemap)
    tree.write("sitemap.xml", encoding="utf-8", xml_declaration=True)


# Replace 'your_directory' with the actual directory path
generate_sitemap(
    "https://infinite-happiness.github.io/Ananda-Marga-Fasting-Calendar/",
    [
        ("index.html", "monthly", 1.0, True),
        ("science.html", "yearly", 0.6, False),
        # "fasting.html", # should be added here later, but for now it's better that the root page is displayed on Google, which could otherwise display the fasting page for ananda marga fasting searches
    ],
)
