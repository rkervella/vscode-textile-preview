/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//import * as crypto from 'crypto';
import TextileJS = require( '../libs/textile-js/textile' );
//import * as path from 'path';
import * as vscode from 'vscode';
import { TextileContributionProvider as TextileContributionProvider } from './textileExtensions';
//import { Slugifier } from './slugify';
import { SkinnyTextDocument } from './tableOfContentsProvider';
//import { getUriForLinkWithKnownExternalScheme } from './util/links';

//const UNICODE_NEWLINE_REGEX = /\u2028|\u2029/g;

interface TextileConfig {
	readonly breaks: boolean;
	readonly linkify: boolean;
}

/* FIXME : activate
class TokenCache {
	private cachedDocument?: {
		readonly uri: vscode.Uri;
		readonly version: number;
		readonly config: TextileItConfig;
	};
	private tokens?: Token[];

	public tryGetCached(document: SkinnyTextDocument, config: TextileItConfig): Token[] | undefined {
		if (this.cachedDocument
			&& this.cachedDocument.uri.toString() === document.uri.toString()
			&& this.cachedDocument.version === document.version
			&& this.cachedDocument.config.breaks === config.breaks
			&& this.cachedDocument.config.linkify === config.linkify
		) {
			return this.tokens;
		}
		return undefined;
	}

	public update(document: SkinnyTextDocument, config: TextileItConfig, tokens: Token[]) {
		this.cachedDocument = {
			uri: document.uri,
			version: document.version,
			config,
		};
		this.tokens = tokens;
	}

	public clean(): void {
		this.cachedDocument = undefined;
		this.tokens = undefined;
	}
}
*/

const FrontMatterRegex = /^---\s*[^]*?(-{3}|\.{3})\s*/;

export class TextileEngine {
	private textile?: Promise<TextileJS>;

	private firstLine?: number;
	private currentDocument?: vscode.Uri;
	//private _slugCount = new Map<string, number>();
	//private _tokenCache = new TokenCache();

	public constructor(
		private readonly contributionProvider: TextileContributionProvider,
		/* FIXME activate : private readonly slugifier: Slugifier,*/
	) {
		contributionProvider.onContributionsChanged(() => {
			// Textile plugin contributions may have changed
			this.textile = undefined;
		});
	}

	private async getEngine(config: TextileConfig): Promise<TextileJS> {
		if (!this.textile) {
			this.textile = import('../libs/textile-js/textile');
			/*
				let md: TextileIt = textileIt(await getTextileOptions(() => md));

				for (const plugin of this.contributionProvider.contributions.textileItPlugins.values()) {
					try {
						md = (await plugin)(md);
					} catch {
						// noop
					}
				}

				const frontMatterPlugin = require('textile-it-front-matter');
				// Extract rules from front matter plugin and apply at a lower precedence
				let fontMatterRule: any;
				frontMatterPlugin({
					block: {
						ruler: {
							before: (_id: any, _id2: any, rule: any) => { fontMatterRule = rule; }
						}
					}
				}, () => { /* noop * / });

				md.block.ruler.before('fence', 'front_matter', fontMatterRule, {
					alt: ['paragraph', 'reference', 'blockquote', 'list']
				});

				for (const renderName of ['paragraph_open', 'heading_open', 'image', 'code_block', 'fence', 'blockquote_open', 'list_item_open']) {
					this.addLineNumberRenderer(md, renderName);
				}

				this.addImageStabilizer(md);
				this.addFencedRenderer(md);
				this.addLinkNormalizer(md);
				this.addLinkValidator(md);
				this.addNamedHeaders(md);
				this.addLinkRenderer(md);
				return md;
			*/
		}
		const textile = await this.textile!;
		return textile;
	}

	private stripFrontmatter(text: string): { text: string, offset: number } {
		let offset = 0;
		const frontMatterMatch = FrontMatterRegex.exec(text);
		if (frontMatterMatch) {
			const frontMatter = frontMatterMatch[0];
			offset = frontMatter.split(/\r\n|\n|\r/g).length - 1;
			text = text.substr(frontMatter.length);
		}
		return { text, offset };
	}

	public async render(input: SkinnyTextDocument | string): Promise<string> {
		this.currentDocument = typeof input === 'string' ? undefined : input.uri;
		const config = this.getConfig(this.currentDocument);
		const engine = await this.getEngine(config);
		let text = typeof input === 'string' ? input : input.getText();

		// Now, always strip frontMatter
		const textileContent = this.stripFrontmatter(text);
		let offset = textileContent.offset;
		text = textileContent.text;

		this.firstLine = offset; // FIXME : non utilisé, et
		//this._slugCount = new Map<string, number>();

		// FIXME : process config.linkify here
		return engine.convert(text, {
			showOriginalLineNumber: true,
			cssClassOriginalLineNumber: 'code-line',
			lineOffset: offset,
			breaks: config.breaks
		});
	}

	/* FIXME : not used for textile
	public async parse(document: SkinnyTextDocument): Promise<Token[]> {
		const config = this.getConfig(document.uri);
		const engine = await this.getEngine(config);
		return this.tokenizeDocument(document, config, engine);
	}
	*/

	public cleanCache(): void {
		/* FIXME : activate
		this._tokenCache.clean();
		*/
	}

	private getConfig(resource?: vscode.Uri): TextileConfig {
		const config = vscode.workspace.getConfiguration('textile', resource);
		return {
			breaks: config.get<boolean>('preview.breaks', false),
			linkify: config.get<boolean>('preview.linkify', true)
		};
	}

	/* FIXME : not used for textile
	private addLineNumberRenderer(md: any, ruleName: string): void {
		const original = md.renderer.rules[ruleName];
		md.renderer.rules[ruleName] = (tokens: any, idx: number, options: any, env: any, self: any) => {
			const token = tokens[idx];
			if (token.map && token.map.length) {
				token.attrSet('data-line', this.firstLine + token.map[0]);
				token.attrJoin('class', 'code-line');
			}

			if (original) {
				return original(tokens, idx, options, env, self);
			} else {
				return self.renderToken(tokens, idx, options, env, self);
			}
		};
	}

	private addImageStabilizer(md: any): void {
		const original = md.renderer.rules.image;
		md.renderer.rules.image = (tokens: any, idx: number, options: any, env: any, self: any) => {
			const token = tokens[idx];
			token.attrJoin('class', 'loading');

			const src = token.attrGet('src');
			if (src) {
				const hash = crypto.createHash('sha256');
				hash.update(src);
				const imgHash = hash.digest('hex');
				token.attrSet('id', `image-hash-${imgHash}`);
			}

			if (original) {
				return original(tokens, idx, options, env, self);
			} else {
				return self.renderToken(tokens, idx, options, env, self);
			}
		};
	}

	private addFencedRenderer(md: any): void {
		const original = md.renderer.rules['fenced'];
		md.renderer.rules['fenced'] = (tokens: any, idx: number, options: any, env: any, self: any) => {
			const token = tokens[idx];
			if (token.map && token.map.length) {
				token.attrJoin('class', 'hljs');
			}

			return original(tokens, idx, options, env, self);
		};
	}

	private addLinkNormalizer(md: any): void {
		const normalizeLink = md.normalizeLink;
		md.normalizeLink = (link: string) => {
			try {
				// If original link doesn't look like a url with a scheme, assume it must be a link to a file in workspace
				if (!/^[a-z\-]+:/i.test(link)) {
					// Use a fake scheme for parsing
					let uri = vscode.Uri.parse('textile-link:' + link);

					// Relative paths should be resolved correctly inside the preview but we need to
					// handle absolute paths specially (for images) to resolve them relative to the workspace root
					if (uri.path[0] === '/') {
						const root = vscode.workspace.getWorkspaceFolder(this.currentDocument!);
						if (root) {
							uri = uri.with({
								path: path.join(root.uri.fsPath, uri.path),
							});
						}
					}

					if (uri.fragment) {
						uri = uri.with({
							fragment: this.slugifier.fromHeading(uri.fragment).value
						});
					}
					return normalizeLink(uri.toString(true).replace(/^textile-link:/, ''));
				}
			} catch (e) {
				// noop
			}
			return normalizeLink(link);
		};
	}

	private addLinkValidator(md: any): void {
		const validateLink = md.validateLink;
		md.validateLink = (link: string) => {
			// support file:// links
			return validateLink(link) || isOfScheme(Schemes.file, link) || /^data:image\/.*?;/.test(link);
		};
	}

	private addNamedHeaders(md: any): void {
		const original = md.renderer.rules.heading_open;
		md.renderer.rules.heading_open = (tokens: any, idx: number, options: any, env: any, self: any) => {
			const title = tokens[idx + 1].children.reduce((acc: string, t: any) => acc + t.content, '');
			let slug = this.slugifier.fromHeading(title);

			if (this._slugCount.has(slug.value)) {
				const count = this._slugCount.get(slug.value)!;
				this._slugCount.set(slug.value, count + 1);
				slug = this.slugifier.fromHeading(slug.value + '-' + (count + 1));
			} else {
				this._slugCount.set(slug.value, 0);
			}

			tokens[idx].attrs = tokens[idx].attrs || [];
			tokens[idx].attrs.push(['id', slug.value]);

			if (original) {
				return original(tokens, idx, options, env, self);
			} else {
				return self.renderToken(tokens, idx, options, env, self);
			}
		};
	}

	private addLinkRenderer(md: any): void {
		const old_render = md.renderer.rules.link_open || ((tokens: any, idx: number, options: any, _env: any, self: any) => {
			return self.renderToken(tokens, idx, options);
		});

		md.renderer.rules.link_open = (tokens: any, idx: number, options: any, env: any, self: any) => {
			const token = tokens[idx];
			const hrefIndex = token.attrIndex('href');
			if (hrefIndex >= 0) {
				const href = token.attrs[hrefIndex][1];
				token.attrPush(['data-href', href]);
			}
			return old_render(tokens, idx, options, env, self);
		};
	}
	*/
}

/* FIXME ?
async function getTextileOptions(md: () => TextileIt) {
	const hljs = await import('highlight.js');
	return {
		html: true,
		highlight: (str: string, lang?: string) => {
			lang = normalizeHighlightLang(lang);
			if (lang && hljs.getLanguage(lang)) {
				try {
					return `<div>${hljs.highlight(lang, str, true).value}</div>`;
				}
				catch (error) { }
			}
			return `<code><div>${md().utils.escapeHtml(str)}</div></code>`;
		}
	};
}

function normalizeHighlightLang(lang: string | undefined) {
	switch (lang && lang.toLowerCase()) {
		case 'tsx':
		case 'typescriptreact':
			// Workaround for highlight not supporting tsx: https://github.com/isagalaev/highlight.js/issues/1155
			return 'jsx';

		case 'json5':
		case 'jsonc':
			return 'json';

		case 'c#':
		case 'csharp':
			return 'cs';

		default:
			return lang;
	}
}
*/
