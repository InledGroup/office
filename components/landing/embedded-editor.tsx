"use client";

import { useEffect, useRef, useState, useId } from "react";
import { useAppStore, useResolvedLanguage, useHasHydrated } from "@/store";
import {
  API_JS,
  APP_ROOT,
  getDocumentType,
  PRELOAD_HTML,
} from "@/utils/editor/utils";
import io, { MockSocket } from "@/utils/editor/socket";
import { createFetchProxy } from "@/utils/editor/fetch";
import { createXHRProxy } from "@/utils/editor/xhr";
import { DocEditor } from "@/utils/editor/types";
import { Loader2, Smartphone, Monitor } from "lucide-react";

interface EmbeddedEditorProps {
  fileUrl: string;
  fileType: string;
}

export function EmbeddedEditor({ fileUrl, fileType }: EmbeddedEditorProps) {
  const server = useAppStore((state) => state.server);
  const language = useResolvedLanguage();
  const theme = useAppStore((state) => state.theme);
  const hasHydrated = useHasHydrated();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<DocEditor | null>(null);
  const reactId = useId();
  const placeholderId = `editor-${reactId.replace(/:/g, "")}`;

  // Detect mobile screen size after mount
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!hasHydrated || !mounted || isMobile) return;

    let isDestroyed = false;

    const init = async () => {
      setLoading(true);
      
      // Open the URL
      await server.openUrl(fileUrl, { fileType, fileName: fileUrl.split('/').pop() });
      
      if (isDestroyed) return;

      const apiUrl = APP_ROOT + API_JS;
      
      MockSocket.on("connect", server.handleConnect);
      MockSocket.on("disconnect", server.handleDisconnect);

      const onAppReady = () => {
        const iframe = document.querySelector<HTMLIFrameElement>(
          'iframe[name="frameEditor"]'
        );
        const win = iframe?.contentWindow as typeof window;
        const doc = iframe?.contentDocument;
        if (!doc || !win) return;

        const XHR = createXHRProxy(win.XMLHttpRequest);
        const fetchProxy = createFetchProxy(win);
        const _Worker = win.Worker;

        XHR.use((request: Request) => server.handleRequest(request));
        fetchProxy.use((request: Request) => server.handleRequest(request));
        
        Object.assign(win, {
          io: io,
          XMLHttpRequest: XHR,
          fetch: fetchProxy,
          Worker: function (url: string, options?: WorkerOptions) {
            const u = new URL(url, location.origin);
            return new _Worker(u.href.replace(u.origin, location.origin), options);
          },
        });

        const script = doc.createElement("script");
        script.src = apiUrl;
        doc.body.appendChild(script);
      };

      const createEditor = () => {
        if (!window.DocsAPI) return;
        
        server.setClient({ buildVersion: window.DocsAPI.DocEditor.version() });
        
        const docInfo = server.getDocument();
        const user = server.getUser();
        const documentType = getDocumentType(docInfo.fileType);
        
        if (editorRef.current) {
          editorRef.current.destroyEditor?.();
        }

        editorRef.current = new window.DocsAPI.DocEditor(placeholderId, {
          document: {
            fileType: docInfo.fileType,
            key: docInfo.key,
            title: docInfo.title,
            url: docInfo.url,
            permissions: { 
              edit: docInfo.fileType !== "pdf", 
              chat: false, 
              print: false,
              copy: true,
              download: true
            },
          },
          documentType: documentType,
          editorConfig: {
            lang: language,
            user,
            customization: {
              uiTheme: theme,
              feedback: { visible: false },
              forcesave: true,
              logo: {
                image: "https://hosted.inled.es/insuite.svg",
                url: location.origin,
              },
            },
          },
          events: {
            onAppReady,
            onDocumentReady: () => {
              console.log("Embedded Editor: Document Ready");
              setLoading(false);
            },
          },
          type: "desktop",
          width: "100%",
          height: "100%",
        });
        
        (window as any).editor = editorRef.current;
      };

      if (window.DocsAPI && window.DocsAPI.DocEditor) {
        createEditor();
      } else {
        let script = document.querySelector<HTMLScriptElement>(`script[src="${apiUrl}"]`);
        if (!script) {
          script = document.createElement("script");
          script.src = apiUrl;
          document.head.appendChild(script);
        }
        script.onload = createEditor;
      }
    };

    init();

    return () => {
      isDestroyed = true;
      MockSocket.off("connect", server.handleConnect);
      MockSocket.off("disconnect", server.handleDisconnect);
      editorRef.current?.destroyEditor?.();
      editorRef.current = null;
    };
  }, [fileUrl, fileType, hasHydrated, language, theme, server, isMobile, mounted]);

  if (isMobile) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-50">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Smartphone className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <h3 className="text-xl font-bold mb-4">Experiencia de escritorio</h3>
        <p className="text-text-secondary leading-relaxed max-w-xs mx-auto mb-8">
          Los editores de InSuite están diseñados para ofrecer la máxima potencia en pantallas grandes. Aún no están optimizados para teléfonos móviles.
        </p>
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
          <Monitor className="w-4 h-4" />
          <span>Pruébalo en tu ordenador</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-white">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-sm font-medium text-text-secondary">Abriendo documento de prueba...</p>
          <p className="text-xs text-text-secondary mt-2">Todo se ejecuta localmente en tu navegador</p>
        </div>
      )}
      {hasHydrated && <div id={placeholderId} className="w-full h-full" />}
      <iframe className="w-0 h-0 hidden" src={APP_ROOT + PRELOAD_HTML} />
    </div>
  );
}
