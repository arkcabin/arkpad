import type { ArkpadCommandProps } from "@arkpad/core";
import {
  addColumnBefore as pmAddColumnBefore,
  addColumnAfter as pmAddColumnAfter,
  deleteColumn as pmDeleteColumn
} from "prosemirror-tables";
import type { CommandFactory } from "../types";

export const addColumnBefore: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmAddColumnBefore(state, dispatch))
    .run();
};

export const addColumnAfter: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmAddColumnAfter(state, dispatch))
    .run();
};

export const deleteColumn: CommandFactory = () => ({ chain }: ArkpadCommandProps) => {
  return chain()
    .command(({ state, dispatch }: ArkpadCommandProps) => pmDeleteColumn(state, dispatch))
    .run();
};
