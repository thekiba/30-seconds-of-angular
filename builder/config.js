const Metalsmith = require('metalsmith');
const markdown = require('metalsmith-markdown');
const layouts = require('metalsmith-layouts');
const handlebars = require('handlebars');
const collections = require('metalsmith-collections');
const discoverPartials = require('metalsmith-discover-partials');
const registerHelpers = require('metalsmith-register-helpers');
const metalsmithStatic = require('metalsmith-static');
const permalinks = require('metalsmith-permalinks');
const tags = require('metalsmith-tags');
const rename = require('metalsmith-rename');
const copy = require('metalsmith-copy');
const path = require('path');

const generateHtmlFilesForScreenshots = require('./plugins/generate-html-files-for-screenshots');
const customMarkdownParse = require('./plugins/custom-markdown-parse');
const validate = require('./plugins/validate');
const statistics = require('./plugins/statistics');
const metalsmithLocalStatic = require('./plugins/local-static');

module.exports = function build(config) {
  return Metalsmith(__dirname)
    .metadata({
      site: config.metadata
    })
    .source(config.snippets)
    .destination('../static')
    .use(metalsmithStatic())
    .use(metalsmithLocalStatic([
      {src: config.static},
    ]))
    .use(collections({
      snippets: {
        sortBy: 'path',
        pattern: '*.md',
      },
    }))
    .use(copy({
      pattern: 'pages/*.md',
      directory: '.',
      move: true
    }))
    .use(customMarkdownParse())
    .use(validate(
      require('./schemas/snippet').schema
    ))
    .use(discoverPartials())
    .use(registerHelpers())
    .use(markdown({}))
    .use(permalinks())
    .use(tags({
      layout: 'tag.hbs'
    }))
    .use(generateHtmlFilesForScreenshots())
    .use(rename([
      [path.join('json', 'index.html'), 'data.json'],
      [path.join('readme', 'index.html'), 'README.md'],
    ]))
    .use(statistics())
    .use(layouts({
      engine: handlebars,
      default: 'snippet.hbs',
    }));
};
