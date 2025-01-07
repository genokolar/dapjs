import { Transport } from './';

interface HIDDevice extends EventTarget {
    oninputreport: ((this: HIDDevice, ev: Event) => any) | null;
    readonly opened: boolean;
    readonly vendorId: number;
    readonly productId: number;
    readonly productName: string;

    open(): Promise<void>;
    close(): Promise<void>;
    forget(): Promise<void>;
    sendReport(reportId: number, data: ArrayBufferView | ArrayBuffer): Promise<void>;
    sendFeatureReport(reportId: number, data: ArrayBufferView | ArrayBuffer): Promise<void>;
    receiveFeatureReport(reportId: number): Promise<DataView>;
}

/**
 * @hidden
 */
const REPORT_ID = 0x90;

/**
 * WebHID Transport class
 */
export class WebHID implements Transport {
    public readonly packetSize = 64;

    /**
     * WebHID constructor
     * @param device WebHID device to use
     * @param reportId Report ID to use
     */
    constructor(private device: HIDDevice, private reportId = REPORT_ID) {
    }

    /**
     * Open device
     * @returns Promise
     */
    public async open(): Promise<void> {
        await this.device.open();
    }

    /**
     * Close device
     * @returns Promise
     */
    public async close(): Promise<void> {
        await this.device.close();
    }

    /**
     * Read from device
     * @returns Promise of DataView
     */
    public async read(): Promise<DataView> {
        const report = await this.device.receiveReport(this.reportId);
        return new DataView(report);
    }

    /**
     * Write to device
     * @param data Data to write
     * @returns Promise
     */
    public async write(data: BufferSource): Promise<void> {
        const buffer = new Uint8Array(data as ArrayBuffer);
        await this.device.sendReport(this.reportId, buffer);
    }
}
