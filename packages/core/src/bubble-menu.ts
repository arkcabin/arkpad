import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Extension } from './extensions';

export interface BubbleMenuPluginProps {
  editor: any;
  element: HTMLElement;
  shouldShow?: (props: {
    state: EditorState;
    from: number;
    to: number;
    empty: boolean;
  }) => boolean;
}

export const BubbleMenuPluginKey = new PluginKey('bubbleMenu');

export class BubbleMenuView {
  public editor: any;
  public element: HTMLElement;
  public view: EditorView;
  public shouldShow: BubbleMenuPluginProps['shouldShow'];

  constructor(props: BubbleMenuPluginProps & { view: EditorView }) {
    this.editor = props.editor;
    this.element = props.element;
    this.view = props.view;
    this.shouldShow = props.shouldShow || (({ empty }) => !empty);

    this.element.style.position = 'fixed';
    this.element.style.zIndex = '1000';
    this.element.style.visibility = 'hidden';
    this.element.style.display = 'none';
    
    setTimeout(() => {
      if (this.view && !this.view.isDestroyed) {
        this.update(this.view, this.view.state);
      }
    }, 0);
  }

  update(view: EditorView, lastState?: EditorState) {
    if (!view || view.isDestroyed) return;
    
    const { state } = view;
    const { selection } = state;
    const { from, to, empty } = selection;

    if (this.shouldShow && this.shouldShow({ state, from, to, empty })) {
      this.show();
    } else {
      this.hide();
    }
  }

  show() {
    if (!this.element) return;
    this.element.style.display = 'flex';
    this.element.style.visibility = 'visible';
    this.updatePosition();
  }

  hide() {
    if (!this.element) return;
    this.element.style.display = 'none';
    this.element.style.visibility = 'hidden';
  }

  updatePosition() {
    if (!this.view || this.view.isDestroyed || !this.element) return;
    
    const { selection } = this.view.state;
    const { from, to } = selection;

    try {
      const start = this.view.coordsAtPos(from);
      const end = this.view.coordsAtPos(to);

      const left = (start.left + end.left) / 2;
      const top = start.top;

      const headerHeight = 64;
      const padding = 12;
      const menuHeight = this.element.offsetHeight || 40;

      let posTop = top - padding;
      let transform = 'translateX(-50%) translateY(-100%)';

      if (top - menuHeight - padding < headerHeight) {
        posTop = end.bottom + padding;
        transform = 'translateX(-50%) translateY(0)';
      }

      this.element.style.top = `${posTop}px`;
      this.element.style.left = `${left}px`;
      this.element.style.transform = transform;
    } catch (e) {
      // Ignore
    }
  }

  destroy() {
    this.hide();
  }
}

export const BubbleMenu = (options: BubbleMenuPluginProps): Extension => {
  return {
    name: 'bubbleMenu',
    addProseMirrorPlugins: () => [
      new Plugin({
        key: BubbleMenuPluginKey,
        view: (view) => new BubbleMenuView({ ...options, view }),
      }),
    ],
  };
};
