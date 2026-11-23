'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, CheckCircle2, LoaderCircle, ScanQrCode } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function CustomerQrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setActive(false);
  }

  useEffect(() => () => { streamRef.current?.getTracks().forEach(track => track.stop()); }, []);

  async function startCamera() {
    setMessage('');
    setSuccess(false);
    if (!('BarcodeDetector' in window)) {
      setMessage('Este navegador no permite escanear QR desde la cámara. Prueba con Chrome actualizado.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setMessage('No pudimos acceder a la cámara. Permite el acceso en tu navegador e inténtalo otra vez.');
    }
  }

  useEffect(() => {
    if (!active || !videoRef.current) return;
    let cancelled = false;
    const Detector = (window as any).BarcodeDetector;
    const detector = new Detector({ formats: ['qr_code'] });
    const scan = async () => {
      if (cancelled || !videoRef.current) return;
      try {
        const codes = await detector.detect(videoRef.current);
        const value = codes?.[0]?.rawValue as string | undefined;
        if (value) {
          let isRestaurantQr = false;
          try { isRestaurantQr = new URL(value).searchParams.get('accion') === 'sellar'; } catch {}
          if (isRestaurantQr) {
            cancelled = true;
            stopCamera();
            setBusy(true);
            try {
              const supabase = createSupabaseBrowserClient();
              const { error } = await supabase.rpc('register_customer_store_loyalty_stamp');
              if (error) throw error;
              setSuccess(true);
              setMessage('¡Sello registrado! Tu tarjeta ya está actualizada.');
            } catch {
              setMessage('No pudimos registrar el sello. Verifica que tu cuenta esté activa e inténtalo nuevamente.');
            } finally { setBusy(false); }
            return;
          }
          setMessage('Este no es el QR de fidelización de PAPAMERICANA.');
        }
      } catch {}
      if (!cancelled) window.setTimeout(scan, 350);
    };
    void scan();
    return () => { cancelled = true; };
  }, [active]);

  return <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
    <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ffe600]"><ScanQrCode size={22}/></span><div><h2 className="font-black">Escanea el QR del local</h2><p className="text-xs text-neutral-500">Apunta la cámara al código fijo de PAPAMERICANA para sumar tu sello.</p></div></div>
    {active && <video ref={videoRef} playsInline muted className="mt-4 aspect-video w-full rounded-xl bg-black object-cover"/>}
    {message && <p className={'mt-4 rounded-xl p-3 text-xs font-semibold '+(success?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-800')}>{message}</p>}
    <div className="mt-4 flex gap-2">
      {!active ? <button type="button" onClick={startCamera} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-5 py-3.5 text-xs font-black text-white disabled:opacity-50">{busy?<LoaderCircle size={16} className="animate-spin"/>:<Camera size={16}/>} {busy?'Registrando sello…':'Abrir cámara y escanear'}</button> : <button type="button" onClick={stopCamera} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-200 px-5 py-3.5 text-xs font-black"><CameraOff size={16}/> Cerrar cámara</button>}
    </div>
    {success && <CheckCircle2 className="sr-only"/>}
  </section>;
}
