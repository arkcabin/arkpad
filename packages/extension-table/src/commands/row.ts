import type { ArkpadCommandProps } from "@arkpad/core";
import {
  addRowBefore as pmAddRowBefore,
  addRowAfter as pmAddRowAfter,
  deleteRow as pmDeleteRow,
} from "prosemirror-tables";
import type { CommandFactory } from "../types";

export const addRowBefore: CommandFactory =
  () =>
  ({ chain }: ArkpadCommandProps) => {
    return chain()
      .command(
        ({ state, dispatch }: ArkpadCommandProps) => pmAddRowBefore(state, dispatch),
        "addRowBefore"
      )
      .run();
  };

export const addRowAfter: CommandFactory =
  () =>
  ({ chain }: ArkpadCommandProps) => {
    return chain()
      .command(
        ({ state, dispatch }: ArkpadCommandProps) => pmAddRowAfter(state, dispatch),
        "addRowAfter"
      )
      .run();
  };

export const deleteRow: CommandFactory =
  () =>
  ({ chain }: ArkpadCommandProps) => {
    return chain()
      .command(
        ({ state, dispatch }: ArkpadCommandProps) => pmDeleteRow(state, dispatch),
        "deleteRow"
      )
      .run();
  };
