import Link from 'next/link';
import { ArrowLeft, LockKeyhole } from 'lucide-react';

const content: Record<string,{title:string;description:string;headers:string[];rows:string[][]}> = {
 products:{title:'Productos y menú',description:'Ejemplo de catálogo editable: nombre, categoría, precio y visibilidad.',headers:['Producto','Categoría','Precio','Estado'],rows:[['La Chola','Papas rústicas','$1.50','Visible'],['La Mera Burger','Burguers','$3.40','Visible'],['El Paisa','Hotdogs','$1.25','Visible'],['Cola personal','Bebidas','$0.50','Visible'],['Extra queso','Extras','$0.50','Visible']]},
 categories:{title:'Categorías',description:'Organización de productos que aparece en el menú de la tienda.',headers:['Categoría','Productos','Estado'],rows:[['Papas rústicas','5','Activa'],['Burguers','3','Activa'],['Hotdogs','2','Activa'],['Bebidas','5','Activa'],['Extras','4','Activa']]},
 orders:{title:'Pedidos',description:'Ejemplos de pedidos y sus estados. No son pedidos reales.',headers:['Pedido','Cliente','Total','Estado'],rows:[['#DEMO-001','Cliente de muestra','$18.50','En preparación'],['#DEMO-002','Cliente de muestra','$12.00','Pendiente'],['#DEMO-003','Cliente de muestra','$12.00','Entregado']]},
 delivery:{title:'Entregas',description:'Ejemplo de zonas y tarifas de cobertura.',headers:['Zona','Tarifa','Tiempo estimado','Estado'],rows:[['Zona centro','$1.00','25–35 min','Activa'],['Zona norte','$1.50','35–45 min','Activa']]},
 customers:{title:'Clientes',description:'Registros completamente ficticios para mostrar la estructura.',headers:['Cliente','Pedidos','Última compra'],rows:[['Cliente Demo 01','4','Esta semana'],['Cliente Demo 02','2','Esta semana'],['Cliente Demo 03','1','Este mes']]},
 settings:{title:'Configuración',description:'Vista ilustrativa de los datos generales del restaurante.',headers:['Parámetro','Valor'],rows:[['Nombre comercial','PAPAMERICANA'],['Moneda','USD'],['Modalidad','Retiro y delivery'],['Pedidos en línea','En configuración']]}
};

export default async function DemoSectionPage({params}:{params:Promise<{section:string}>}) {
 const {section}=await params; const data=content[section];
 if(!data) return <main className="min-h-screen bg-[#f5f6f8] p-8"><Link href="/demo-admin">← Volver al panel</Link><h1 className="mt-6 text-2xl font-black">Módulo no encontrado</h1></main>;
 return <main className="min-h-screen bg-[#f5f6f8] px-4 py-8 text-[#17233a] sm:px-8"><div className="mx-auto max-w-6xl">
  <Link href="/demo-admin" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500"><ArrowLeft size={15}/> Volver al panel</Link>
  <header className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">PAPAMERICANA / ADMIN / DEMO</p><h1 className="mt-1 text-3xl font-black">{data.title}</h1><p className="mt-2 text-sm text-slate-500">{data.description}</p></div><span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">Solo lectura</span></header>
  <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><LockKeyhole size={19} className="shrink-0"/><p className="text-xs leading-5"><b>Demostración:</b> la información es de ejemplo. No puedes crear, editar, eliminar ni guardar datos desde esta vista.</p></div>
  <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{data.headers.map(h=><th key={h} className="px-5 py-4 font-bold">{h}</th>)}</tr></thead><tbody>{data.rows.map((row,i)=><tr key={i} className="border-t border-slate-100">{row.map((cell,j)=><td key={j} className="px-5 py-4 text-xs font-medium">{cell}</td>)}</tr>)}</tbody></table></div></section>
  <p className="mt-4 text-[11px] text-slate-400">Contenido ilustrativo. Los registros reales se mostrarán al habilitar el acceso administrativo.</p>
 </div></main>;
}
