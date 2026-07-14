// markedit-native-text-navigation
// Version: 1.0.0
// Repository: https://github.com/Nigelw/MarkEdit-native-text-navigation

(() => {
  const { keymap } = MarkEdit.codemirror.view;
  const { EditorSelection, Prec } = MarkEdit.codemirror.state;

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

  MarkEdit.addExtension(Prec.highest(keymap.of([
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
