import { IconText } from './Icon';

export type PreviewDocument = {
  fileName?: string;
  mimeType?: string;
  dataUrl: string;
};

type DocumentPreviewDialogProps = {
  document: PreviewDocument;
  title?: string;
  onClose: () => void;
};

export function DocumentPreviewDialog({ document: file, title = 'Visualizar documento', onClose }: DocumentPreviewDialogProps) {
  const fileName = file.fileName || 'documento';
  const mimeType = String(file.mimeType || '').toLowerCase();
  const isImage = mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(fileName);
  const isPdf = mimeType.includes('pdf') || /\.pdf$/i.test(fileName);
  const isBrowserPreview = isPdf || mimeType.startsWith('text/') || mimeType.includes('xml') || /\.(txt|csv|xml|html?)$/i.test(fileName);

  return (
    <div className="dialog-backdrop open document-preview-backdrop" role="dialog" aria-modal="true" aria-labelledby="documentPreviewTitle">
      <section className="dialog document-preview-dialog">
        <div className="dialog-header">
          <div>
            <h2 id="documentPreviewTitle">{title}</h2>
            <span>{fileName}</span>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar" onClick={onClose}>x</button>
        </div>

        <div className="dialog-body document-preview-body">
          <div className="document-preview-frame">
            {isImage ? (
              <img src={file.dataUrl} alt={fileName} />
            ) : isBrowserPreview ? (
              <iframe src={file.dataUrl} title={fileName} sandbox={isPdf ? undefined : ''} />
            ) : (
              <div className="document-preview-empty">
                <strong>Pre-visualizacao indisponivel</strong>
                <span>Este tipo de arquivo pode ser baixado pelo botao abaixo.</span>
              </div>
            )}
          </div>
        </div>

        <div className="dialog-actions">
          <button className="btn" type="button" onClick={() => downloadPreviewDocument(file)}>
            <IconText name="download">Baixar</IconText>
          </button>
          <button className="btn primary" type="button" onClick={onClose}>
            <IconText name="close">Fechar</IconText>
          </button>
        </div>
      </section>
    </div>
  );
}

export function downloadPreviewDocument(file: PreviewDocument) {
  const link = window.document.createElement('a');
  link.href = file.dataUrl;
  link.download = file.fileName || 'documento';
  window.document.body.appendChild(link);
  link.click();
  link.remove();
}
