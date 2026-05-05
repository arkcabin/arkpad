import type { NodeType, Schema } from "prosemirror-model";

export function getTableNodeTypes(schema: Schema): { [key: string]: NodeType } {
  if ((schema as any).cached.tableNodeTypes) {
    return (schema as any).cached.tableNodeTypes;
  }

  const roles: { [key: string]: NodeType } = {};

  Object.keys(schema.nodes).forEach((type) => {
    const nodeType = schema.nodes[type]!;

    if (nodeType.spec.tableRole) {
      roles[nodeType.spec.tableRole] = nodeType;
    }
  });

  (schema as any).cached.tableNodeTypes = roles;

  return roles;
}
