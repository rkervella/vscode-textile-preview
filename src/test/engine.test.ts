/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import * as vscode from 'vscode';
import 'mocha';

import { InMemoryDocument } from './inMemoryDocument';
import { createNewTextileEngine } from './engine';

const testFileName = vscode.Uri.file('test.md');

suite('textile.engine', () => {
	suite('rendering', () => {
		const input = 'h1. hello\n\nworld!';
		/* FIXME : maybe 'slugify' plugin ?
		const output = '<h1 id="hello" data-line="0" class="code-line">hello</h1>\n'
			+ '<p data-line="2" class="code-line">world!</p>\n';
		*/
		const output = '<h1 data-line="0" class="code-line">hello</h1>\n'
			+ '<p data-line="2" class="code-line">world!</p>';

		test('Renders a document', async () => {
			const doc = new InMemoryDocument(testFileName, input);
			const engine = createNewTextileEngine();
			assert.strictEqual(await engine.render(doc), output);
		});

		test('Renders a string', async () => {
			const engine = createNewTextileEngine();
			assert.strictEqual(await engine.render(input), output);
		});
	});
});
