"use client";

import { ChangeEvent, useMemo, useState } from "react";
import styles from "./MediaLibrary.module.css";

type MediaAsset = { id:string; name:string; folder:string; url:string; width:number; height:number; size:number; type:string };
const initialFolders=["All media","Homepage Banners","Article Ads","Sidebar Ads"];

export default function MediaLibrary(){
 const [folders,setFolders]=useState(initialFolders),[folder,setFolder]=useState("All media"),[assets,setAssets]=useState<MediaAsset[]>([]),[newFolder,setNewFolder]=useState("");
 const visible=useMemo(()=>folder==="All media"?assets:assets.filter(a=>a.folder===folder),[assets,folder]);
 function addFolder(){const n=newFolder.trim();if(!n||folders.includes(n))return;setFolders(c=>[...c,n]);setFolder(n);setNewFolder("")}
 function upload(e:ChangeEvent<HTMLInputElement>){Array.from(e.target.files??[]).forEach(file=>{if(!["image/jpeg","image/png","image/gif"].includes(file.type))return;const url=URL.createObjectURL(file),image=new Image();image.onload=()=>setAssets(c=>[{id:crypto.randomUUID(),name:file.name,folder:folder==="All media"?"Unfiled":folder,url,width:image.naturalWidth,height:image.naturalHeight,size:file.size,type:file.type},...c]);image.src=url});e.target.value=""}
 return <section className={styles.shell}>
  <aside className={styles.sidebar}><div><span className={styles.eyebrow}>Library</span><h2>Media</h2><p>Keep reusable ad creative organized in one place.</p></div>
   <div className={styles.newFolder}><input value={newFolder} onChange={e=>setNewFolder(e.target.value)} placeholder="New folder" aria-label="New folder name"/><button type="button" onClick={addFolder}>Add</button></div>
   <nav aria-label="Media folders">{folders.map(n=><button key={n} type="button" className={folder===n?styles.activeFolder:styles.folder} onClick={()=>setFolder(n)}><span>📁</span>{n}</button>)}</nav>
  </aside>
  <div className={styles.library}><header className={styles.libraryHeader}><div><span className={styles.eyebrow}>Current folder</span><h2>{folder}</h2></div><label className={styles.upload}>+ Upload files<input type="file" multiple accept="image/jpeg,image/png,image/gif" onChange={upload}/></label></header>
   <div className={styles.tip}><strong>Smart media:</strong> AdSpark detects dimensions automatically. When you choose a slot, compatible creative will be recommended first.</div>
   {visible.length?<div className={styles.grid}>{visible.map(a=><article className={styles.asset} key={a.id}><div className={styles.thumb}><img src={a.url} alt=""/></div><strong title={a.name}>{a.name}</strong><span>{a.width} × {a.height}px</span><span>{(a.size/1024).toFixed(0)} KB · {a.type.split("/")[1].toUpperCase()}</span></article>)}</div>:<div className={styles.empty}><strong>No media here yet</strong><span>Upload JPG, PNG, or GIF creative. Supabase Storage will replace this local prototype storage.</span></div>}
  </div>
 </section>
}