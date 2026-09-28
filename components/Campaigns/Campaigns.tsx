"use client";
import { useState } from "react";
import styles from "./Campaigns.module.css";
export default function Campaigns(){
 const [scheduled,setScheduled]=useState(true);
 return <section className={styles.grid}>
  <div className={styles.card}><span className={styles.eyebrow}>Campaign manager</span><h2>Schedule advertising</h2><p>Group creatives into campaigns, control when they run, and let AdSpark stop them automatically.</p>
   <label>Campaign name<input defaultValue="Fall Promotion"/></label><label>Advertiser<input placeholder="Advertiser or brand"/></label>
   <label>Run<select value={scheduled?"scheduled":"continuous"} onChange={e=>setScheduled(e.target.value==="scheduled")}><option value="continuous">Continuously until paused</option><option value="scheduled">Scheduled dates</option></select></label>
   {scheduled&&<div className={styles.row}><label>Starts<input type="datetime-local"/></label><label>Ends<input type="datetime-local"/></label></div>}
   <label>Timezone<select defaultValue="America/Los_Angeles"><option value="America/Los_Angeles">Pacific Time</option><option value="America/Denver">Mountain Time</option><option value="America/Chicago">Central Time</option><option value="America/New_York">Eastern Time</option></select></label>
   <button type="button">Save campaign</button>
  </div>
  <div className={styles.card}><span className={styles.eyebrow}>Delivery</span><h2>Campaign lifecycle</h2><div className={styles.timeline}><div><b>Draft</b><span>Prepare creatives and placements.</span></div><div><b>Scheduled</b><span>Waiting for the start date.</span></div><div><b>Live</b><span>Eligible ads are being served.</span></div><div><b>Ended</b><span>Stops automatically at the end date.</span></div></div><div className={styles.callout}><strong>Coming with the serving API</strong><span>Recurring schedules, impression goals, pacing, frequency caps, weighted rotation, targeting, and fallback house ads.</span></div></div>
 </section>
}