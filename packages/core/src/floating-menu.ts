import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Extension } from './extensions';

export interface FloatingMenuPluginProps {
  editor: any;
  element: HTMLElement;
  shouldShow?: (props: {
    state: EditorState;
    view: EditorView;
  }) => boolean;
}

export const FloatingMenuPluginKey = new PluginKey('floatingMenu');

export class FloatingMenuView {
  public editor: any;
  public element: HTMLElement;
  public view: EditorView;
  public shouldShow: FloatingMenuPluginProps['shouldShow'];

  constructor(props: FloatingMenuPluginProps & { view: EditorView }) {
    this.editor = props.editor;
    this.element = props.element;
    this.view = props.view;
    this.shouldShow = props.shouldShow || (({ state }) => {
      const { $from, empty } = state.selection;
      const isParagraph = $from.parent.type.name === 'paragraph';
      const isEmpty = $from.parent.content.size === 0;
      return empty && isParagraph && isEmpty;
    });

    this.element.style.position = 'fixed';
    this.element.style.zIndex = '1000';
    this.element.style.visibility = 'hidden';
    
    setTimeout(() => {
      if (this.view && !this.view.isDestroyed) {
        this.update(this.view, this.view.state);
      }
    }, 0);
  }

  update(view: EditorView, lastState?: EditorState) {
    if (!view || view.isDestroyed) return;
    const { state } = view;

    if (this.shouldShow && this.shouldShow({ state, view })) {
      this.show();
    } else {
      this.hide();
    }
  }

  show() {
    if (!this.element) return;
    this.element.style.visibility = 'visible';
    this.element.style.display = 'flex';
    this.updatePosition();
  }

  hide() {
    if (!this.element) return;
    this.element.style.visibility = 'hidden';
    this.element.style.display = 'none';
  }

  updatePosition() {
    if (!this.view || this.view.isDestroyed || !this.element) return;
    const { selection } = this.view.state;
    const { $from } = selection;

    try {
      const coords = this.view.coordsAtPos($from.pos);
      const padding = 40;
      
      this.element.style.top = `${coords.top}px`;
      this.element.style.left = `${coords.left - padding}px`;
      this.element.style.transform = 'translateY(-50%)';
    } catch (e) {
      // Ignore
    }
  }

  destroy() {
    this.hide();
  }
}

export const FloatingMenu = (options: FloatingMenuPluginProps): Extension => {
  return {
    name: 'floatingMenu',
    addProseMirrorPlugins: () => [
      new Plugin({
        key: FloatingMenuPluginKey,
        view: (view) => new FloatingMenuView({ ...options, view }),
      }),
    ],
  };
};
