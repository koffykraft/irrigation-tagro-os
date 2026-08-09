export class TagroStore{
 constructor(seed={}){
  const saved=localStorage.getItem('tagro-irrigation-state');
  const base=saved?JSON.parse(saved):{};
  this.state={data:{},events:[],ripples:[],shadows:[],...base,...seed};
  this.listeners=new Set();
 }
 get(){return this.state}
 save(){localStorage.setItem('tagro-irrigation-state',JSON.stringify(this.state))}
 on(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 emit(type,payload={},meta={}){
  const event={id:crypto.randomUUID?.()||String(Date.now()+Math.random()),type,payload,meta:{source:meta.source||'ui',status:meta.status||'observed',at:new Date().toISOString(),...meta}};
  this.state.events.push(event);this.apply(event);this.save();this.listeners.forEach(fn=>fn(this.state,event));return event;
 }
 apply(event){
  if(event.type==='field.set'){
   const {path,value}=event.payload;
   this.state.data[path]={value,status:event.meta.status||'observed',source:event.meta.source,updatedAt:event.meta.at,eventId:event.id};
   this.ripple(event,path);
  }
  if(event.type==='field.clear'){delete this.state.data[event.payload.path]}
  if(event.type==='shadow.note'){
   const key=event.payload.family||event.payload.key;
   const existing=this.state.shadows.find(x=>x.key===key);
   if(existing){existing.count++;existing.lastEvent=event.id}else this.state.shadows.push({key,count:1,firstEvent:event.id,lastEvent:event.id,note:event.payload.note||''});
  }
 }
 value(path){return this.state.data[path]?.value}
 ripple(event,path){
  const rules={farm:['field','water','irrigation'],location:['field','access','water'],crop:['application','network','hydraulics','schedule','cost'],soil:['application','schedule'],weather:['application','schedule','water'],water:['pump','operatingGroups','hydraulics','schedule'],pump:['operatingGroups','hydraulics'],power:['pump','operatingGroups','schedule'],application:['network','hydraulics','schedule'],lateral:['submain','main','hydraulics','materials'],submain:['main','hydraulics','materials'],main:['pump','hydraulics','materials'],access:['placement','maintenance'],labour:['schedule','automation'],budget:['designOptions','materials']};
  const root=path.split('.')[0],targets=rules[root]||[];
  if(targets.length)this.state.ripples.unshift({event:event.id,from:path,targets,at:event.meta.at});
 }
 set(path,value,meta={}){return this.emit('field.set',{path,value},meta)}
 clear(path,meta={}){return this.emit('field.clear',{path},meta)}
 reset(){this.state={data:{},events:[],ripples:[],shadows:[]};this.save();this.listeners.forEach(fn=>fn(this.state,{type:'reset'}))}
}
