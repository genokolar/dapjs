import { Transport } from './';
interface HIDDevice {
    open(): Promise<void>;
    close(): Promise<void>;
    receiveReport(reportId: number): Promise<ArrayBuffer>;
    sendReport(reportId: number, data: Uint8Array): Promise<void>;
}
/**
 * WebHID Transport class
 */
export declare class WebHID implements Transport {
    private device;
    private reportId;
    readonly packetSize = 64;
    /**
     * WebHID constructor
     * @param device WebHID device to use
     * @param reportId Report ID to use
     */
    constructor(device: HIDDevice, reportId?: number);
    /**
     * Open device
     * @returns Promise
     */
    open(): Promise<void>;
    /**
     * Close device
     * @returns Promise
     */
    close(): Promise<void>;
    /**
     * Read from device
     * @returns Promise of DataView
     */
    read(): Promise<DataView>;
    /**
     * Write to device
     * @param data Data to write
     * @returns Promise
     */
    write(data: BufferSource): Promise<void>;
}
export {};
