import { Camera, X, Image as ImageIcon, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface ReceiptScanScreenProps {
  onScanComplete: (items: string[]) => void;
  onBack: () => void;
}

export default function ReceiptScanScreen({ onScanComplete, onBack }: ReceiptScanScreenProps) {
  const handleScan = () => {
    // Simulate scanning a receipt
    const mockItems = [
      'Whole Wheat Bread',
      'Chicken Breast (2 lbs)',
      'Broccoli',
      'Brown Rice',
      'Greek Yogurt',
      'Salmon Fillet',
      'Spinach',
      'Olive Oil',
      'Eggs (12 count)',
      'Tomatoes',
    ];
    onScanComplete(mockItems);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="text-white">
            <X size={24} />
          </button>
          <h3 className="text-white">Scan Receipt</h3>
          <div className="w-6" />
        </div>
      </div>

      {/* Camera View Placeholder */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />
        
        {/* Scanning Frame */}
        <div className="relative z-10 w-[280px] h-[360px] border-2 border-white border-dashed rounded-lg flex items-center justify-center">
          <div className="text-center text-white/70">
            <Camera size={48} className="mx-auto mb-2" />
            <p>Position receipt within frame</p>
          </div>
        </div>

        {/* Corner Indicators */}
        <div className="absolute z-20 w-[280px] h-[360px]">
          {/* Top Left */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
          {/* Top Right */}
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
          {/* Bottom Left */}
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
          {/* Bottom Right */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
        </div>
      </div>

      {/* Tips */}
      <div className="absolute bottom-40 left-6 right-6 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-white mb-1">Quick Tip</h4>
              <p className="text-white/80">
                Make sure the entire receipt is visible and well-lit for best results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 space-y-3">
        <Button
          onClick={handleScan}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700"
        >
          <Camera className="mr-2" size={20} />
          Capture Receipt
        </Button>
        <Button
          variant="outline"
          className="w-full bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
        >
          <ImageIcon className="mr-2" size={20} />
          Upload from Gallery
        </Button>
      </div>
    </div>
  );
}
