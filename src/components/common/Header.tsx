export default function Header() {
  return (
    <header
      data-node-id="9550:21613"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(234,245,248,0.95) 20%, rgba(207,239,245,0.95) 60%, rgba(184,224,240,1) 100%), radial-gradient(60% 40% at 10% 20%, rgba(255,255,255,0.6), rgba(255,255,255,0) 40%)",
          borderBottomRightRadius: '48px',
          boxShadow: 'inset 0 -40px 80px rgba(0,0,0,0.03)',
        }}
        className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-4 md:px-10.5 md:py-6 md:h-30 md:rounded-br-[48px] overflow-hidden"
    >
        <div className="flex items-center gap-3 md:gap-6">
        <div className="w-10 h-10 bg-linear-to-br rounded-lg flex items-center justify-center" data-node-id="9550:21614">
          <img
            alt="Selise Super League Logo"
            src="/assets/ssl-logo.png"
            className="w-full h-full object-cover rounded-sm"
          />
        </div>

          <div className="flex flex-col justify-center flex-1" data-node-id="9550:21615">
            <div className="flex items-baseline gap-3">
              <h1
                className="font-bold text-[#004556] leading-tight text-[20px] md:text-[32px] md:leading-12"
                data-node-id="9550:21616"
                style={{ letterSpacing: '0.25px', fontFamily: 'Roboto, sans-serif' }}
              >
                Selise
              </h1>
              <span className="text-[#004556] text-[16px] md:text-[24px] md:leading-9" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Super League
              </span>
            </div>

            <p
              className="mt-1 text-[#605e5c] text-[12px] md:text-[14px]"
              data-node-id="9550:21617"
              style={{ letterSpacing: '0.5px', fontFamily: 'Roboto, sans-serif' }}
            >
              Season 1/2026
            </p>
          </div>
      </div>
    </header>
  );
}
