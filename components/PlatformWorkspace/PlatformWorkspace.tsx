"use client";

import { useState } from "react";
import AdWorkspace from "../AdWorkspace/AdWorkspace";
import CreativeUploader from "../CreativeUploader/CreativeUploader";
import styles from "./PlatformWorkspace.module.css";

type WorkspaceView = "upload" | "ai";

export default function PlatformWorkspace() {
  const [view, setView] = useState<WorkspaceView>("upload");

  return (
    <section>
      <div className={styles.tabs} role="tablist" aria-label="Ad creation method">
        <button
          className={view === "upload" ? styles.activeTab : styles.tab}
          type="button"
          role="tab"
          aria-selected={view === "upload"}
          onClick={() => setView("upload")}
        >
          Upload Creative
        </button>
        <button
          className={view === "ai" ? styles.activeTab : styles.tab}
          type="button"
          role="tab"
          aria-selected={view === "ai"}
          onClick={() => setView("ai")}
        >
          Create with AI
        </button>
      </div>

      {view === "upload" ? <CreativeUploader /> : <AdWorkspace />}
    </section>
  );
}
