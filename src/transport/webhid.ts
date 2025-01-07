import { Transport } from './';

/**
 * @hidden
 */
const REPORT_ID = 0x90;

/**
 * WebHID Transport class
 */
export class WebHID implements Transport {
    private device: HIDDevice;
    private reportId: number;
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
        return new DataView(report.buffer);
    }

    /**
     * Write to device
     * @param data Data to write
     * @returns Promise
     */
    public async write(data: BufferSource): Promise<void> {
        const buffer = new Uint8Array(data);
        await this.device.sendReport(this.reportId, buffer);
    }
}