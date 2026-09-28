"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import styles from "./MediaLibrary.module.css";

export type MediaAsset={id:string;name:string;folder:string;url:string;width:number;height:number;size:number;type:string;createdAt:string};
const MEDIA_KEY="adspark.media.v1";
const FOLDER_KEY="adspark.media-folders.v1";
const initialFolders=["All media","Unfiled","Homepage Banners","Article Ads","Sidebar Ads"];

function readFile(file:File){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==="string"?resolve(reader.result):reject(new Error("Could not read file."));reader.onerror=()=>reject(new Error("Could not read file."));reader.readAsDataURL(file)})}
function dimensions(url:string){return new Promise<{width:number;height:number}>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve({width:image.naturalWidth,height:image.naturalHeight});image.onerror=()=>reject(new Error("Could not open image."));image.src=url})}

type MediaLibraryProps={selectMode?:boolean;onSelect?: (asset:MediaAsset)=>void;onCancel?:()=>void};

export default function MediaLibrary({selectMode=false,onSelect,onCancel}:MediaLibraryProps){
 const [folders,setFolders]=useState(initialFolders),[folder,setFolder]=useState("All media"),[assets,setAssets]=useState<MediaAsset[]>([]),[newFolder,setNewFolder]=useState(""),[message,setMessage]=useState(""),[loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const savedAssets=localStorage.getItem(MEDIA_KEY),savedFolders=localStorage.getItem(FOLDER_KEY);if(savedAssets)setAssets(JSON.parse(savedAssets));if(savedFolders)setFolders(JSON.parse(savedFolders))}catch{setMessage("The saved Media Library could not be read.")}finally{setLoaded(true)}},[]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(MEDIA_KEY,JSON.stringify(assets));localStorage.setItem(FOLDER_KEY,JSON.stringify(folders))}catch{setMessage("Browser storage is full. Supabase Storage will remove this browser limit.")}},[assets,folders,loaded]);
 const visible=useMemo(()=>folder==="All media"?assets:assets.filter(a=>a.folder===folder),[assets,folder]);
 function addFolder(){const n=newFolder.trim();if(!n||folders.includes(n))return;setFolders(c=>[...c,n]);setFolder(n);setNewFolder("");setMessage("Folder created.")}
 async function upload(e:ChangeEvent<HTMLInputElement>){const files=Array.from(e.target.files??[]);if(!files.length)return;setMessage("Saving media…");const added:MediaAsset[]=[];for(const file of files){if(!["image/jpeg","image/png","image/gif"].includes(file.type))continue;try{const url=await readFile(file),d=await dimensions(url);added.push({id:crypto.randomUUID(),name:file.name,folder:folder==="All media"?"Unfiled":folder,url,width:d.width,height:d.height,size:file.size,type:file.type,createdAt:new Date().toISOString()})}catch{setMessage("One or more files could not be saved.")}}if(added.length){setAssets(c=>[...added,...c]);setMessage(added.length===1?"1 file saved to Media Library.":added.length+" files saved to Media Library.")}e.target.value=""}
 function remove(id:string){setAssets(c=>c.filter(a=>a.id!==id));setMessage("Media removed.")}
 return <section className={styles.shell}>
  <aside className={styles.sidebar}><div><span className={styles.eyebrow}>Library</span><h2>Media</h2><p>Keep reusable ad creative organized in one place.</p></div>
   <div className={styles.newFolder}><input value={newFolder} onChange={e=>setNewFolder(e.target.value)} placeholder="New folder" aria-label="New folder name"/><button type="button" onClick={addFolder}>Add</button></div>
   <nav aria-label="Media folders">{folders.map(n=><button key={n} type="button" className={folder===n?styles.activeFolder:styles.folder} onClick={()=>setFolder(n)}><span>📁</span>{n}</button>)}</nav>
  </aside>
  <div className={styles.library}><header className={styles.libraryHeader}><div><span className={styles.eyebrow}>{selectMode?"Choose creative":"Current folder"}</span><h2>{folder}</h2>{selectMode&&<button type="button" onClick={onCancel}>Cancel selection</button>}</div><label className={styles.upload}>+ Upload files<input type="file" multiple accept="image/jpeg,image/png,image/gif" onChange={upload}/></label></header>
   <div className={styles.tip}><strong>Smart media:</strong> Files now persist in this browser between tabs and refreshes. Production storage will move to Supabase.</div>
   {message&&<p role="status">{message}</p>}
   {visible.length?<div className={styles.grid}>{visible.map(a=><article className={styles.asset} key={a.id}><div className={styles.thumb}><img src={a.url} alt=""/></div><strong title={a.name}>{a.name}</strong><span>{a.width} × {a.height}px</span><span>{(a.size/1024).toFixed(0)} KB · {a.type.split("/")[1].toUpperCase()}</span>{selectMode?<button type="button" onClick={()=>onSelect?.(a)}>Use this image</button>:<button type="button" onClick={()=>remove(a.id)}>Delete</button>}</article>)}</div>:<div className={styles.empty}><strong>No media here yet</strong><span>Upload JPG, PNG, or GIF creative. Files will remain after you leave this tab or refresh the page.</span></div>}
  </div>
 </section>
}