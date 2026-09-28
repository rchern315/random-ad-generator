"use client";
import { useState } from "react";
import AdWorkspace from "../AdWorkspace/AdWorkspace";
import CreativeUploader from "../CreativeUploader/CreativeUploader";
import MediaLibrary from "../MediaLibrary/MediaLibrary";
import AdSlots from "../AdSlots/AdSlots";
import Campaigns from "../Campaigns/Campaigns";
import Analytics from "../Analytics/Analytics";
import styles from "./PlatformWorkspace.module.css";

type WorkspaceView="upload"|"media"|"slots"|"campaigns"|"analytics"|"ai";
export default function PlatformWorkspace(){
 const [view,setView]=useState<WorkspaceView>("upload");
 const tabs:[WorkspaceView,string][]=[["upload","Create Ad"],["media","Media Library"],["slots","Ad Slots"],["campaigns","Campaigns"],["analytics","Analytics"],["ai","Create with AI"]];
 return <section>
  <div className={styles.tabs} role="tablist" aria-label="AdSpark workspace">{tabs.map(([key,label])=><button key={key} className={view===key?styles.activeTab:styles.tab} type="button" role="tab" aria-selected={view===key} onClick={()=>setView(key)}>{label}</button>)}</div>
  {view==="upload"&&<CreativeUploader onOpenMediaLibrary={() => setView("media")} />}{view==="media"&&<MediaLibrary/>}{view==="slots"&&<AdSlots/>}{view==="campaigns"&&<Campaigns/>}{view==="analytics"&&<Analytics/>}{view==="ai"&&<AdWorkspace/>}
 </section>
}