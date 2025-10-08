'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, QrCode, Code, Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import { generateQRCodeUrl, generateEmbedCode } from '@/lib/playlist-utils';

interface ShareMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistSlug: string;
  playlistTitle: string;
}

export function ShareMenu({ open, onOpenChange, playlistSlug, playlistTitle }: ShareMenuProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const shareUrl = `${window.location.origin}/playlist/${playlistSlug}`;
  const qrCodeUrl = generateQRCodeUrl(shareUrl);
  const embedCode = generateEmbedCode(playlistSlug);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${playlistSlug}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Playlist</DialogTitle>
          <DialogDescription>
            Share "{playlistTitle}" with others
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">
              <Copy className="h-4 w-4 mr-2" />
              Link
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="embed">
              <Code className="h-4 w-4 mr-2" />
              Embed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-link">Shareable Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-link"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(shareUrl, 'Link')}
                >
                  {copied === 'Link' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view your playlist
              </p>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="border rounded-lg p-4 bg-white">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={downloadQRCode}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(qrCodeUrl, 'QR Code URL')}
                >
                  {copied === 'QR Code URL' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan this QR code to quickly access the playlist
              </p>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="embed-code">Embed Code</Label>
              <div className="relative">
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(embedCode, 'Embed code')}
                >
                  {copied === 'Embed code' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this code to embed the playlist in your website or blog
              </p>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-muted">
                <div className="aspect-video bg-background rounded flex items-center justify-center text-muted-foreground">
                  Embed Preview
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
