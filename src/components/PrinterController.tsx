import React, { useState, useEffect } from 'react';
import { Printer, Check, RefreshCw, AlertCircle, Info, ExternalLink, HelpCircle } from 'lucide-react';
import { detectConnectedPrinters, ThermalPrinterDevice, printReceiptViaBrowser } from '../utils/printer';

interface PrinterControllerProps {
  // Config state
  isPrinterConnected: boolean;
  onSetPrinterConnected: (val: boolean) => void;
  autoPrintEnabled: boolean;
  onSetAutoPrintEnabled: (val: boolean) => void;
  connectedDevice: ThermalPrinterDevice | null;
  onSetConnectedDevice: (dev: ThermalPrinterDevice | null) => void;

  // Manual actions
  onTriggerPrint: () => void;
  hasOrderItems: boolean;
  paymentStatus: 'unpaid' | 'paid';
}

export const PrinterController: React.FC<PrinterControllerProps> = ({
  isPrinterConnected,
  onSetPrinterConnected,
  autoPrintEnabled,
  onSetAutoPrintEnabled,
  connectedDevice,
  onSetConnectedDevice,
  onTriggerPrint,
  hasOrderItems,
  paymentStatus,
}) => {
  const [loading, setLoading] = useState(false);
  const [sandboxWarning, setSandboxWarning] = useState(false);
  const [supportedApis, setSupportedApis] = useState({ usb: false, serial: false, bluetooth: false });
  const [expanded, setExpanded] = useState(false);
  const [printIndicator, setPrintIndicator] = useState<'idle' | 'printing' | 'success'>('idle');

  // Query connected hardware devices on component load or refresh
  const handleCheckPrinters = async (isManual = false) => {
    setLoading(true);
    try {
      const result = await detectConnectedPrinters();
      setSupportedApis(result.supported);
      setSandboxWarning(result.sandboxRestricted);

      if (result.devices.length > 0) {
        // Automatically connect to the first detected hardware thermal printer!
        onSetConnectedDevice(result.devices[0]);
        onSetPrinterConnected(true);
      } else {
        // If no hardware is paired yet and we are in manual refresh, offer virtual driver
        if (isManual && !isPrinterConnected) {
          // Keep virtual
          onSetConnectedDevice({
            name: 'Epson TM-T88VI (Virtual POS)',
            type: 'virtual',
            status: 'online'
          });
          onSetPrinterConnected(true);
        }
      }
    } catch (e) {
      console.error('Error querying browser device permissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    handleCheckPrinters(false);
  }, []);

  // Request native hardware device pairing dialog (WebUSB)
  const requestUsbDevice = async () => {
    const nav = navigator as any;
    if (!nav.usb) {
      alert('Your browser does not support the WebUSB API. Try Google Chrome or Microsoft Edge.');
      return;
    }
    try {
      setLoading(true);
      // Let user pick any USB device
      const device = await nav.usb.requestDevice({ filters: [] });
      if (device) {
        const newDev: ThermalPrinterDevice = {
          name: device.productName || 'USB Direct Thermal Printer',
          type: 'usb',
          vendorId: device.vendorId.toString(16).padStart(4, '0'),
          productId: device.productId.toString(16).padStart(4, '0'),
          status: 'online'
        };
        onSetConnectedDevice(newDev);
        onSetPrinterConnected(true);
      }
    } catch (err: any) {
      console.warn('USB Pairing cancelled/failed:', err);
      if (err.name === 'SecurityError') {
        alert('WebUSB is currently restricted by the browser iframe permissions policy. Try opening the app in a new window to pair physical hardware!');
      } else {
        alert(`Could not connect physical device: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualPrint = () => {
    setPrintIndicator('printing');
    onTriggerPrint();
    setTimeout(() => {
      setPrintIndicator('success');
      setTimeout(() => setPrintIndicator('idle'), 2000);
    }, 1500);
  };

  return (
    <div className="bg-[#0b172d]/70 border border-blue-900/15 rounded-2xl p-4 text-left transition-all space-y-3">
      {/* Header Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg border ${
            isPrinterConnected 
              ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' 
              : 'bg-amber-955/20 border-amber-950/20 text-slate-400'
          }`}>
            <Printer className={`h-4 w-4 ${printIndicator === 'printing' ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">
              Thermal Receipt Support
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isPrinterConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span className="text-[10px] text-slate-400 font-bold">
                {isPrinterConnected 
                  ? `${connectedDevice?.name || 'Printer Active'} (${connectedDevice?.type || 'Virtual'})` 
                  : 'Disconnected / Offline'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2F80ED] hover:text-white hover:bg-blue-900/10 rounded-lg border border-blue-900/10 hover:border-blue-500/30 transition-all cursor-pointer"
        >
          {expanded ? 'Collapse' : 'Manage'}
        </button>
      </div>

      {/* Conditionally Expanded Detail & Controller Configuration */}
      {expanded && (
        <div className="pt-3 border-t border-blue-900/10 text-xs space-y-4 animate-in slide-in-from-top-2 duration-150">
          
          {/* Driver Selection & API Support Metrics */}
          <div className="grid grid-cols-2 gap-3 bg-[#050b16]/75 p-3 rounded-xl border border-blue-900/10 text-[10px]">
            <div className="space-y-1">
              <span className="text-slate-500 uppercase tracking-wider font-extrabold block">Connected Driver</span>
              <select
                value={isPrinterConnected ? connectedDevice?.type : 'none'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'none') {
                    onSetPrinterConnected(false);
                    onSetConnectedDevice(null);
                  } else if (val === 'virtual') {
                    onSetPrinterConnected(true);
                    onSetConnectedDevice({
                      name: 'Epson TM-T88VI (Virtual POS)',
                      type: 'virtual',
                      status: 'online'
                    });
                  } else if (val === 'usb') {
                    requestUsbDevice();
                  }
                }}
                className="w-full bg-[#0b172d] border border-blue-900/30 rounded px-2 py-1 text-slate-200 focus:outline-none"
              >
                <option value="virtual">Epson (Virtual Emulator)</option>
                <option value="usb">Physical USB Thermal Printer</option>
                <option value="none">Printer Disabled</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 uppercase tracking-wider font-extrabold block">Auto-Print Drafts</span>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <input
                  type="checkbox"
                  id="autoPrintCheckbox"
                  checked={autoPrintEnabled}
                  onChange={(e) => onSetAutoPrintEnabled(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-blue-900/40 bg-slate-900 text-blue-600 focus:ring-opacity-0 cursor-pointer"
                />
                <label htmlFor="autoPrintCheckbox" className="font-bold text-slate-300 select-none cursor-pointer">
                  Auto-Print Paid
                </label>
              </div>
            </div>
          </div>

          {/* Sandbox alert for developers (graces standard security policy) */}
          {sandboxWarning && (
            <div className="flex items-start gap-2 bg-[#250d12]/30 border border-rose-950/20 rounded-xl p-2.5 text-slate-400 text-[10px] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-rose-450 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-rose-300 block">Iframe API Shield Engaged</span>
                <p>
                  Chrome restricts WebUSB directly inside nested developer sandbox previews for safety. To link a physical thermal hardware module directly:
                </p>
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 font-extrabold hover:underline inline-flex items-center gap-1 uppercase text-[9px] tracking-wider pt-0.5"
                >
                  <span>Open in standalone tab</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}

          {/* Hardware list check */}
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-medium">System support: USB: {supportedApis.usb ? '✓' : '✗'} | Serial: {supportedApis.serial ? '✓' : '✗'}</span>
            <button
              onClick={() => handleCheckPrinters(true)}
              type="button"
              className="text-blue-400 hover:text-white flex items-center gap-1 font-bold bg-blue-950/40 border border-blue-900/20 px-2 py-0.5 rounded cursor-pointer"
              disabled={loading}
            >
              <RefreshCw className={`h-2.5 w-2.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Query Ports</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary Action Row - The Print Receipt button */}
      <div className="flex gap-2">
        {isPrinterConnected && (
          <button
            type="button"
            onClick={handleManualPrint}
            className={`flex-1 py-2 px-3 border rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              printIndicator === 'printing'
                ? 'bg-amber-600 border-amber-500 text-white animate-pulse'
                : printIndicator === 'success'
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-[#14223f] hover:bg-[#1a2e55] border-blue-900/30 text-blue-400 hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>
              {printIndicator === 'printing' && 'Spooling print job...'}
              {printIndicator === 'success' && 'Print job completed! ✓'}
              {printIndicator === 'idle' && (paymentStatus === 'paid' ? 'Print Receipt' : 'Print Draft Invoice')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
