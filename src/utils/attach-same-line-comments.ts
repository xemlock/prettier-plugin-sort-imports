import { Comment, Node } from '@babel/types';

/**
 * Babel attaches a comment placed after a node on the same line (e.g.
 * `import a from 'a'; // comment`) as a leading comment of the next node,
 * so sorting would move the comment along with the wrong node. This function
 * makes such comments trailing comments of the node they follow instead, and
 * drops all other trailing comments, as they are leading comments of the next
 * node.
 * @param nodes Sibling nodes in their original order.
 */
export const attachSameLineComments = (nodes: Node[]) => {
    nodes.forEach((node, index) => {
        const next = nodes[index + 1];
        const isSameLine = (comment: Comment) =>
            comment.loc?.start.line === node.loc?.end.line &&
            (!next || comment.loc!.end.line < next.loc!.start.line);

        const sameLineComments = [
            ...new Set([
                ...(node.trailingComments ?? []),
                ...(next?.leadingComments ?? []),
            ]),
        ].filter(isSameLine);

        node.trailingComments = sameLineComments.length
            ? sameLineComments.map((comment) => ({
                  ...comment,
                  // line 0 makes babel generator print the comment on the
                  // same line as the node without adding newlines after it
                  // based on the original location
                  loc: comment.loc && {
                      ...comment.loc,
                      start: { ...comment.loc.start, line: 0 },
                      end: { ...comment.loc.end, line: 0 },
                  },
              }))
            : null;
        if (next?.leadingComments) {
            next.leadingComments = next.leadingComments.filter(
                (comment) => !sameLineComments.includes(comment),
            );
        }
    });
};
