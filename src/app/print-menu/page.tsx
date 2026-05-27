import { menu } from "@/content/menu";
import { drinksMenu } from "@/content/drinks";
import { formatPrice } from "@/lib/utils";
import { LogoSymbol } from "@/components/site/LogoSymbol";
import { DietarySymbol } from "@/components/site/DietarySymbol";

export default function PrintMenuPage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              setTimeout(function() {
                if (window.location.search.includes('autoprint=true')) {
                  window.print();
                }
              }, 1000);
            });
          `,
        }}
      />

      {/* Main content */}
      <div className="bg-white min-h-screen text-black p-8 print:p-0">
        <div className="max-w-none mx-auto">
          {/* Title Page / Header */}
          <div className="print-header flex flex-col items-center justify-center mb-12 print:mb-8 text-center pt-8 print:pt-0">
            <LogoSymbol className="w-32 h-32 print-logo text-black mb-8" />
            <h1 className="font-display text-5xl print:text-6xl mb-4 text-black">Bodega Bühlot</h1>
            <p className="text-lg print:text-xl uppercase tracking-widest print:tracking-[0.3em] print-item-name mb-12">tapas y mas</p>
            <h2 className="font-display text-3xl print:text-4xl text-black uppercase tracking-wide">Speisekarte</h2>
          </div>

          {/* FOOD MENU */}
          <div className="space-y-12">
            {menu.map((sec) => (
              <section key={sec.id} className="mb-10 print:break-inside-avoid">
                <h2 className="print-section-title font-display text-2xl print:text-3xl uppercase tracking-widest text-center border-b-2 border-black pb-3 mb-8">
                  {sec.title}
                </h2>
                <div className="space-y-6">
                  {sec.items.map((item, itemIdx) => (
                    <div key={`${ sec.id }-${ itemIdx }`} className="flex justify-between items-baseline gap-4">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <h3 className="print-item-name font-display text-lg print:text-xl font-semibold">{item.name}</h3>
                          {item.vegan && <DietarySymbol type="vegan" hideText className="print:opacity-100 print:text-black" />}
                          {item.vegetarian && !item.vegan && <DietarySymbol type="vegetarian" hideText className="print:opacity-100 print:text-black" />}
                          {item.spicy && <DietarySymbol type="spicy" hideText className="print:opacity-100 print:text-black" />}
                        </div>
                        {item.desc && <p className="text-xs text-gray-700 leading-snug">{item.desc}</p>}
                      </div>
                      <div className="text-base tabular-nums flex-shrink-0">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 flex gap-6 text-[0.6rem] uppercase tracking-widest opacity-60 border-t border-black pt-4 print:mt-4">
            <DietarySymbol type="vegan" className="print:opacity-100 print:text-black" />
            <DietarySymbol type="vegetarian" className="print:opacity-100 print:text-black" />
            <DietarySymbol type="spicy" className="print:opacity-100 print:text-black" />
          </div>

          {/* Page Break for Drinks */}
          <div className="print-page-break my-16 print:my-0 border-t-2 border-dashed border-gray-300 print:border-none" />

          {/* DRINKS MENU */}
          <div className="print-header flex flex-col items-center justify-center mb-12 print:mb-8 text-center pt-8 print:pt-4">
            <LogoSymbol className="w-32 h-32 print-logo text-black mb-8" />
            <h1 className="font-display text-5xl print:text-6xl mb-4 text-black">Bodega Bühlot</h1>
            <p className="text-lg print:text-xl uppercase tracking-widest print:tracking-[0.3em] print-item-name mb-12">tapas y mas</p>
            <h2 className="font-display text-3xl print:text-4xl text-black uppercase tracking-wide">Getränkekarte</h2>
          </div>

          <div className="space-y-12">
            {drinksMenu.map((sec) => (
              <section key={sec.id} className="mb-10 print:break-inside-avoid">
                <h2 className="print-section-title font-display text-2xl print:text-3xl uppercase tracking-widest text-center border-b-2 border-black pb-3 mb-6">
                  {sec.title}
                </h2>
                {sec.subtitle && (
                  <p className="text-center text-sm mb-6 text-gray-600 print-section-subtitle">{sec.subtitle}</p>
                )}
                <div className="space-y-5">
                  {sec.items.map((item, itemIdx) => (
                    <div key={`${ sec.id }-${ itemIdx }`} className="flex justify-between items-baseline gap-4">
                      <div className="flex-1">
                        <h3 className="print-item-name font-display text-lg print:text-xl font-semibold">{item.name}</h3>
                        {item.desc && <p className="text-xs text-gray-700 leading-snug">{item.desc}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {item.prices.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            {p.volume && <span className="text-xs text-gray-500">{p.volume}</span>}
                            <span className="text-base tabular-nums">{formatPrice(p.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Page Break for compact food overview */}
          <div className="print-page-break my-16 print:my-0 border-t-2 border-dashed border-gray-300 print:border-none" />

          {/* Compact food overview — one A5 page, with quiet space for notes */}
          <div className="text-center pt-4 print:pt-0 mb-5 print:mb-3">
            <h2 className="font-display text-2xl print:text-2xl text-black uppercase tracking-wide">Speisekarte</h2>
          </div>

          <div className="grid grid-cols-2 gap-x-7 gap-y-2 text-[9px] leading-[1.15] print:text-[7.2pt] print:leading-[1.1]">
            {menu.map((sec) => (
              <section key={`order-${sec.id}`} className="print:break-inside-avoid">
                <h3 className="print-section-title font-display text-[10px] print:text-[8pt] uppercase tracking-widest text-center border-b border-black pb-1 mb-1.5">
                  {sec.title.split('·')[1]?.trim() || sec.title}
                </h3>
                <div className="space-y-1">
                  {sec.items.map((item, idx) => (
                    <div key={`order-item-${idx}`} className="flex items-baseline gap-2">
                      <span className="print-item-name font-display font-semibold shrink-0">{item.name}</span>
                      <span className="border-b border-dotted border-black/60 flex-1 translate-y-[-1px]" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
