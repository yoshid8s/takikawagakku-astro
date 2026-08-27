import fs from "node:fs/promises";
import path from "node:path";

const WP_API = "https://takikawagakku.jp/wp-json/wp/v2";

const OUTPUT_DIR = path.resolve("src/content/blog");
const IMAGE_DIR = path.resolve("public/images/blog");

const POSTS_PER_PAGE = 100;

/* =========================================================
   Text helpers
========================================================= */

function decodeHtml(text = "") {
  return text
    .replace(/&#038;/g, "&")
    .replace(/&#38;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(html = "") {
  return decodeHtml(html)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function yamlString(value = "") {
  return JSON.stringify(decodeHtml(value));
}

function normalizeSlug(slug = "") {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/* =========================================================
   Categories
========================================================= */

function categoryData(post) {
  const terms = post?._embedded?.["wp:term"]?.flat() ?? [];

  return terms
    .filter((term) => term.taxonomy === "category")
    .map((term) => ({
      id: term.id,
      name: decodeHtml(term.name),
      slug: normalizeSlug(term.slug),
    }));
}

/* =========================================================
   Featured image
========================================================= */

function getFeaturedImage(post) {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];

  if (media?.source_url) {
    return media.source_url;
  }

  const yoastImage = post?.yoast_head_json?.og_image?.[0]?.url;

  return yoastImage || undefined;
}

/* =========================================================
   WordPress upload image
========================================================= */

function isWordPressUpload(url) {
  return (
    typeof url === "string" &&
    url.startsWith("https://takikawagakku.jp/wp/wp-content/uploads/")
  );
}

/*
 * WordPressの自動生成縮小サイズを外す
 *
 * example:
 *
 * photo-724x1024.png
 *
 * ↓
 *
 * photo.png
 */
function removeWpImageSize(filename) {
  return filename.replace(/-\d+x\d+(?=\.[^.]+$)/, "");
}

function localImagePath(url) {
  const parsed = new URL(url);

  const marker = "/wp/wp-content/uploads/";

  const index = parsed.pathname.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const relative = parsed.pathname.slice(index + marker.length);

  const parts = relative.split("/");

  const filename = removeWpImageSize(parts.pop());

  const relativePath = path.posix.join(...parts, filename);

  return {
    relativePath,

    publicPath: `/images/blog/${relativePath}`,

    diskPath: path.join(IMAGE_DIR, relativePath),
  };
}

/* =========================================================
   Download image
========================================================= */

async function downloadImage(url) {
  if (!isWordPressUpload(url)) {
    return url;
  }

  const target = localImagePath(url);

  if (!target) {
    return url;
  }

  try {
    await fs.access(target.diskPath);

    console.log(`Image exists: ${target.publicPath}`);

    return target.publicPath;
  } catch {
    // not downloaded yet
  }

  console.log(`Downloading: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Image download failed: ` + `${response.status} ${url}`);

      return url;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    await fs.mkdir(path.dirname(target.diskPath), {
      recursive: true,
    });

    await fs.writeFile(target.diskPath, buffer);

    console.log(`Saved image: ${target.publicPath}`);

    return target.publicPath;
  } catch (error) {
    console.warn(`Image download error: ${url}`);

    console.warn(error);

    return url;
  }
}

/* =========================================================
   Find original image URL
========================================================= */

function findLinkedOriginals(html) {
  const map = new Map();

  const regex =
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>\s*<img\b[^>]*src=["']([^"']+)["'][^>]*>\s*<\/a>/gi;

  let match;

  while ((match = regex.exec(html)) !== null) {
    const href = match[1];

    const src = match[2];

    if (isWordPressUpload(href) && isWordPressUpload(src)) {
      map.set(src, href);
    }
  }

  return map;
}

/* =========================================================
   Process content images
========================================================= */

async function processContentImages(html) {
  const linkedOriginals = findLinkedOriginals(html);

  const imgRegex = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;

  const urls = new Set();

  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];

    if (isWordPressUpload(src)) {
      urls.add(src);
    }
  }

  const replacements = new Map();

  for (const src of urls) {
    /*
     * 元画像へのリンクがあれば
     * そちらを優先
     */
    const originalUrl = linkedOriginals.get(src) || src;

    const local = await downloadImage(originalUrl);

    replacements.set(src, local);

    replacements.set(originalUrl, local);
  }

  let result = html;

  for (const [remote, local] of replacements) {
    result = result.split(remote).join(local);
  }

  /*
   * WordPressレスポンシブ画像属性は
   * Astro移管後には不要
   */
  result = result.replace(/\s+srcset=["'][^"']*["']/gi, "");

  result = result.replace(/\s+sizes=["'][^"']*["']/gi, "");

  return result;
}

/* =========================================================
   Markdown
========================================================= */

async function buildMarkdown(post) {
  const categories = categoryData(post);

  const excerpt = stripHtml(post.excerpt?.rendered ?? "");

  const remoteFeaturedImage = getFeaturedImage(post);

  let featuredImage;

  if (remoteFeaturedImage) {
    featuredImage = await downloadImage(remoteFeaturedImage);
  }

  const content = await processContentImages(post.content.rendered.trim());

  const categoryYaml = categories.length
    ? categories
        .map(
          (category) =>
            `  - id: ${category.id}
    name: ${yamlString(category.name)}
    slug: ${yamlString(category.slug)}`,
        )
        .join("\n")
    : "[]";

  const frontmatter = `---
wpId: ${post.id}
title: ${yamlString(post.title.rendered)}
slug: ${yamlString(normalizeSlug(post.slug))}
date: ${yamlString(post.date)}
modified: ${yamlString(post.modified)}
excerpt: ${yamlString(excerpt)}
categories:
${categoryYaml}
${
  featuredImage ? `featuredImage: ${yamlString(featuredImage)}\n` : ""
}originalUrl: ${yamlString(post.link)}
---

`;

  return frontmatter + content + "\n";
}

/* =========================================================
   Fetch all WordPress posts
========================================================= */

async function fetchAllPosts() {
  const allPosts = [];

  let page = 1;
  let totalPages = 1;

  do {
    const url =
      `${WP_API}/posts` +
      `?per_page=${POSTS_PER_PAGE}` +
      `&page=${page}` +
      `&_embed`;

    console.log("");
    console.log(`Fetching posts page ${page}...`);

    console.log(url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `WordPress API error: ` +
          `${response.status} ` +
          `${response.statusText}`,
      );
    }

    const posts = await response.json();

    if (page === 1) {
      totalPages = Number(response.headers.get("X-WP-TotalPages")) || 1;

      const totalPosts = response.headers.get("X-WP-Total");

      console.log(`Total posts: ${totalPosts}`);

      console.log(`Total API pages: ${totalPages}`);
    }

    allPosts.push(...posts);

    console.log(`Fetched: ${posts.length}`);

    page += 1;
  } while (page <= totalPages);

  return allPosts;
}

/* =========================================================
   Import posts
========================================================= */

async function importPosts(posts) {
  let imported = 0;
  let failed = 0;

  for (let index = 0; index < posts.length; index += 1) {
    const post = posts[index];

    console.log("");
    console.log(
      `[${index + 1}/${posts.length}] ` + `${decodeHtml(post.title.rendered)}`,
    );

    try {
      const markdown = await buildMarkdown(post);

      const filename = `${post.id}.md`;

      const filepath = path.join(OUTPUT_DIR, filename);

      await fs.writeFile(filepath, markdown, "utf8");

      console.log(`Created: ${filepath}`);

      imported += 1;
    } catch (error) {
      failed += 1;

      console.error(`Failed post ID ${post.id}`);

      console.error(error);
    }
  }

  return {
    imported,
    failed,
  };
}

/* =========================================================
   Main
========================================================= */

async function main() {
  console.log("WordPress → Astro blog import");

  console.log("==============================");

  await fs.mkdir(OUTPUT_DIR, {
    recursive: true,
  });

  await fs.mkdir(IMAGE_DIR, {
    recursive: true,
  });

  const posts = await fetchAllPosts();

  console.log("");
  console.log(`Starting import: ${posts.length} posts`);

  const result = await importPosts(posts);

  console.log("");
  console.log("==============================");

  console.log("Import complete");

  console.log(`Imported: ${result.imported}`);

  console.log(`Failed: ${result.failed}`);
}

main().catch((error) => {
  console.error("");
  console.error("Import aborted");

  console.error(error);

  process.exit(1);
});
