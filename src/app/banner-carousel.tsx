'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export type StoreBanner={id:string;title:string;subtitle:string|null;button_text:string|null;button_url:string|null;image_url:string|null;sort_order:number};
export default function BannerCarousel({slides}:{slides:StoreBanner[]}) {
 const [active,setActive]=useState(0);
 useEffect(()=>{if(slides.length<2)return;const timer=window.setInterval(()=>setActive(v=>(v+1)%slides.length),6000);return()=>window.clearInterval(timer)},[slides.length]);
 if(!slides.length)return null;
 const slide=slides[active];
 return <section className="relative isolate min-h-[330px] overflow-hidden rounded-[24px] bg-[#ffe600] sm:min-h-[370px] lg:min-h-[410px]">
  {slide.image_url?<img src={slide.image_url} alt="" className="absolute inset-0 h-full w-full object-cover"/>:<><div className="absolute -right-20 -top-32 h-[450px] w-[450px] rounded-full border-[55px] border-white/25"/><div className="absolute -bottom-28 right-[22%] h-[280px] w-[280px] rounded-full bg-[#f0b900]/50 blur-2xl"/></>}
  <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent"/>
  <div className="relative z-10 flex min-h-[330px] flex-col justify-center px-6 py-9 sm:min-h-[370px] sm:px-10 lg:min-h-[410px] lg:w-[58%] lg:px-14">
   <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-black px-3.5 py-2 text-[9px] font-black uppercase tracking-[.17em] text-white"><Sparkles size={12}/> ¡Antojo resuelto!</span>
   <h1 className="max-w-[620px] whitespace-pre-line text-[clamp(2.8rem,6.5vw,6rem)] font-black leading-[.88] tracking-[-.075em] text-black">{slide.title}</h1>
   {slide.subtitle&&<p className="mt-5 max-w-[380px] text-sm font-semibold leading-5 text-black/75">{slide.subtitle}</p>}
   {slide.button_text&&<a href={slide.button_url||'#catalogo'} className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-black px-6 py-3.5 text-xs font-black text-white transition hover:translate-y-[-2px] hover:bg-neutral-800">{slide.button_text}<ArrowRight size={16}/></a>}
  </div>
  {slides.length>1&&<div className="absolute bottom-5 right-5 z-20 flex items-center gap-2"><button onClick={()=>setActive(v=>(v-1+slides.length)%slides.length)} aria-label="Anterior" className="grid h-9 w-9 place-items-center rounded-full bg-white/90"><ChevronLeft size={18}/></button><span className="rounded-full bg-black/80 px-3 py-2 text-[10px] font-black text-white">{active+1} / {slides.length}</span><button onClick={()=>setActive(v=>(v+1)%slides.length)} aria-label="Siguiente" className="grid h-9 w-9 place-items-center rounded-full bg-white/90"><ChevronRight size={18}/></button></div>}
 </section>;
}
