import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Download, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  Check, 
  AlertCircle, 
  X, 
  Info, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  Sparkles,
  ArrowRight,
  Globe,
  Lock
} from 'lucide-react';
import { VisualData, VisualNode, UserSubscription } from '../types';
import { jsPDF } from 'jspdf';

interface GeneratorProps {
  data: VisualData;
  onBack: () => void;
  onRegenerate: () => void;
  onUpdateNodes: (nodes: VisualNode[]) => void;
  isRegenerating: boolean;
  generationStep?: string;
  subscription: UserSubscription;
  onUpgradeRequest: (reason: string) => void;
}

export const Generator: React.FC<GeneratorProps> = ({ 
  data, 
  onBack, 
  onRegenerate, 
  onUpdateNodes, 
  isRegenerating, 
  generationStep, 
  subscription, 
  onUpgradeRequest 
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editLabel, setEditLabel] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedNode, setSelectedNode] = React.useState<VisualNode | null>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);

  const isFree = subscription.plan === 'FREE';

  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleEdit = (node: VisualNode) => {
    setEditingId(node.id);
    setEditLabel(node.label);
    setEditDesc(node.description);
  };

  const handleSave = () => {
    if (!editingId) return;
    const newNodes = data.nodes.map(n => 
      n.id === editingId ? { ...n, label: editLabel, description: editDesc } : n
    );
    onUpdateNodes(newNodes);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const newNodes = data.nodes.filter(n => n.id !== id);
    onUpdateNodes(newNodes);
  };

  const getFileName = (extension: string) => {
    const date = new Date().toISOString().split('T')[0];
    const sanitizedTopic = data.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `VisualMate_${sanitizedTopic}_${date}.${extension}`;
  };

  const handleDownload = async (format: 'png' | 'jpg' | 'pdf') => {
    if (!data.imageUrl || isDownloading) return;

    if (isFree && format === 'pdf') {
      onUpgradeRequest("PDF export is only available on Pro plans.");
      return;
    }

    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const img = document.createElement('img');
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = data.imageUrl!;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(img, 0, 0);

      if (isFree) {
        ctx.save();
        ctx.font = `${Math.floor(canvas.width / 20)}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText("VisualMate AI - FREE PLAN", 0, 0);
        ctx.restore();
        
        ctx.font = `${Math.floor(canvas.width / 50)}px sans-serif`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.textAlign = 'right';
        ctx.fillText("Made with VisualMate AI", canvas.width - 20, canvas.height - 20);
      }

      if (format === 'pdf') {
        let pdf;
        try {
          // Robust jsPDF instantiation
          const jsPDFConstructor = (jsPDF as any).jsPDF || jsPDF;
          pdf = new jsPDFConstructor({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
        } catch (error) {
          console.error("jsPDF instantiation failed:", error);
          throw new Error("Failed to initialize PDF generator. Please try another format.");
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const maxWidth = pageWidth - (margin * 2);
        
        const ratio = canvas.width / canvas.height;
        let finalWidth = maxWidth;
        let finalHeight = maxWidth / ratio;

        if (finalHeight > (pageHeight - margin * 2)) {
          finalHeight = pageHeight - margin * 2;
          finalWidth = finalHeight * ratio;
        }

        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        const finalImageData = canvas.toDataURL('image/png');
        pdf.addImage(finalImageData, 'PNG', x, y, finalWidth, finalHeight);
        
        pdf.setFontSize(16);
        pdf.setTextColor(40, 40, 40);
        pdf.text(data.title, pageWidth / 2, y - 10, { align: 'center' });
        
        pdf.save(getFileName('pdf'));
      } else {
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = getFileName(format);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }, mimeType, 0.9);
      }

      setNotification({ message: 'Download started successfully', type: 'success' });
    } catch (error) {
      console.error('Download failed:', error);
      setNotification({ message: 'Download failed. Please try again.', type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 relative">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-20 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden border border-zinc-100"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-zinc-900">{selectedNode.label}</h3>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedNode.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
                <p className="text-zinc-600 leading-relaxed mb-8 font-medium">
                  {selectedNode.description}
                </p>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all shadow-xl"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-bold text-sm group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Workspace
        </button>
        <div className="flex gap-4">
          <button 
            onClick={onRegenerate}
            disabled={isRegenerating || isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold rounded-2xl transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} /> 
            {isRegenerating ? 'Reimagining...' : 'Regenerate'}
          </button>
          
          <div className="relative group">
            <button 
              disabled={!data.imageUrl || isDownloading}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-100/50"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Download</span>
            </button>
            
            {!isDownloading && data.imageUrl && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-zinc-100 rounded-[24px] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 overflow-hidden">
                <button 
                  onClick={() => handleDownload('png')} 
                  className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl text-sm font-bold text-zinc-700 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" /> PNG Image
                </button>
                <button 
                  onClick={() => handleDownload('jpg')} 
                  className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl text-sm font-bold text-zinc-700 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-blue-500" /> JPG Image
                </button>
                <button 
                  onClick={() => handleDownload('pdf')} 
                  className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl text-sm font-bold text-zinc-700 transition-colors"
                >
                  <FileText className="w-4 h-4 text-red-500" /> PDF Document
                  {isFree && <Lock className="w-3 h-3 ml-auto text-zinc-300" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[32px] border border-zinc-100 shadow-sm p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-3">{data.title}</h2>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">{data.description}</p>
            </div>

            {data.commentary && (
              <div className="mb-8 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs text-emerald-800 font-medium leading-relaxed italic">
                  "{data.commentary}"
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Visual Components</h3>
              {data.nodes.map((node) => (
                <div key={node.id} className="group relative bg-zinc-50 rounded-2xl p-5 border border-zinc-100 hover:border-emerald-200 hover:bg-white transition-all">
                  {editingId === node.id ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input 
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="flex-1 p-3 text-sm font-bold bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="px-3 py-1 bg-zinc-200 text-zinc-600 text-[10px] font-bold rounded-xl flex items-center">{node.type}</span>
                      </div>
                      <textarea 
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full p-3 text-xs bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                      />
                      <div className="flex gap-3">
                        <button onClick={handleSave} className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors">Save Changes</button>
                        <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-300 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-zinc-900">{node.label}</span>
                          <span className="px-2 py-0.5 bg-zinc-200 text-zinc-500 text-[9px] font-bold rounded-lg uppercase tracking-tighter">{node.type}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(node)} className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(node.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium">{node.description}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {data.edges.length > 0 && (
              <div className="mt-10 space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Logical Flow</h3>
                <div className="space-y-3">
                  {data.edges.map((edge, i) => {
                    const fromNode = data.nodes.find(n => n.id === edge.from);
                    const toNode = data.nodes.find(n => n.id === edge.to);
                    if (!fromNode || !toNode) return null;
                    return (
                      <div key={i} className="flex items-center gap-3 text-xs text-zinc-600 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                        <span className="font-bold text-zinc-800">{fromNode.label}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-300" />
                        {edge.label && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[9px] uppercase">{edge.label}</span>}
                        <ArrowRight className="w-3 h-3 text-zinc-300" />
                        <span className="font-bold text-zinc-800">{toNode.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div 
            ref={previewRef}
            style={{ aspectRatio: data.aspectRatio.replace(':', '/') }}
            className="bg-zinc-900 rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-white relative flex items-center justify-center group"
          >
            <AnimatePresence>
              {isRegenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md z-10 flex flex-col items-center justify-center text-white gap-6"
                >
                  <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-2xl" />
                  <div className="text-center space-y-2">
                    <p className="font-bold text-2xl tracking-tight">{generationStep || 'Reimagining Visual...'}</p>
                    <p className="text-white/60 text-sm font-medium">Optimizing for clarity and structure</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {data.imageUrl ? (
              <img 
                src={data.imageUrl} 
                alt={data.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-zinc-500 flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-zinc-800 rounded-[32px] flex items-center justify-center animate-pulse">
                  <ImageIcon className="w-10 h-10 opacity-20" />
                </div>
                <p className="font-bold text-zinc-400">Generating Visual Preview...</p>
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none">
              {data.nodes.slice(0, 5).map((node, i) => {
                const positions = [
                  { top: '25%', left: '25%' },
                  { top: '35%', left: '75%' },
                  { top: '65%', left: '45%' },
                  { top: '80%', left: '20%' },
                  { top: '20%', left: '55%' },
                ];
                const pos = positions[i % positions.length];
                return (
                  <motion.div 
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    style={pos}
                    className="absolute pointer-events-auto"
                  >
                    <div 
                      className="relative group/pin cursor-help"
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="w-7 h-7 bg-emerald-500 border-4 border-white rounded-full shadow-2xl hover:scale-125 transition-transform flex items-center justify-center text-[10px] text-white font-bold">
                        {i + 1}
                      </div>
                      <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-2xl border border-white/50 opacity-0 group-hover/pin:opacity-100 transition-all whitespace-nowrap z-20 translate-x-2 group-hover/pin:translate-x-0">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900">{node.label}</span>
                          <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Click for details</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900">Curriculum Aligned</h4>
                <p className="text-emerald-700 text-xs font-medium leading-relaxed">Content optimized for {data.gradeLevel} level educational standards.</p>
              </div>
            </div>
            <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900">Global Support</h4>
                <p className="text-blue-700 text-xs font-medium leading-relaxed">Visuals and labels generated in {data.language} with cultural context.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
