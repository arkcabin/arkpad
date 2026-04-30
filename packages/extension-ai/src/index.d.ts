import { Extension } from "@arkpad/core";
export interface AIOptions {
    /**
     * Custom handler for AI requests.
     */
    onAIRequest?: (props: {
        command: string;
        text: string;
        context: any;
    }) => Promise<string>;
    /**
     * Whether to enable the Agentic Interceptor.
     */
    enableInterceptor?: boolean;
}
export declare const AI: Extension<AIOptions, any>;
export default AI;
//# sourceMappingURL=index.d.ts.map