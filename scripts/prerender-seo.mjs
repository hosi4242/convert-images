import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const routes = [
  "/image-converter", "/image-compressor", "/image-resizer",
  "/image-size-compare", "/image-dpi-calculator", "/qr-code",
  "/calculator", "/loan-calculator", "/installment-calculator",
  "/unit-converter", "/time-calculator", "/text-tools",
  "/text-cleaner", "/pdf-tools", "/about", "/privacy",
  "/terms", "/contact", "/timer",
];
const siteUrl = "https://toolmingle.dev";
const language = "ko";

function escapeAttribute(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function setMeta(html, selector, attribute, key, value) {
  const escaped = escapeAttribute(value);
  const pattern = new RegExp(`<meta(?=[^>]*\\b${attribute}=["']${key}["'])[^>]*>`, "i");
  const tag = `<meta ${attribute}="${key}" content="${escaped}">`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n</head>`);
}

function setCanonical(html, canonical) {
  const tag = `<link rel="canonical" href="${escapeAttribute(canonical)}">`;
  return /<link[^>]+rel=["']canonical["'][^>]*>/i.test(html)
    ? html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, tag)
    : html.replace("</head>", `  ${tag}\n</head>`);
}

function buildSeoSchema(route, metadata) {
  const canonical = siteUrl + route;
  const graph = [
    {
      "@type": "WebPage",
      "@id": canonical + "#webpage",
      name: metadata.title,
      description: metadata.description,
      url: canonical,
      inLanguage: "ko-KR",
      isPartOf: { "@type": "WebSite", name: "ToolMingle", url: siteUrl },
      breadcrumb: { "@id": canonical + "#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": canonical + "#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "도구", item: siteUrl + "/" },
        { "@type": "ListItem", position: 2, name: metadata.heading, item: canonical },
      ],
    },
  ];
  if (metadata.faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": canonical + "#faq",
      mainEntity: metadata.faq.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

function buildTimerMetadata() {
  const title = "온라인 타이머 | 무료 타이머 - ToolMingle";
  const description = "설치 없이 브라우저에서 바로 사용하는 무료 온라인 타이머. 1분부터 60분까지 빠르게 선택하거나 원하는 시간을 직접 설정할 수 있습니다.";
  const canonical = siteUrl + "/timer";
  const faq = [
    ["온라인 타이머는 무료인가요?", "네. ToolMingle의 온라인 타이머는 별도 설치나 회원가입 없이 무료로 사용할 수 있습니다."],
    ["원하는 시간을 직접 설정할 수 있나요?", "네. 직접 설정을 눌러 시간, 분, 초를 입력하면 원하는 시간으로 설정할 수 있습니다."],
    ["타이머가 끝나면 소리가 나나요?", "네. 소리 설정이 켜져 있으면 종료 시 브라우저에서 알림음을 재생합니다."],
    ["모바일에서도 사용할 수 있나요?", "네. 휴대폰과 태블릿을 포함한 모바일 화면에 맞게 사용할 수 있습니다."],
  ];
  return {
    title, description, canonical,
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", name: title, description, url: canonical, inLanguage: "ko-KR" },
        { "@type": "WebApplication", name: "ToolMingle Online Timer", applicationCategory: "UtilitiesApplication", operatingSystem: "Web Browser", url: canonical, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        { "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      ],
    },
  };
}

const vite = await createServer({ configFile: resolve("vite.config.ts"), server: { middlewareMode: true }, appType: "custom" });
try {
  const [{ default: SEOInfoPage, getSEOPage }, { default: TimerPage }, { I18nProvider }] = await Promise.all([
    vite.ssrLoadModule("/src/components/SEOInfoPage.tsx"),
    vite.ssrLoadModule("/src/components/TimerPage.tsx"),
    vite.ssrLoadModule("/src/i18n/I18nContext.tsx"),
  ]);
  const template = await readFile(resolve("dist/index.html"), "utf8");

  for (const route of routes) {
    const isTimer = route === "/timer";
    const pageKey = isTimer ? null : getSEOPage(route);
    if (!isTimer && !pageKey) throw new Error(`${route}: no SEO page component is registered`);

    const component = isTimer
      ? createElement(TimerPage)
      : createElement(SEOInfoPage, { page: pageKey });
    const body = renderToString(createElement(I18nProvider, { initialLanguage: language }, component));
    const rootPattern = /(<div id="root">)[\s\S]*?(<\/div>\s*<script type="module" src="\\/src\\/main\\.tsx")/;
    let html = template.replace(rootPattern, `$1${body}$2`);
    if (html === template) throw new Error("Could not replace the root fallback in index.html");

    const timer = isTimer ? buildTimerMetadata() : null;
    let title, description, canonical, schema;
    if (timer) {
      ({ title, description, canonical, schema } = timer);
    } else {
      const pageData = await vite.ssrLoadModule("/src/components/SEOInfoPage.tsx");
      const data = pageData.getSEOPageMetadata(pageKey, language);
      title = data.title;
      description = data.description;
      canonical = siteUrl + route;
      schema = buildSeoSchema(route, data);
    }

    html = html.replace(/<html[^>]*lang=["'][^"']*["'][^>]*>/i, '<html lang="ko">');
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttribute(title)}</title>`);
    html = setMeta(html, 'meta[name="description"]', "name", "description", description);
    html = setMeta(html, 'meta[property="og:title"]', "property", "og:title", title);
    html = setMeta(html, 'meta[property="og:description"]', "property", "og:description", description);
    html = setMeta(html, 'meta[property="og:url"]', "property", "og:url", canonical);
    html = setMeta(html, 'meta[property="og:type"]', "property", "og:type", "website");
    html = setMeta(html, 'meta[name="twitter:card"]', "name", "twitter:card", "summary");
    html = setMeta(html, 'meta[name="twitter:title"]', "name", "twitter:title", title);
    html = setMeta(html, 'meta[name="twitter:description"]', "name", "twitter:description", description);
    html = setCanonical(html, canonical);
    html = html.replace("</head>", `  <script id="${isTimer ? "toolmingle-timer-jsonld" : "toolmingle-seo-jsonld"}" type="application/ld+json">${JSON.stringify(schema)}</script>\\n</head>`);

    if (!title.trim() || !description.trim() || !html.includes(`href="${canonical}"`) || !html.includes(`content="${escapeAttribute(canonical)}"`)) {
      throw new Error(`${route}: required SEO metadata was not generated`);
    }
    const schemaMatch = html.match(/<script id="(?:toolmingle-seo-jsonld|toolmingle-timer-jsonld)" type="application\\/ld\\+json">([\s\S]*?)<\/script>/);
    if (!schemaMatch) throw new Error(`${route}: missing JSON-LD`);
    JSON.parse(schemaMatch[1]);

    const outputPath = resolve("dist", `${route.slice(1)}.html`);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html, "utf8");
    console.log(`Prerendered ${route} -> ${outputPath}`);
  }

  const homepage = await readFile(resolve("dist/index.html"), "utf8");
  if (!homepage.includes('href="https://toolmingle.dev/"')) {
    throw new Error("Homepage canonical URL was unexpectedly changed");
  }
  console.log(`SEO prerender complete: ${routes.length} routes`);
} finally {
  await vite.close();
}
