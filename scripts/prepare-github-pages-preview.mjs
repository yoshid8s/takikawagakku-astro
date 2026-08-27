import fs from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const BASE = '/takikawagakku-astro';

const TEXT_EXTENSIONS = new Set([
	'.html',
	'.css',
	'.js',
	'.mjs',
	'.xml',
	'.txt',
	'.json',
]);

async function walk(dir) {
	const entries = await fs.readdir(dir, {
		withFileTypes: true,
	});

	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...await walk(fullPath));
		} else {
			files.push(fullPath);
		}
	}

	return files;
}

function rewriteRootRelativeUrls(content) {
	return content
		/*
		 * HTML attributes
		 */
		.replace(
			/\b(href|src|action|poster)=("|')\/(?!\/)/g,
			`$1=$2${BASE}/`
		)

		/*
		 * data attributes used by lightboxes etc.
		 */
		.replace(
			/\b(data-[a-zA-Z0-9_-]+)=("|')\/(?!\/)/g,
			`$1=$2${BASE}/`
		)

		/*
		 * CSS url(...)
		 */
		.replace(
			/url\((["']?)\/(?!\/)/g,
			`url($1${BASE}/`
		)

		/*
		 * JavaScript string literals containing
		 * known site-root paths.
		 */
		.replace(
			/(["'])\/(images|blog|about|event|community|child_club|crisis_management|takikawa_community_icenter|category)(\/)/g,
			`$1${BASE}/$2$3`
		);
}

async function main() {
	const files = await walk(DIST_DIR);

	let changed = 0;

	for (const file of files) {
		const ext = path.extname(file).toLowerCase();

		if (!TEXT_EXTENSIONS.has(ext)) {
			continue;
		}

		const original = await fs.readFile(file, 'utf8');
		const rewritten = rewriteRootRelativeUrls(original);

		if (rewritten !== original) {
			await fs.writeFile(file, rewritten, 'utf8');
			changed += 1;
		}
	}

	console.log(
		`GitHub Pages preview paths prepared: ${changed} files changed`
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
