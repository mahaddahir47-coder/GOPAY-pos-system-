export interface ThermalPrinterDevice {
  name: string;
  type: 'usb' | 'serial' | 'bluetooth' | 'virtual';
  vendorId?: string;
  productId?: string;
  status: 'online' | 'offline' | 'error';
}

// Common thermal receipt printer vendor IDs to search for via WebUSB
export const THERMAL_PRINTER_VENDORS = [
  { id: '04b8', name: 'Epson POS' },
  { id: '0519', name: 'Star Micronics' },
  { id: '1fc9', name: 'Xprinter' },
  { id: '0dd4', name: 'Citizen' },
  { id: '04f9', name: 'Brother' },
  { id: '1a86', name: 'CH340 Serial-to-USB (Typical POS)' },
  { id: '0403', name: 'FTDI Serial-to-USB (Typical POS)' }
];

/**
 * Checks browser APIs to detect if any compatible USB or Serial thermal printers are connected.
 * Handles sandbox/security constraints gracefully inside AI Studio preview frames.
 */
export async function detectConnectedPrinters(): Promise<{
  supported: { usb: boolean; serial: boolean; bluetooth: boolean };
  devices: ThermalPrinterDevice[];
  sandboxRestricted: boolean;
}> {
  const supported = {
    usb: typeof navigator !== 'undefined' && 'usb' in navigator,
    serial: typeof navigator !== 'undefined' && 'serial' in navigator,
    bluetooth: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
  };

  const devices: ThermalPrinterDevice[] = [];
  let sandboxRestricted = false;

  // Try querying USB paired devices
  if (supported.usb) {
    try {
      const usbDevices = await (navigator as any).usb.getDevices();
      usbDevices.forEach((dev) => {
        const vidHex = dev.vendorId.toString(16).padStart(4, '0');
        const pidHex = dev.productId.toString(16).padStart(4, '0');
        
        // Check if device matches common commercial POS vendor IDs
        const knownVendor = THERMAL_PRINTER_VENDORS.find(v => v.id.toLowerCase() === vidHex.toLowerCase());
        
        devices.push({
          name: dev.productName || knownVendor?.name || `USB Print Device (${vidHex}:${pidHex})`,
          type: 'usb',
          vendorId: vidHex,
          productId: pidHex,
          status: 'online'
        });
      });
    } catch (err: any) {
      // SecurityError or DOMException is expected inside sandboxed iframes
      if (err.name === 'SecurityError' || err.message?.toLowerCase().includes('permissions policy')) {
        sandboxRestricted = true;
      }
    }
  }

  // Try querying Serial ports
  if (supported.serial) {
    try {
      // @ts-ignore (Web Serial is not in standard lib typescript yet)
      const ports = await navigator.serial.getPorts();
      ports.forEach((port: any, idx: number) => {
        const info = port.getInfo();
        const vidHex = info.usbVendorId ? info.usbVendorId.toString(16).padStart(4, '0') : undefined;
        const pidHex = info.usbProductId ? info.usbProductId.toString(16).padStart(4, '0') : undefined;
        
        devices.push({
          name: `Serial COM Port ${idx + 1} ${vidHex ? `(${vidHex}:${pidHex})` : ''}`,
          type: 'serial',
          vendorId: vidHex,
          productId: pidHex,
          status: 'online'
        });
      });
    } catch (err: any) {
      if (err.name === 'SecurityError' || err.message?.toLowerCase().includes('permissions policy')) {
        sandboxRestricted = true;
      }
    }
  }

  return {
    supported,
    devices,
    sandboxRestricted
  };
}

/**
 * Triggers printing using the universal window.print API, which conforms
 * perfectly to CSS print media definitions we have set in src/index.css.
 */
export function printReceiptViaBrowser(): boolean {
  try {
    if (typeof window !== 'undefined') {
      window.print();
      return true;
    }
  } catch (err) {
    console.error('Window print triggered failure:', err);
  }
  return false;
}
