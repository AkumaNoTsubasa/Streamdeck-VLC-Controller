import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "com.akuma.vlc-controller.sdPlugin", "imgs");

const glyphs = {
	play: `<polygon points="8,5 8,19 19,12"/>`,
	pause: `<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>`,
	"play-pause": `<polygon points="4,5 4,19 13,12"/><rect x="15.5" y="5" width="2.5" height="14" rx="1"/><rect x="19.5" y="5" width="2.5" height="14" rx="1"/>`,
	stop: `<rect x="6" y="6" width="12" height="12" rx="1.5"/>`,
	next: `<polygon points="6,5 6,19 15,12"/><rect x="16.5" y="5" width="2.5" height="14" rx="1"/>`,
	previous: `<rect x="5" y="5" width="2.5" height="14" rx="1"/><polygon points="19,5 19,19 10,12"/>`,
	"volume-up": `<polygon points="3,9 7,9 12,5 12,19 7,15 3,15"/><path d="M15 8.5a5 5 0 0 1 0 7" fill="none" stroke-width="2" stroke-linecap="round"/><rect x="17.5" y="10.75" width="5" height="2.5" rx="1"/><rect x="18.75" y="9.5" width="2.5" height="5" rx="1"/>`,
	"volume-down": `<polygon points="3,9 7,9 12,5 12,19 7,15 3,15"/><path d="M15 8.5a5 5 0 0 1 0 7" fill="none" stroke-width="2" stroke-linecap="round"/><rect x="17.5" y="10.75" width="5" height="2.5" rx="1"/>`,
	shuffle: `<g fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h4l9 12h3"/><path d="M4 18h4l3-4"/><path d="M14 8l3-2"/></g><polygon points="18,2 22,6 18,8"/><polygon points="18,16 22,20 18,22"/>`,
	loop: `<g fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12V9a4 4 0 0 1 4-4h8"/><path d="M20 12v3a4 4 0 0 1-4 4H8"/></g><polygon points="16,2 20,5 16,8"/><polygon points="8,16 4,19 8,22"/>`,
	"load-playlist": `<rect x="3" y="6" width="11" height="2.2" rx="1.1"/><rect x="3" y="11" width="11" height="2.2" rx="1.1"/><rect x="3" y="16" width="7" height="2.2" rx="1.1"/><rect x="16.5" y="13" width="2.4" height="7" rx="1.1"/><rect x="14.25" y="15.3" width="7" height="2.4" rx="1.1"/>`,
	"track-title": `<circle cx="8" cy="17" r="3"/><rect x="10.5" y="5" width="2.2" height="12" rx="1"/><path d="M11 5c4 0 7 1 8 3" fill="none" stroke-width="2.2" stroke-linecap="round"/>`,
};

const coneSource = readFileSync(resolve(here, "vlc-cone.svg"), "utf8");
const conePng = new Resvg(coneSource, { fitTo: { mode: "width", value: 320 } }).render().asPng();
const coneUri = `data:image/png;base64,${conePng.toString("base64")}`;
const CONE_ASPECT = 770 / 680;

const coneBadge = `<image href="${coneUri}" x="45.5" y="42.7" width="25" height="${(25 * CONE_ASPECT).toFixed(2)}"/>`;

function svgDocument(width, height, body) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

function renderPng(svg, width) {
	return new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
}

function listIcon(glyph) {
	return svgDocument(20, 20, `<g fill="#FFFFFF" stroke="#FFFFFF" transform="scale(0.8333)">${glyph}</g>`);
}

function keyIconSvg(glyph) {
	const glyphLayer = `<g transform="translate(14 10) scale(1.83)"><g fill="#FFFFFF" stroke="#FFFFFF">${glyph}</g></g>`;
	return svgDocument(72, 72, glyphLayer + coneBadge);
}

function writeKey(dir, name, glyph) {
	const svg = keyIconSvg(glyph);
	writeFileSync(resolve(dir, `${name}.png`), renderPng(svg, 72));
	writeFileSync(resolve(dir, `${name}@2x.png`), renderPng(svg, 144));
}

rmSync(resolve(root, "actions"), { recursive: true, force: true });

const actions = Object.keys(glyphs);
for (const name of actions) {
	const dir = resolve(root, "actions", name);
	mkdirSync(dir, { recursive: true });
	writeFileSync(resolve(dir, "icon.svg"), listIcon(glyphs[name]));
	writeKey(dir, "key", glyphs[name]);
}

const playPauseDir = resolve(root, "actions", "play-pause");
writeKey(playPauseDir, "key", glyphs.play);
writeKey(playPauseDir, "key-playing", glyphs.pause);

const shuffleDir = resolve(root, "actions", "shuffle");
const shuffleSequential = `<g fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h14"/><path d="M3 17h14"/></g><polygon points="16,4 21,7 16,10"/><polygon points="16,14 21,17 16,20"/>`;
writeKey(shuffleDir, "key", shuffleSequential);
writeKey(shuffleDir, "key-on", glyphs.shuffle);

const loopDir = resolve(root, "actions", "loop");
const loopOff = glyphs.loop + `<line x1="3.5" y1="3.5" x2="20.5" y2="20.5" fill="none" stroke-width="2" stroke-linecap="round"/>`;
const loopOne = glyphs.loop + `<path d="M10.8 10.4l1.7-1v6.2" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
writeKey(loopDir, "key", loopOff);
writeKey(loopDir, "key-all", glyphs.loop);
writeKey(loopDir, "key-one", loopOne);

mkdirSync(resolve(root, "plugin"), { recursive: true });
// Monochrome category icon from the real cone: feColorMatrix sets alpha = (R - B), turning the
// orange body opaque white and the grey snow stripes transparent — keeps the logo recognisable.
const categoryIcon = (size) => {
	const w = size * 0.86;
	const h = w * CONE_ASPECT;
	return svgDocument(
		size,
		size,
		`<defs><filter id="m" x="0" y="0" width="100%" height="100%"><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  4 0 -4 0 0"/></filter></defs>` +
			`<image href="${coneUri}" x="${(size - w) / 2}" y="${(size - h) / 2}" width="${w}" height="${h}" filter="url(#m)"/>`,
	);
};
writeFileSync(resolve(root, "plugin", "category-icon.png"), renderPng(categoryIcon(28), 28));
writeFileSync(resolve(root, "plugin", "category-icon@2x.png"), renderPng(categoryIcon(56), 56));

const marketplaceSvg = (size) =>
	svgDocument(
		size,
		size,
		`<rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#1C1C1E"/>` +
			`<image href="${coneUri}" x="${size * 0.22}" y="${size * 0.17}" width="${size * 0.56}" height="${size * 0.56 * CONE_ASPECT}"/>`,
	);

for (const [suffix, size] of [["", 256], ["@2x", 512]]) {
	writeFileSync(resolve(root, "plugin", `marketplace${suffix}.png`), renderPng(marketplaceSvg(size), size));
}

console.log(`Generated icons for ${actions.length} actions + plugin assets.`);
