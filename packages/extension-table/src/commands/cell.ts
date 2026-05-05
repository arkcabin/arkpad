import type { ArkpadCommandProps } from "@arkpad/core";
import {
  mergeCells as pmMergeCells,
  splitCell as pmSplitCell,
  toggleHeaderColumn as pmToggleHeaderColumn,
  toggleHeaderRow as pmToggleHeaderRow,
  toggleHeaderCell as pmToggleHeaderCell,
  setCellAttr as pmSetCellAttr,
  goToNextCell as pmGoToNextCell,
} from "prosemirror-tables";
import type { CommandFactory } from "../types";

export const mergeCells: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmMergeCells(state, dispatch))
    .run();
};

export const splitCell: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmSplitCell(state, dispatch))
    .run();
};

export const toggleHeaderColumn: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmToggleHeaderColumn(state, dispatch))
    .run();
};

export const toggleHeaderRow: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmToggleHeaderRow(state, dispatch))
    .run();
};

export const toggleHeaderCell: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmToggleHeaderCell(state, dispatch))
    .run();
};

export const setCellAttr: CommandFactory = (name: string, value: any) => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmSetCellAttr(name, value)(state, dispatch))
    .run();
};

export const setCellBackground: CommandFactory = (color: string) => ({ chain }: ArkpadCommandProps) => {
  return chain().setCellAttr("background", color).run();
};

export const goToNextCell: CommandFactory = (direction: number = 1) => ({ state, dispatch }: ArkpadCommandProps) => {
  return pmGoToNextCell(direction as any)(state, dispatch);
};
