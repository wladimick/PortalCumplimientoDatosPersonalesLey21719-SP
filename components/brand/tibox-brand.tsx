export function TiboxBrand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <div className={`tibox-brand${light ? " is-light" : ""}${compact ? " is-compact" : ""}`} aria-label="TIBOX Compliance">
      <svg viewBox="0 0 460 83.8" role="img" aria-label="TIBOX" className="tibox-logo">
        <defs>
          <linearGradient id="tbg1" gradientUnits="userSpaceOnUse" x1="308.96" y1="-47.8278" x2="341.23" y2="-47.8278" gradientTransform="matrix(1 0 0 -1 0 11.2)">
            <stop offset="0" stopColor="#FF4222" /><stop offset="1" stopColor="#EA7F18" />
          </linearGradient>
          <linearGradient id="tbg2" gradientUnits="userSpaceOnUse" x1="267.35" y1="-47.8436" x2="299.58" y2="-47.8436" gradientTransform="matrix(1 0 0 -1 0 11.2)">
            <stop offset="0" stopColor="#00D1FF" /><stop offset="1" stopColor="#0E9BDB" />
          </linearGradient>
          <linearGradient id="tbg3" gradientUnits="userSpaceOnUse" x1="276.6961" y1="-13.6412" x2="331.9964" y2="-13.6412" gradientTransform="matrix(1 0 0 -1 0 11.2)">
            <stop offset="0" stopColor="#FFB200" /><stop offset="1" stopColor="#E9DE03" />
          </linearGradient>
        </defs>
        <path fill="currentColor" d="M105.8,17.2c-0.2-4.2,3.2-7.8,7.4-8c4.2-0.2,7.8,3.2,8,7.4c0,0.2,0,0.4,0,0.6v55.6c-0.2,4.2-3.7,7.6-8,7.4c-4-0.1-7.3-3.4-7.4-7.4V17.2z"/>
        <path fill="currentColor" d="M168.5,17.8c0-4.2,3.4-7.6,7.6-7.7c0,0,0.1,0,0.1,0h24.7c8,0,14.2,2.2,18.2,6.2c3.2,3.1,4.9,7.4,4.8,11.9v0.2c0,7.9-4.2,12.3-9.2,15c8.1,3.1,13.1,7.8,13.1,17.2v0.2c0,12.8-10.4,19.1-26.1,19.1h-25.5c-4.2,0-7.6-3.3-7.7-7.5c0,0,0-0.1,0-0.1V17.8z M197.6,38.3c6.8,0,11.1-2.2,11.1-7.4v-0.2c0-4.6-3.6-7.2-10.1-7.2h-15.2v14.8H197.6z M201.7,66.4c6.8,0,10.9-2.4,10.9-7.6v-0.2c0-4.7-3.5-7.6-11.4-7.6h-17.7v15.4H201.7z"/>
        <path fill="currentColor" d="M452.2,20.8c1.6-4.1-0.4-8.8-4.6-10.4c-3-1.2-6.4-0.4-8.6,1.9l-21.8,21.8l-21.8-21.8c-3.1-3.1-8.2-3.2-11.4,0c-3.1,3.1-3.2,8.2,0,11.4l21.8,21.8L384,67.3c-3.1,3.1-3.1,8.2,0,11.3c3.1,3.1,8.2,3.1,11.4,0l0,0l21.8-21.8L452.2,20.8z"/>
        <path fill="currentColor" d="M424.3,59.9c0.1,1.9,1,3.7,2.5,5c3,3,9.1,8.9,16.1,15.9c4.3,1,8.6-1.6,9.6-5.9c0.7-2.7-0.2-5.6-2.2-7.6l-18.1-17.9l-5.9,5.8C425.2,56.5,424.4,58.1,424.3,59.9z"/>
        <path fill="currentColor" d="M27,24.3H12.3c-3.9,0-7-3.2-7-7s3.2-7,7-7h44.6c3.9,0,7,3.2,7,7s-3.2,7-7,7H42.2v48.3c0,4.2-3.4,7.6-7.6,7.6S27,76.8,27,72.6L27,24.3z"/>
        <path fill="url(#tbg1)" d="M311,48.5l24.5-13.7c1.9-1.1,4.3-0.4,5.3,1.5c0.3,0.6,0.5,1.2,0.5,1.9v27.6c0,1.4-0.8,2.7-2,3.4l-24.4,14.2c-1.9,1.1-4.3,0.4-5.3-1.5c-0.3-0.6-0.5-1.2-0.5-1.9V51.9C309,50.4,309.8,49.1,311,48.5z"/>
        <path fill="url(#tbg2)" d="M293.7,83.3l-24.4-14.1c-1.2-0.7-1.9-2-2-3.4V38.2c0-2.2,1.7-3.9,3.9-3.9c0.7,0,1.3,0.2,1.9,0.5l24.4,13.7c1.2,0.7,2,2,2,3.4v28.1c0,2.2-1.7,3.9-3.9,3.9C295,83.8,294.3,83.7,293.7,83.3z"/>
        <path fill="url(#tbg3)" d="M306.5,7.7l23.5,13.9c1.9,1.1,2.5,3.5,1.4,5.3c-0.3,0.6-0.8,1.1-1.4,1.4L306.4,42c-1.2,0.7-2.7,0.7-3.9,0l-23.9-14c-1.9-1.1-2.5-3.5-1.4-5.4c0.3-0.6,0.8-1.1,1.4-1.4l23.9-13.6C303.8,7,305.3,7,306.5,7.7z"/>
      </svg>
      {!compact ? <span className="tibox-product-name">Compliance</span> : null}
    </div>
  );
}
