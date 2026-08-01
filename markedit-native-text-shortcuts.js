// markedit-native-text-shortcuts
// Version: 1.1.2
// Repository: https://github.com/Nigelw/MarkEdit-native-text-shortcuts

(() => {
  const { keymap } = MarkEdit.codemirror.view;
  const { EditorSelection, Prec } = MarkEdit.codemirror.state;
  const { syntaxTree } = MarkEdit.codemirror.language;

  const EXTENSION_NAME = 'Native Text Shortcuts';
  const GITHUB_REPO = 'Nigelw/MarkEdit-native-text-shortcuts';
  const REPO_URL = `https://github.com/${GITHUB_REPO}`;
  const RELEASE_NOTES_URL = `${REPO_URL}/blob/main/CHANGELOG.md`;
  const SETTINGS_NAMESPACE = 'extension.markeditNativeTextShortcuts';
  const SETTINGS_FILE_NAME = 'settings.json';
  const wordSegmenter = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'word' })
    : undefined;
  let wordLikePattern;

  try {
    wordLikePattern = new RegExp('[\\p{Alphabetic}\\p{Number}_]', 'u');
  } catch {
    wordLikePattern = /[A-Za-z0-9_]/;
  }

  let cachedWordSegmentDocument;
  let cachedWordSegmentLineFrom;
  let cachedWordSegmentLineTo;
  let cachedWordSegments;

  function paragraphBoundary(state, position, direction) {
    const doc = state.doc;
    const line = doc.lineAt(position);

    if (direction < 0) {
      if (position === line.from && line.number > 1) {
        return doc.line(line.number - 1).from;
      }

      return line.from;
    }

    if (position === line.to && line.number < doc.lines) {
      return doc.line(line.number + 1).to;
    }

    return line.to;
  }

  function moveToParagraphBoundary(view, direction, extend) {
    const { state } = view;
    const ranges = state.selection.ranges.map(range => {
      const target = paragraphBoundary(state, range.head, direction);
      return extend
        ? EditorSelection.range(range.anchor, target)
        : EditorSelection.cursor(target);
    });

    view.dispatch({
      selection: EditorSelection.create(ranges, state.selection.mainIndex),
      scrollIntoView: true,
    });

    return true;
  }

  function usesCodeNavigationInCodeBlocks() {
    try {
      return MarkEdit.userSettings?.[SETTINGS_NAMESPACE]?.codeNavigationInCodeBlocks === true;
    } catch {
      return false;
    }
  }

  async function setCodeNavigationInCodeBlocks(enabled) {
    if (typeof enabled !== 'boolean') {
      return;
    }

    const path = `${MarkEdit.getDirectoryPath('documents')}/${SETTINGS_FILE_NAME}`;
    let settings;

    try {
      const content = await MarkEdit.getFileContent(path);
      if (content === undefined || content.trim().length === 0) {
        settings = {};
      } else {
        const parsed = JSON.parse(content);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('settings.json must contain a JSON object.');
        }
        settings = parsed;
      }
    } catch {
      await MarkEdit.showAlert({
        title: "Couldn't update settings.json",
        message: `Your ${SETTINGS_FILE_NAME} couldn't be parsed as JSON, so it was left unchanged.`,
        buttons: ['OK'],
      });
      return;
    }

    const existing = typeof settings[SETTINGS_NAMESPACE] === 'object' && settings[SETTINGS_NAMESPACE] !== null
      ? settings[SETTINGS_NAMESPACE]
      : {};
    settings[SETTINGS_NAMESPACE] = {
      ...existing,
      codeNavigationInCodeBlocks: enabled,
    };

    const ok = await MarkEdit.createFile({
      path,
      string: `${JSON.stringify(settings, null, 2)}\n`,
      overwrites: true,
    });

    if (!ok) {
      await MarkEdit.showAlert({
        title: 'Failed to write settings.json',
        message: `Could not write ${SETTINGS_FILE_NAME}. Check that MarkEdit can access its Documents folder.`,
        buttons: ['OK'],
      });
      return;
    }

    // Current MarkEdit versions don't require a restart to make extension
    // settings visible. Use loadSettings when available, then update the
    // already-loaded settings object for versions that don't expose it.
    await MarkEdit.loadSettings?.();
    MarkEdit.userSettings[SETTINGS_NAMESPACE] = settings[SETTINGS_NAMESPACE];
  }

  function isInCodeBlock(state, position) {
    for (let node = syntaxTree(state).resolveInner(position, -1); node !== null; node = node.parent) {
      if (node.name === 'FencedCode' || node.name === 'CodeBlock') {
        return true;
      }
    }

    return false;
  }

  function wordSegments(state, line) {
    if (cachedWordSegmentDocument === state.doc
      && cachedWordSegmentLineFrom === line.from
      && cachedWordSegmentLineTo === line.to) {
      return cachedWordSegments;
    }

    cachedWordSegmentDocument = state.doc;
    cachedWordSegmentLineFrom = line.from;
    cachedWordSegmentLineTo = line.to;
    cachedWordSegments = [];

    for (const segment of wordSegmenter.segment(line.text)) {
      // WebKit's isWordLike has treated number-only segments differently
      // across releases. Retain its positive signal, but also consider a
      // segment containing a letter, number, or underscore to be a word.
      const isWordLike = segment.isWordLike === true || wordLikePattern.test(segment.segment);

      if (isWordLike) {
        cachedWordSegments.push({
          from: segment.index,
          to: segment.index + segment.segment.length,
        });
      }
    }

    return cachedWordSegments;
  }

  function wordBoundary(state, position, direction) {
    const { doc } = state;
    let line = doc.lineAt(position);
    let localPosition = position - line.from;

    for (;;) {
      const segments = wordSegments(state, line);

      if (direction > 0) {
        for (const segment of segments) {
          if (segment.to > localPosition) {
            return line.from + segment.to;
          }
        }

        if (line.number === doc.lines) {
          return doc.length;
        }

        line = doc.line(line.number + 1);
        localPosition = 0;
      } else {
        for (let index = segments.length - 1; index >= 0; index -= 1) {
          if (segments[index].from < localPosition) {
            return line.from + segments[index].from;
          }
        }

        if (line.number === 1) {
          return 0;
        }

        line = doc.line(line.number - 1);
        localPosition = line.length;
      }
    }
  }

  function nativeWordDirection(view, right) {
    // CodeMirror's Direction.LTR enum value is 0. Match its built-in
    // Option-Left/Right behavior for right-to-left text.
    const isLTR = view.textDirectionAt(view.state.selection.main.head) === 0;
    return right === isLTR ? 1 : -1;
  }

  function moveByNativeWord(view, right, extend) {
    const { state } = view;

    if (wordSegmenter === undefined) {
      return false;
    }

    // Returning false leaves the key to CodeMirror's normal command. This
    // preserves source-editor-style navigation in Markdown code blocks.
    if (usesCodeNavigationInCodeBlocks()
      && state.selection.ranges.some(range => isInCodeBlock(state, range.head))) {
      return false;
    }

    const direction = nativeWordDirection(view, right);
    const ranges = state.selection.ranges.map(range => {
      if (!extend && !range.empty) {
        return EditorSelection.cursor(direction > 0 ? range.to : range.from);
      }

      const target = wordBoundary(state, range.head, direction);
      return extend
        ? EditorSelection.range(range.anchor, target)
        : EditorSelection.cursor(target);
    });
    const selection = EditorSelection.create(ranges, state.selection.mainIndex);

    if (selection.eq(state.selection, true)) {
      return false;
    }

    view.dispatch({
      selection,
      scrollIntoView: true,
    });

    return true;
  }

  function openURL(url) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  if (typeof MarkEdit.addMainMenuItem === 'function') {
    MarkEdit.addMainMenuItem({
      title: EXTENSION_NAME,
      children: [
        {
          title: 'Use Code-Style Word Navigation in Code Blocks',
          action: () => void setCodeNavigationInCodeBlocks(
            !usesCodeNavigationInCodeBlocks(),
          ),
          state: () => ({ isSelected: usesCodeNavigationInCodeBlocks() }),
        },
        { separator: true },
        {
          title: 'Visit GitHub Project',
          action: () => openURL(REPO_URL),
        },
        {
          title: 'View Release Notes',
          action: () => openURL(RELEASE_NOTES_URL),
        },
      ],
    });
  }

  MarkEdit.addExtension(Prec.highest(keymap.of([
    {
      key: 'Alt-ArrowLeft',
      mac: 'Alt-ArrowLeft',
      run: view => moveByNativeWord(view, false, false),
      preventDefault: true,
    },
    {
      key: 'Alt-ArrowRight',
      mac: 'Alt-ArrowRight',
      run: view => moveByNativeWord(view, true, false),
      preventDefault: true,
    },
    {
      key: 'Shift-Alt-ArrowLeft',
      mac: 'Shift-Alt-ArrowLeft',
      run: view => moveByNativeWord(view, false, true),
      preventDefault: true,
    },
    {
      key: 'Shift-Alt-ArrowRight',
      mac: 'Shift-Alt-ArrowRight',
      run: view => moveByNativeWord(view, true, true),
      preventDefault: true,
    },
    {
      key: 'Alt-ArrowUp',
      mac: 'Alt-ArrowUp',
      run: view => moveToParagraphBoundary(view, -1, false),
    },
    {
      key: 'Alt-ArrowDown',
      mac: 'Alt-ArrowDown',
      run: view => moveToParagraphBoundary(view, 1, false),
    },
    {
      key: 'Shift-Alt-ArrowUp',
      mac: 'Shift-Alt-ArrowUp',
      run: view => moveToParagraphBoundary(view, -1, true),
    },
    {
      key: 'Shift-Alt-ArrowDown',
      mac: 'Shift-Alt-ArrowDown',
      run: view => moveToParagraphBoundary(view, 1, true),
    },
  ])));

})();
