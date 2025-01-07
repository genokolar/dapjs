import { Transport } from './';

/**
 * @hidden
 */
const REPORT_ID = 0x90;

/**
 * WebHID Transport class
 */
export class WebHID implements Transport {
    private device?: HIDDevice;
    private reportId?: number;
    public readonly packetSize = 64;

    /**
     * WebHID constructor
     * @param device WebHID device to use
     * @param reportId Report ID to use
     */
    constructor(device: HIDDevice, reportId = REPORT_ID) {
        this.device = device;
        this.reportId = reportId;
    }

    /**
     * Open device
     * @returns Promise
     */
    public async open(): Promise<void> {
        if (this.device.open) {
            await this.device.open();
        } else {
            throw new Error("Device does not support open method");
        }
    }

    /**
     * Close device
     * @returns Promise
     */
    public async close(): Promise<void> {
        if (this.device.close) {
            await this.device.close();
        } else {
            throw new Error("Device does not support close method");
        }
    }

    /**
     * Read from device
     * @returns Promise of DataView
     */
    public async read(): Promise<DataView> {
        if (this.device.receiveReport) {
            const report = await this.device.receiveReport(this.reportId);
            if (report && report.buffer) {
                return new DataView(report.buffer);
            } else {
                throw new Error("Invalid report received");
            }
        } else {
            throw new Error("Device does not support receiveReport method");
        }
    }

    /**
     * Write to device
     * @param data Data to write
     * @returns Promise
     */
    public async write(data: BufferSource): Promise<void> {
        if (this.device.sendReport) {
            const buffer = new Uint8Array(data);
            await this.device.sendReport(this.reportId, buffer);
        } else {
            throw new Error("Device does not support sendReport method");
        }
    }
}