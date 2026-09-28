"use client";
import { useState } from "react";
import styles from "./Analytics.module.css";

const campaignData={
 "all":{label:"All campaigns",metrics:[["Impressions","48,291"],["Clicks","1,846"],["CTR","3.82%"],["Active campaigns","6"]]},
 "fall":{label:"Fall Promotion",metrics:[["Impressions","18,420"],["Clicks","812"],["CTR","4.41%"],["Active creatives","4"]]},
 "aquapro":{label:"AquaPro Filtration",metrics:[["Impressions","12,604"],["Clicks","467"],["CTR","3.71%"],["Active creatives","3"]]},
 "holiday":{label:"Holiday Awareness",metrics:[["Impressions","9,817"],["Clicks","351"],["CTR","3.58%"],["Active creatives","5"]]}
} as const;
const rows=[["Homepage Top","24,410","1,101","4.51%"],["Article Inline","15,204","512","3.37%"],["Article Sidebar","8,677","233","2.69%"]];

export default function Analytics(){
 const [campaign,setCampaign]=useState<keyof typeof campaignData>("all");
 const data=campaignData[campaign];
 return <section className={styles.wrap}>
  <header className={styles.analyticsHeader}><div><span>Performance</span><h2>Analytics</h2><p>Run multiple campaigns at the same time. View the combined brand picture or filter down to one campaign, creative, placement, or device.</p></div>
   <label className={styles.campaignFilter}><span>Campaign</span><select value={campaign} onChange={e=>setCampaign(e.target.value as keyof typeof campaignData)}>{Object.entries(campaignData).map(([key,value])=><option key={key} value={key}>{value.label}</option>)}</select></label>
  </header>
  <div className={styles.metrics}>{data.metrics.map(([l,v])=><article key={l}><span>{l}</span><strong>{v}</strong></article>)}</div>
  <div className={styles.card}><div className={styles.cardHead}><div><h3>Performance by placement</h3><span>{data.label} · Sample data · Last 30 days</span></div><button type="button">Export report</button></div><div className={styles.table}><div className={styles.th}><b>Placement</b><b>Impressions</b><b>Clicks</b><b>CTR</b></div>{rows.map(r=><div key={r[0]}><strong>{r[0]}</strong><span>{r[1]}</span><span>{r[2]}</span><span>{r[3]}</span></div>)}</div></div>
  <div className={styles.note}><strong>How simultaneous campaigns work</strong><span>Every served impression and click will carry its campaign ID, ad ID, creative ID, slot ID, brand ID, device, and timestamp. “All campaigns” aggregates them; selecting one campaign isolates only that campaign’s events.</span></div>
 </section>
}