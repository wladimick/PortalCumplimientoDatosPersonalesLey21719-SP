import { FolderOpen } from "lucide-react";
import { ComingSoon } from "@/components/portal/coming-soon";

export default function EvidencePage() {
  return <ComingSoon eyebrow="Documentos" title="Evidencias" description="Repositorio lógico para respaldar obligaciones y controles. El proveedor de archivos podrá ser Supabase Storage o SharePoint según la decisión de producto." icon={FolderOpen} />;
}
