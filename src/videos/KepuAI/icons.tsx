import React from "react";
import type { KeywordId } from "./keywords";

const Building: React.FC = () => {
  return (
    <path
      fillRule="evenodd"
      d="M5 41.2h38v3.3H5v-3.3z M8 41.2V23.2h8.2V41.2H8z M18.4 41.2V11.2h11.2V41.2H18.4z M32 41.2V25.4h8V41.2h-8z M10.1 27.4h3.8v3.2h-3.8v-3.2z M10.1 32.8h3.8v3.2h-3.8v-3.2z M21.1 16h3.1v3H21.1v-3z M25.2 16h3.1v3h-3.1v-3z M21.1 21.6h3.1v3h-3.1v-3z M25.2 21.6h3.1v3h-3.1v-3z M21.1 27.2h3.1v3h-3.1v-3z M25.2 27.2h3.1v3h-3.1v-3z M21.1 32.8h3.1v3h-3.1v-3z M25.2 32.8h3.1v3h-3.1v-3z M34.1 29.4h3.7v3.1h-3.7v-3.1z M34.1 34.6h3.7v3.1h-3.7v-3.1z"
    />
  );
};

const ChefHat: React.FC = () => {
  return (
    <>
      <ellipse cx="15" cy="15.5" rx="6.6" ry="7.2" />
      <ellipse cx="24" cy="12.2" rx="7.4" ry="8.2" />
      <ellipse cx="33" cy="15.5" rx="6.6" ry="7.2" />
      <path d="M7.5 27.2h33v8.2c0 1.5-1.2 2.6-2.7 2.6H10.2c-1.5 0-2.7-1.1-2.7-2.6v-8.2z" />
    </>
  );
};

const Parcel: React.FC = () => {
  return (
    <path
      fillRule="evenodd"
      d="M8 11.5h32v26H8v-26zm13.2 0v26h5.6v-26h-5.6zM8 21h32v5.6H8V21z"
    />
  );
};

const Assistant: React.FC = () => {
  return (
    <>
      <circle cx="20" cy="13.2" r="6.4" />
      <path d="M7.2 41.2c.8-9.2 6.2-14.4 12.8-14.4 4.8 0 8.6 2.4 10.8 6.2v8.2H7.2z" />
      <path d="M30.2 24.8h10c1.5 0 2.6 1.2 2.6 2.6v8.4c0 1.4-1.1 2.6-2.6 2.6h-10v-2.5h7.4v-8.6H30.2v-2.5z" />
    </>
  );
};

const Recipe: React.FC = () => {
  return (
    <path
      fillRule="evenodd"
      d="M24 13.4c-1.1-.8-4.6-2.8-9.2-2.8-3.6 0-6.5.8-8.6 1.8v23.4c2.2-.9 5.1-1.6 8.6-1.6 4.6 0 8.1 1.9 9.2 2.7 1.1-.8 4.6-2.7 9.2-2.7 3.5 0 6.4.7 8.6 1.6V12.4c-2.1-1-5-1.8-8.6-1.8-4.6 0-8.1 2-9.2 2.8z M22.5 15.2h3v21.2h-3V15.2z M12 18.6h6.4v1.8H12v-1.8z M12 22.6h6.4v1.8H12v-1.8z M12 26.6h4.8v1.8H12v-1.8z M29.6 18.6H36v1.8h-6.4v-1.8z M29.6 22.6H36v1.8h-6.4v-1.8z M29.6 26.6h4.8v1.8h-4.8v-1.8z"
    />
  );
};

const Socket: React.FC = () => {
  return (
    <>
      <circle cx="9" cy="13.5" r="1.7" />
      <circle cx="31" cy="13.5" r="1.7" />
      <circle cx="9" cy="34.5" r="1.7" />
      <circle cx="31" cy="34.5" r="1.7" />
      <path
        fillRule="evenodd"
        d="M6 16.2h26c1.8 0 3.2 1.4 3.2 3.2v9.2c0 1.8-1.4 3.2-3.2 3.2H6v-15.6zm8.4 4.6c0-1.5 1.2-2.7 2.7-2.7h5.8c1.5 0 2.7 1.2 2.7 2.7s-1.2 2.7-2.7 2.7h-5.8c-1.5 0-2.7-1.2-2.7-2.7z"
      />
      <path d="M35.2 20.4h7.4c2 0 3.6 1.6 3.6 3.6s-1.6 3.6-3.6 3.6h-7.4v-7.2z" />
    </>
  );
};

const Buckle: React.FC = () => {
  return (
    <>
      <path d="M1.4 20.2h11v7.6h-11z" />
      <path
        fillRule="evenodd"
        d="M11.2 14.2h18.6c2.3 0 4.2 1.9 4.2 4.2v11.2c0 2.3-1.9 4.2-4.2 4.2H11.2V14.2zm5.6 6.1a4.2 4.2 0 1 0 8.4 0 4.2 4.2 0 1 0-8.4 0z"
      />
      <path d="M34 19.4h10.2c1.6 0 2.8 1.3 2.8 2.9v3.4c0 1.6-1.2 2.9-2.8 2.9H34v-9.2z" />
    </>
  );
};

const GLYPHS: Record<KeywordId, React.FC> = {
  ai: Building,
  model: ChefHat,
  token: Parcel,
  agent: Assistant,
  skill: Recipe,
  mcp: Socket,
  harness: Buckle,
};

export const KeywordGlyph: React.FC<{
  id: KeywordId;
  size: number;
}> = ({ id, size }) => {
  const Glyph = GLYPHS[id];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden
    >
      <Glyph />
    </svg>
  );
};
