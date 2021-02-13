# link-preview-generator

![NPM Downloads](https://img.shields.io/npm/dw/link-preview-generator)
![NPM License](https://img.shields.io/npm/l/link-preview-generator)
[![Twitter](https://img.shields.io/twitter/follow/Andrej_Gajdos.svg?style=social&label=@Andrej_Gajdos)](https://twitter.com/Andrej_Gajdos)

> Get preview data (a title, description, image, domain name) from a url. Library uses puppeteer headless browser to scrape the web site.

[BLOG POST](https://andrejgajdos.com/how-to-create-a-link-preview/) and [DEMO](https://link-preview-generator.herokuapp.com/)

## Install

```
$ npm install link-preview-generator
```

## Usage

```js
const linkPreviewGenerator = require("link-preview-generator");

const previewData = await linkPreviewGenerator(
  "https://www.youtube.com/watch?v=8mqqY2Ji7_g"
);
console.log(previewData);
/*
{
  title: 'Kiteboarding: Stylish Backroll in 4 Sessions - Ride with Blake: Vlog 20',
  description: 'The backroll is a staple in your kiteboarding trick ' +
    'bag. With a few small adjustments, you can really ' +
    'improve your style and make this basic your own. ' +
    'Sessio...',
  domain: 'youtube.com',
  img: 'https://i.ytimg.com/vi/8mqqY2Ji7_g/hqdefault.jpg'
}
*/
```

## API

### linkPreviewGenerator(url, puppeteerArgs?, puppeteerAgent?)

Accepts a `url`, which is scraped and optional parameters `puppeteerArgs` -- browser options and `puppeteerAgent` -- browser user agent.

Returns an object with preview data of `url`.

#### url

Type: `string`

Scraped url.

#### puppeteerArgs

Type: `array`

Options to set on the Chrome browser.

#### puppeteerAgent

Type: `string`

Specific user agent to use.

## Troubleshooting

If you need to deploy this library (Puppeteer) on Heroku, follow [these steps](https://stackoverflow.com/a/55090914/968379).

## License

MIT © [Andrej Gajdos](http://andrejgajdos.com)
