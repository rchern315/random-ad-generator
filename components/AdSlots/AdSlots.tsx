"use client";
import { useState } from "react";
import styles from "./AdSlots.module.css";
const slots=[
{name:"Homepage Top",key:"homepage-top",location:"Below homepage hero",ratio:"6:1",recommended:"1200 × 200",mobile:"Scale or mobile override"},
{name:"Article Inline",key:"article-inline",location:"Inside article content",ratio:"4:1",recommended:"1200 × 300",mobile:"Scale or mobile override"},
{name:"Article Sidebar",key:"article-sidebar",location:"Article sidebar",ratio:"1:1",recommended:"600 × 600",mobile:"Scale or hide"}
];
export default function AdSlots(){
 const [device,setDevice]=useState<"desktop"|"tablet"|"mobile">("desktop");
 return <section className={styles.wrap}>
  <div className={styles.intro}><span>Placement manager</span><h2>Ad Slots</h2><p>Developers place a slot once. Marketing controls which campaigns and creatives appear there afterward.</p><button type="button">+ Create slot</button></div>
  <div className={styles.preview}><div className={styles.previewHead}><div><strong>Responsive placement preview</strong><span>Check every placement before publishing.</span></div><div className={styles.devices}>{(["desktop","tablet","mobile"] as const).map(d=><button key={d} className={device===d?styles.selected:""} onClick={()=>setDevice(d)}>{d}</button>)}</div></div>
   <div className={styles.site+" "+styles[device]}><div>HEADER</div><div className={styles.hero}>PAGE CONTENT</div><div className={styles.demoSlot}>AD SLOT<br/><small>{device==="mobile"?"responsive / mobile creative":"creative preserves aspect ratio"}</small></div><div className={styles.content}>CONTENT</div></div>
  </div>
  <div className={styles.cards}>{slots.map(slot=><article key={slot.key}><div className={styles.status}>● Ready</div><h3>{slot.name}</h3><code>{slot.key}</code><dl><div><dt>Location</dt><dd>{slot.location}</dd></div><div><dt>Preferred ratio</dt><dd>{slot.ratio}</dd></div><div><dt>Recommended source</dt><dd>{slot.recommended}</dd></div><div><dt>Mobile</dt><dd>{slot.mobile}</dd></div></dl><div className={styles.guard}>✓ Responsive Creative Guard enabled</div><button type="button">Manage slot</button></article>)}</div>
  <div className={styles.install}><strong>One-time website installation</strong><p>Add the AdSpark script once, then place permanent slot markers wherever advertising is allowed. Campaign changes happen in AdSpark—not in website code.</p><code>&lt;div data-adspark-slot=&quot;homepage-top&quot;&gt;&lt;/div&gt;</code></div>
 </section>
}