import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./marketplace.module.css";

// GitHub-flavored markdown for pack READMEs (external content -> CommonMark, no MDX).
export default function Markdown({ children }) {
  return (
    <div className={styles.markdown}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
