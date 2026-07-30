// markedit-native-text-shortcuts
// Version: 1.1.0
// Repository: https://github.com/Nigelw/MarkEdit-native-text-shortcuts

(() => {
  const { keymap } = MarkEdit.codemirror.view;
  const { EditorSelection, Prec } = MarkEdit.codemirror.state;
  const { syntaxTree } = MarkEdit.codemirror.language;

  const EXTENSION_NAME = 'Native Text Shortcuts';
  const CURRENT_VERSION = '1.1.0';
  const GITHUB_REPO = 'Nigelw/MarkEdit-native-text-shortcuts';
  const REPO_URL = `https://github.com/${GITHUB_REPO}`;
  const RELEASE_NOTES_URL = `${REPO_URL}/blob/main/CHANGELOG.md`;
  const LATEST_RELEASE_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
  const UPDATE_ASSET_NAME = 'markedit-native-text-shortcuts.js';
  const SETTINGS_NAMESPACE = 'extension.markeditNativeTextShortcuts';
  const LAST_CHECK_STORAGE_KEY = 'markedit-native-text-shortcuts.updater.last-check';
  const SKIPPED_VERSIONS_STORAGE_KEY = 'markedit-native-text-shortcuts.updater.skipped';
  const SETTINGS_FILE_NAME = 'settings.json';
  const CHECK_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
  const WORD_NAVIGATION_OPTIONS = ['proseOnly', 'everywhere', 'disabled'];
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

  function wordNavigationBehavior() {
    try {
      const behavior = MarkEdit.userSettings?.[SETTINGS_NAMESPACE]?.wordNavigation;
      return WORD_NAVIGATION_OPTIONS.includes(behavior) ? behavior : 'everywhere';
    } catch {
      return 'everywhere';
    }
  }

  async function setWordNavigationBehavior(behavior) {
    if (!WORD_NAVIGATION_OPTIONS.includes(behavior)) {
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
    settings[SETTINGS_NAMESPACE] = { ...existing, wordNavigation: behavior };

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
    const behavior = wordNavigationBehavior();

    if (behavior === 'disabled' || wordSegmenter === undefined) {
      return false;
    }

    // Returning false leaves the key to CodeMirror's normal command. This
    // preserves source-editor-style navigation in Markdown code blocks.
    if (behavior === 'proseOnly' && state.selection.ranges.some(range => isInCodeBlock(state, range.head))) {
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

  function updateBehavior() {
    try {
      const behavior = MarkEdit.userSettings?.[SETTINGS_NAMESPACE]?.update;
      return ['automatic', 'notify', 'never'].includes(behavior) ? behavior : 'notify';
    } catch {
      return 'notify';
    }
  }

  function parseVersion(value) {
    const match = value.trim().match(/^v?(\d+(?:\.\d+)*)/);
    return match ? match[1].split('.').map(part => parseInt(part, 10)) : undefined;
  }

  function isNewer(remote, current) {
    const a = parseVersion(remote);
    const b = parseVersion(current);

    if (a === undefined || b === undefined) {
      return remote !== current;
    }

    const length = Math.max(a.length, b.length);
    for (let i = 0; i < length; i += 1) {
      const diff = (a[i] ?? 0) - (b[i] ?? 0);
      if (diff !== 0) {
        return diff > 0;
      }
    }

    return false;
  }

  function skippedVersions() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SKIPPED_VERSIONS_STORAGE_KEY) ?? '[]');
      return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function skipVersion(tag) {
    const set = skippedVersions();
    set.add(tag);
    localStorage.setItem(SKIPPED_VERSIONS_STORAGE_KEY, JSON.stringify([...set]));
  }

  async function fetchLatestRelease() {
    const response = await fetch(LATEST_RELEASE_URL);
    if (!response.ok) {
      return undefined;
    }

    const release = await response.json();
    return typeof release?.tag_name === 'string' ? release : undefined;
  }

  async function downloadAndInstall(release) {
    const path = typeof __FILE_PATH__ === 'string' ? __FILE_PATH__ : undefined;
    if (path === undefined) {
      console.error(`${EXTENSION_NAME} updater: unknown script path, cannot install.`);
      return false;
    }

    const asset = release.assets?.find(candidate => candidate.name === UPDATE_ASSET_NAME);
    if (asset === undefined) {
      console.error(`${EXTENSION_NAME} updater: release ${release.tag_name} has no ${UPDATE_ASSET_NAME} asset.`);
      return false;
    }

    try {
      const response = await fetch(asset.browser_download_url);
      if (!response.ok) {
        console.error(`${EXTENSION_NAME} updater: failed to download ${asset.browser_download_url} (${response.status}).`);
        return false;
      }

      const code = await response.text();
      return MarkEdit.createFile({ path, string: code, overwrites: true });
    } catch (error) {
      console.error(`${EXTENSION_NAME} updater: download failed:`, error);
      return false;
    }
  }

  async function installAndReport(release) {
    const ok = await downloadAndInstall(release);
    await MarkEdit.showAlert(
      ok
        ? {
            title: `Updated to ${release.tag_name}`,
            message: `Restart MarkEdit to start using the new version of ${EXTENSION_NAME}.`,
            buttons: ['OK'],
          }
        : {
            title: 'Update failed',
            message: `The ${EXTENSION_NAME} extension couldn't download the latest build. Check your connection and try again from Extensions -> ${EXTENSION_NAME} -> Check for Updates...`,
            buttons: ['OK'],
          },
    );
  }

  async function promptForUpdate(release) {
    const choice = await MarkEdit.showAlert({
      title: `${EXTENSION_NAME} ${release.tag_name} is available`,
      message: `You have ${CURRENT_VERSION}. Update now?`,
      buttons: ['Update Now', 'Skip This Version', 'Later'],
    });

    if (choice === 0) {
      await installAndReport(release);
    } else if (choice === 1) {
      skipVersion(release.tag_name);
    }
  }

  async function checkForUpdates(behavior = updateBehavior(), manual = false) {
    if (behavior === 'never' && !manual) {
      return;
    }

    if (!manual) {
      const last = Number(localStorage.getItem(LAST_CHECK_STORAGE_KEY) ?? '0');
      if (Date.now() - last < CHECK_INTERVAL_MS) {
        return;
      }
      localStorage.setItem(LAST_CHECK_STORAGE_KEY, String(Date.now()));
    }

    let release;
    try {
      release = await fetchLatestRelease();
    } catch (error) {
      console.error(`${EXTENSION_NAME} updater: failed to check for updates:`, error);
      if (manual) {
        await MarkEdit.showAlert({
          title: 'Update check failed',
          message: "Couldn't reach GitHub to check for updates. Please try again later.",
          buttons: ['OK'],
        });
      }
      return;
    }

    const upToDate = release === undefined || !isNewer(release.tag_name, CURRENT_VERSION);
    if (upToDate) {
      if (manual) {
        await MarkEdit.showAlert({
          title: "You're up to date",
          message: `${EXTENSION_NAME} ${CURRENT_VERSION} is the latest version.`,
          buttons: ['OK'],
        });
      }
      return;
    }

    if (!manual && skippedVersions().has(release.tag_name)) {
      return;
    }

    if (behavior === 'automatic' && !manual) {
      await installAndReport(release);
    } else {
      await promptForUpdate(release);
    }
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
          title: 'Use macOS-Style Word Navigation Everywhere',
          action: () => void setWordNavigationBehavior('everywhere'),
          state: () => ({ isSelected: wordNavigationBehavior() === 'everywhere' }),
        },
        {
          title: 'Use Code-Style Word Navigation in Code Blocks',
          action: () => void setWordNavigationBehavior('proseOnly'),
          state: () => ({ isSelected: wordNavigationBehavior() === 'proseOnly' }),
        },
        {
          title: 'Use Code-Style Word Navigation Everywhere',
          action: () => void setWordNavigationBehavior('disabled'),
          state: () => ({ isSelected: wordNavigationBehavior() === 'disabled' }),
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
        {
          title: 'Check for Updates...',
          action: () => void checkForUpdates(updateBehavior(), true),
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

  const startUpdateCheck = () => {
    setTimeout(() => void checkForUpdates(), 2000);
  };

  if (typeof MarkEdit.onAppReady === 'function') {
    MarkEdit.onAppReady(startUpdateCheck);
  } else {
    startUpdateCheck();
  }
})();
