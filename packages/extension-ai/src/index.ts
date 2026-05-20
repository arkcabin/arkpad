import { Extension } from "@arkpad/core";

export interface AIOptions {
  /**
   * Custom handler for AI requests.
   */
  onAIRequest?: (props: { command: string; text: string; context: any }) => Promise<string>;

  /**
   * Whether to enable the Agentic Interceptor.
   */
  enableInterceptor?: boolean;
}

export const AI = Extension.create<AIOptions>({
  name: "ai",

  addOptions() {
    return {
      enableInterceptor: true,
    };
  },

  addStorage() {
    return {
      isGenerating: false,
      lastError: null as string | null,
    };
  },

  addCommands() {
    return {
      aiComplete: () => async (props: any) => {
        const { state, dispatch } = props;
        const { selection } = state;
        const text = state.doc.textBetween(Math.max(0, selection.from - 500), selection.from, "\n");

        this.storage.isGenerating = true;

        try {
          const response = await this.options.onAIRequest?.({
            command: "complete",
            text,
            context: { selection },
          });

          if (response && dispatch) {
            const tr = state.tr.insertText(response, selection.from);
            dispatch(tr);
          }
          return true;
        } catch (error: any) {
          this.storage.lastError = error.message;
          return false;
        } finally {
          this.storage.isGenerating = false;
        }
      },

      aiSummarize: () => async (props: any) => {
        const { state, dispatch } = props;
        const { from, to } = state.selection;
        const text = state.doc.textBetween(from, to, "\n");

        if (!text) return false;

        this.storage.isGenerating = true;

        try {
          const response = await this.options.onAIRequest?.({
            command: "summarize",
            text,
            context: {},
          });

          if (response && dispatch) {
            // Replace selection with summary or append?
            // Let's replace for now.
            dispatch(state.tr.replaceSelectionWith(state.schema.text(`\nSummary: ${response}\n`)));
          }
          return true;
        } catch (error: any) {
          this.storage.lastError = error.message;
          return false;
        } finally {
          this.storage.isGenerating = false;
        }
      },
    };
  },

  onInterceptor(props) {
    if (!this.options.enableInterceptor) return props.transaction;

    const { transaction } = props;

    // Example: Block specific patterns or trigger AI validation
    // For now, let's just log that the agentic layer is watching
    if (transaction.docChanged) {
      // We could implement "Smart-Correct" or "Tone-Check" here
    }

    return transaction;
  },
});

export default AI;
