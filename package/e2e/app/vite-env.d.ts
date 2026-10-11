/// <reference types="vite/client" />

interface Window {
  serverRender: {
    html: string;
    props: { label: string; name: string; defaultValue: string; minDate: string; today: string };
  };
  hydrationErrors: string[];
}
