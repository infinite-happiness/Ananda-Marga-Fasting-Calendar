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
        if file == "index.html":
            url = base_url
        else:
            url = base_url + file

        last_modified = datetime.datetime.fromtimestamp(
            os.path.getmtime(file)
        ).strftime("%Y-%m-%dT%H:%M:%SZ")
        url_element = ET.SubElement(sitemap, "url")
        ET.SubElement(url_element, "loc").text = url
        ET.SubElement(url_element, "lastmod").text = last_modified
        # Add other elements like <changefreq> and <priority> if needed

    tree = ET.ElementTree(sitemap)
    tree.write("sitemap.xml", encoding="utf-8", xml_declaration=True)


# Replace 'your_directory' with the actual directory path
generate_sitemap(
    "https://infinite-happiness.github.io/Ananda-Marga-Fasting-Calendar/",
    [
        "index.html",
        "science.html",
        # "fasting.html", # should be added here later, but for now it's better that the root page is displayed on Google, which could otherwise display the fasting page for ananda marga fasting searches
    ],
)
