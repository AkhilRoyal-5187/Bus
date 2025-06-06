// types/qrcode-react.d.ts
declare module 'qrcode.react' {
  import * as React from 'react';

  export interface QRCodeProps {
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    renderAs?: 'canvas' | 'svg';
    className?: string;
    style?: React.CSSProperties;
  }

  const QRCode: React.FC<QRCodeProps>;

  export default QRCode;
}
