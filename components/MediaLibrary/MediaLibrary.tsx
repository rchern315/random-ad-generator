"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import styles from "./MediaLibrary.module.css";

export type MediaAsset={id:string;name:string;folder:string;url:string;width:number;height:number;size:number;type:string;createdAt:string};
type Folder={id:string;name:string;parentId:string|null;system?:boolean};
const MEDIA_KEY="adspark.media.v1";
const FOLDER_KEY="adspark.media-folders.v2";
const ROOT="all";
const UNFILED="unfiled";
const defaults:Folder[]=[{id:ROOT,name:"All media",parentId:null,system:true},{id:UNFILED,name:"Unfiled",parentId:ROOT,system:true},{id:"homepage",name:"Homepage Banners",parentId:ROOT},{id:"article",name:"Article Ads",parentId:ROOT},{id:"sidebar",name:"Sidebar Ads",parentId:ROOT}];

function readFile(file:File){return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>typeof r.result==="string"?resolve(r.result):reject(new Error("Could not read file."));r.onerror=()=>reject(new Error("Could not read file."));r.readAsDataURL(file)})}
function dimensions(url:string){return new Promise<{width:number;height:number}>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve({width:i.naturalWidth,height:i.naturalHeight});i.onerror=()=>reject(new Error("Could not open image."));i.src=url})}

type MediaLibraryProps={selectMode?:boolean;onSelect?:(asset:MediaAsset)=>void;onCancel?:()=>void};
export default function MediaLibrary({selectMode=false,onSelect,onCancel}:MediaLibraryProps){
 const [folders,setFolders]=useState<Folder[]>(defaults),[folderId,setFolderId]=useState(ROOT),[assets,setAssets]=useState<MediaAsset[]>([]),[newFolder,setNewFolder]=useState(""),[message,setMessage]=useState(""),[loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const a=localStorage.getItem(MEDIA_KEY),fs=localStorage.getItem(FOLDER_KEY);if(a){const parsed=JSON.parse(a) as MediaAsset[];setAssets(parsed.map(x=>({...x,folder:x.folder==="Unfiled"?UNFILED:x.folder})))}if(fs)setFolders(JSON.parse(fs))}catch{setMessage("The saved Media Library could not be read.")}finally{setLoaded(true)}},[]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(MEDIA_KEY,JSON.stringify(assets));localStorage.setItem(FOLDER_KEY,JSON.stringify(folders))}catch{setMessage("Browser storage is full. Supabase Storage will remove this browser limit.")}},[assets,folders,loaded]);
 const current=folders.find(f=>f.id===folderId)??folders[0];
 const descendants=(id:string):string[]=>{const kids=folders.filter(f=>f.parentId===id);return kids.flatMap(k=>[k.id,...descendants(k.id)])};
 const visible=useMemo(()=>folderId===ROOT?assets:assets.filter(a=>a.folder===folderId),[assets,folderId]);
 const children=folders.filter(f=>f.parentId===folderId);
 function addFolder(){const n=newFolder.trim();if(!n)return;if(folders.some(f=>f.parentId===folderId&&f.name.toLowerCase()===n.toLowerCase())){setMessage("A folder with that name already exists here.");return}const id=crypto.randomUUID();setFolders(c=>[...c,{id,name:n,parentId:folderId}]);setFolderId(id);setNewFolder("");setMessage("Folder created.")}
 function deleteFolder(id:string){const target=folders.find(f=>f.id===id);if(!target||target.system)return;const ids=[id,...descendants(id)];const count=assets.filter(a=>ids.includes(a.folder)).length;if(!window.confirm("Delete "+target.name+" and its subfolders? "+(count?count+" media item(s) will be moved to Unfiled.":"")))return;setAssets(c=>c.map(a=>ids.includes(a.folder)?{...a,folder:UNFILED}:a));setFolders(c=>c.filter(f=>!ids.includes(f.id)));setFolderId(target.parentId??ROOT);setMessage("Folder deleted. Media was kept in Unfiled.")}
 async function upload(e:ChangeEvent<HTMLInputElement>){const files=Array.from(e.target.files??[]);if(!files.length)return;setMessage("Saving media…");const added:MediaAsset[]=[];for(const file of files){if(!["image/jpeg","image/png","image/gif"].includes(file.type))continue;try{const url=await readFile(file),d=await dimensions(url);added.push({id:crypto.randomUUID(),name:file.name,folder:folderId===ROOT?UNFILED:folderId,url,width:d.width,height:d.height,size:file.size,type:file.type,createdAt:new Date().toISOString()})}catch{setMessage("One or more files could not be saved.")}}if(added.length){setAssets(c=>[...added,...c]);setMessage(added.length===1?"1 file saved to Media Library.":added.length+" files saved to Media Library.")}e.target.value=""}
 function remove(id:string){setAssets(c=>c.filter(a=>a.id!==id));setMessage("Media removed.")}
 const crumbs:Folder[]=[];let cursor=current;while(cursor&&cursor.id!==ROOT){crumbs.unshift(cursor);cursor=folders.find(f=>f.id===cursor.parentId)??folders[0]}
 return <section className={styles.shell}>
  <aside className={styles.sidebar}><div><span className={styles.eyebrow}>Library</span><h2>Media</h2><p>Organize creative with folders and nested subfolders.</p></div>
   <div className={styles.newFolder}><input value={newFolder} onChange={e=>setNewFolder(e.target.value)} placeholder={"New folder inside "+current.name} aria-label="New folder name"/><button type="button" onClick={addFolder}>Add</button></div>
   <nav aria-label="Media folders"><button type="button" className={folderId===ROOT?styles.activeFolder:styles.folder} onClick={()=>setFolderId(ROOT)}><span>📁</span>All media</button>{folders.filter(f=>f.parentId===ROOT).map(n=><button key={n.id} type="button" className={folderId===n.id?styles.activeFolder:styles.folder} onClick={()=>setFolderId(n.id)}><span>📁</span>{n.name}</button>)}</nav>
  </aside>
  <div className={styles.library}><header className={styles.libraryHeader}><div><span className={styles.eyebrow}>{selectMode?"Choose creative":"Current folder"}</span><h2>{current.name}</h2><div><button type="button" onClick={()=>setFolderId(ROOT)}>All media</button>{crumbs.map(f=><button key={f.id} type="button" onClick={()=>setFolderId(f.id)}> / {f.name}</button>)}</div>{selectMode&&<button type="button" onClick={onCancel}>Cancel selection</button>}{!current.system&&<button type="button" onClick={()=>deleteFolder(current.id)}>Delete folder</button>}</div><label className={styles.upload}>+ Upload files<input type="file" multiple accept="image/jpeg,image/png,image/gif" onChange={upload}/></label></header>
   <div className={styles.tip}><strong>Folders:</strong> Open a folder, then use New folder to create a subfolder inside it. Deleting a folder keeps its media by moving those files to Unfiled.</div>
   {message&&<p role="status">{message}</p>}
   {children.length>0&&<div className={styles.grid}>{children.map(f=><article className={styles.asset} key={f.id}><button type="button" onClick={()=>setFolderId(f.id)}>📁 <strong>{f.name}</strong></button><span>{folders.filter(x=>x.parentId===f.id).length} subfolders</span><button type="button" onClick={()=>deleteFolder(f.id)} disabled={!!f.system}>Delete folder</button></article>)}</div>}
   {visible.length?<div className={styles.grid}>{visible.map(a=><article className={styles.asset} key={a.id}><div className={styles.thumb}><img src={a.url} alt=""/></div><strong title={a.name}>{a.name}</strong><span>{a.width} × {a.height}px</span><span>{(a.size/1024).toFixed(0)} KB · {a.type.split("/")[1].toUpperCase()}</span>{selectMode?<button type="button" onClick={()=>onSelect?.(a)}>Use this image</button>:<button type="button" onClick={()=>remove(a.id)}>Delete</button>}</article>)}</div>:children.length===0&&<div className={styles.empty}><strong>This folder is empty</strong><span>Add a subfolder or upload JPG, PNG, or GIF creative.</span></div>}
  </div>
 </section>
}