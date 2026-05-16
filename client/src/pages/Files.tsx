import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/Layout';

interface FileItem {
  id: string;
  source: string;
  type: 'image' | 'file';
  name: string;
  relatedProduct?: string;
  createdAt: number;
}

function StatBox({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export default function Files() {
  const { products, settings } = useApp();

  const fileItems = useMemo<FileItem[]>(() => {
    const items: FileItem[] = [];
    products.products.forEach((product) => {
      (product.images || []).forEach((image, index) => {
        items.push({
          id: `${product.id}-img-${index}`,
          source: image,
          type: 'image',
          name: image.split('/').pop() || `image-${index + 1}`,
          relatedProduct: product.name,
          createdAt: product.createdAt,
        });
      });
      (product.files || []).forEach((file, index) => {
        items.push({
          id: `${product.id}-file-${index}`,
          source: file,
          type: 'file',
          name: file.split('/').pop() || `file-${index + 1}`,
          relatedProduct: product.name,
          createdAt: product.createdAt,
        });
      });
    });
    return items;
  }, [products.products]);

  const imageCount = fileItems.filter((item) => item.type === 'image').length;
  const fileCount = fileItems.filter((item) => item.type === 'file').length;
  const productCount = products.products.filter((product) => (product.images?.length || 0) > 0 || (product.files?.length || 0) > 0).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Files</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Documents and media attached to your product records, grouped in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBox label="Attachments" value={String(fileItems.length)} hint="Total images + documents" />
          <StatBox label="Images" value={String(imageCount)} hint="Product photos and visuals" />
          <StatBox label="Documents" value={String(fileCount)} hint="Uploaded files and media links" />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Attachment Index</h3>
              <p className="text-xs text-muted-foreground mt-1">{productCount} products contain media or files.</p>
            </div>
            <div className="text-xs text-muted-foreground">Business: {settings.settings.name || 'ProSource'}</div>
          </div>

          {fileItems.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">File</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Related Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fileItems.map((item) => (
                      <tr key={item.id} className="hover:bg-secondary/40">
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs font-medium text-foreground">
                            {item.type === 'image' ? 'Image' : 'File'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">{item.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.relatedProduct || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground break-all">{item.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-10 text-center">
              <p className="text-sm font-medium text-foreground">No files or images yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add product images or file links to see documents and media here.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
