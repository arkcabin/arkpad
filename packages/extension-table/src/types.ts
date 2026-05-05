import type { ArkpadCommandProps } from "@arkpad/core";
import type { EditorState } from "prosemirror-state";
import type { Dispatch } from "@arkpad/core";

export interface TableCellAttrs {
  colspan: number;
  rowspan: number;
  colwidth: number[] | null;
  background: string | null;
}

export interface TableRowAttrs {
  height: number | null;
}

export interface TableAttrs {
  style: string | null;
}

export interface InsertTableOptions {
  rows?: number;
  cols?: number;
  withHeaderRow?: boolean;
}

export type PMCommand = (state: EditorState, dispatch?: Dispatch) => boolean;

export type CommandFactory = (...args: any[]) => (props: ArkpadCommandProps) => boolean;

export interface KeyboardProps {
  state: EditorState;
  dispatch: Dispatch;
  editor: {
    canRunCommand: (cmd: string) => boolean;
    chain: () => any;
    runCommand: (cmd: string) => boolean;
  };
}
