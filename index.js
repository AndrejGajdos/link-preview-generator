"use strict";
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const util = require("util");
const request = util.promisify(require("request"));
const getUrls = require("get-urls");
const isBase64 = require("is-base64");

const urlImageIsAccessible = async (url) => {
  const correctedUrls = getUrls(url);
  if (isBase64(url, { allowMime: true })) {
    return true;
  }
  if (correctedUrls.size !== 0) {
    const urlResponse = await request(correctedUrls.values().next().value);
    const contentType = urlResponse.headers["content-type"];
    return new RegExp("image/*").test(contentType);
  }
};

const getImg = async (page, uri) => {
  const img = await page.evaluate(async () => {
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (
      ogImg != null &&
      ogImg.content.length > 0 &&
      (await urlImageIsAccessible(ogImg.content))
    ) {
      return ogImg.content;
    }
    const imgRelLink = document.querySelector('link[rel="image_src"]');
    if (
      imgRelLink != null &&
      imgRelLink.href.length > 0 &&
      (await urlImageIsAccessible(imgRelLink.href))
    ) {
      return imgRelLink.href;
    }
    const twitterImg = document.querySelector('meta[name="twitter:image"]');
    if (
      twitterImg != null &&
      twitterImg.content.length > 0 &&
      (await urlImageIsAccessible(twitterImg.content))
    ) {
      return twitterImg.content;
    }

    let imgs = Array.from(document.getElementsByTagName("img"));
    if (imgs.length > 0) {
      imgs = imgs.filter((img) => {
        let addImg = true;
        if (img.naturalWidth > img.naturalHeight) {
          if (img.naturalWidth / img.naturalHeight > 3) {
            addImg = false;
          }
        } else {
          if (img.naturalHeight / img.naturalWidth > 3) {
            addImg = false;
          }
        }
        if (img.naturalHeight <= 50 || img.naturalWidth <= 50) {
          addImg = false;
        }
        return addImg;
      });
      if (imgs.length > 0) {
        imgs.forEach((img) =>
          img.src.indexOf("//") === -1
            ? (img.src = `${new URL(uri).origin}/${img.src}`)
            : img.src
        );
        return imgs[0].src;
      }
    }
    return null;
  });
  return img;
};

const getTitle = async (page) => {
  const title = await page.evaluate(() => {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle != null && ogTitle.content.length > 0) {
      return ogTitle.content;
    }
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle != null && twitterTitle.content.length > 0) {
      return twitterTitle.content;
    }
    const docTitle = document.title;
    if (docTitle != null && docTitle.length > 0) {
      return docTitle;
    }
    const h1El = document.querySelector("h1");
    const h1 = h1El ? h1El.innerHTML : null;
    if (h1 != null && h1.length > 0) {
      return h1;
    }
    const h2El = document.querySelector("h2");
    const h2 = h2El ? h2El.innerHTML : null;
    if (h2 != null && h2.length > 0) {
      return h2;
    }
    return null;
  });
  return title;
};

const getDescription = async (page) => {
  const description = await page.evaluate(() => {
    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    if (ogDescription != null && ogDescription.content.length > 0) {
      return ogDescription.content;
    }
    const twitterDescription = document.querySelector(
      'meta[name="twitter:description"]'
    );
    if (twitterDescription != null && twitterDescription.content.length > 0) {
      return twitterDescription.content;
    }
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription != null && metaDescription.content.length > 0) {
      return metaDescription.content;
    }
    let paragraphs = document.querySelectorAll("p");
    let fstVisibleParagraph = null;
    for (let i = 0; i < paragraphs.length; i++) {
      if (
        // if object is visible in dom
        paragraphs[i].offsetParent !== null &&
        !paragraphs[i].childElementCount != 0
      ) {
        fstVisibleParagraph = paragraphs[i].textContent;
        break;
      }
    }
    return fstVisibleParagraph;
  });
  return description;
};

const getDomainName = async (page, uri) => {
  const domainName = await page.evaluate(() => {
    const canonicalLink = document.querySelector("link[rel=canonical]");
    if (canonicalLink != null && canonicalLink.href.length > 0) {
      return canonicalLink.href;
    }
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    if (ogUrlMeta != null && ogUrlMeta.content.length > 0) {
      return ogUrlMeta.content;
    }
    return null;
  });
  return domainName != null
    ? new URL(domainName).hostname.replace("www.", "")
    : new URL(uri).hostname.replace("www.", "");
};

const getFavicon = async (page, uri) => {
  const noLinkIcon = `${new URL(uri).origin}/favicon.ico`;
  if (await urlImageIsAccessible(noLinkIcon)) {
    return noLinkIcon;
  }

  const favicon = await page.evaluate(async () => {
    const icon16Sizes = document.querySelector('link[rel=icon][sizes="16x16"]');
    if (
      icon16Sizes &&
      icon16Sizes.href.length > 0 &&
      (await urlImageIsAccessible(icon16Sizes.href))
    ) {
      return icon16Sizes.href;
    }

    const shortcutIcon = document.querySelector('link[rel="shortcut icon"]');
    if (
      shortcutIcon &&
      shortcutIcon.href.length > 0 &&
      (await urlImageIsAccessible(shortcutIcon.href))
    ) {
      return shortcutIcon.href;
    }

    const icons = document.querySelectorAll("link[rel=icon]");
    for (let i = 0; i < icons.length; i++) {
      if (
        icons[i] &&
        icons[i].href.length > 0 &&
        (await urlImageIsAccessible(icons[i].href))
      ) {
        return icons[i].href;
      }
    }

    const appleTouchIcons = document.querySelectorAll('link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]');
    for (let i = 0; i < appleTouchIcons.length; i ++) {
      if (
        appleTouchIcons[i] &&
        appleTouchIcons[i].href.length > 0 &&
        (await urlImageIsAccessible(appleTouchIcons[i].href))
      ) {
        return appleTouchIcons[i].href;
      }
    }

    return null;
  })

  return favicon;
}


module.exports = async (
  uri,
  puppeteerArgs = [],
  puppeteerAgent = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  executablePath
) => {
  puppeteer.use(pluginStealth());

  const params = {
    headless: true,
    args: [...puppeteerArgs],
  };
  if (executablePath) {
    params["executablePath"] = executablePath;
  }

  const browser = await puppeteer.launch(params);
  const page = await browser.newPage();
  page.setUserAgent(puppeteerAgent);
  await page.setRequestInterception(true);

  page.on("request", req => {
    switch (req.resourceType()) {
      case "stylesheet":
      case "font":
      case "beacon":
      case "media":
      case "main_frame":
      case "websocket":
      case "sub_frame":
        req.abort();
        break;
      default:
        req.continue();
    }
  });

  await page.goto(uri);
  await page.exposeFunction("request", request);
  await page.exposeFunction("urlImageIsAccessible", urlImageIsAccessible);

  const obj = {};
  obj.title = await getTitle(page);
  obj.description = await getDescription(page);
  obj.domain = await getDomainName(page, uri);
  obj.img = await getImg(page, uri);
  obj.favicon = await getFavicon(page, uri);

  await browser.close();
  return obj;
};
