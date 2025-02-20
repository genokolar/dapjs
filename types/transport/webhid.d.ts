import { Transport } from './';
interface HIDDevice extends EventTarget {
    oninputreport: ((this: HIDDevice, ev: HIDInputReportEvent) => any) | null;
    readonly opened: boolean;
    readonly vendorId: number;
    readonly productId: number;
    readonly productName: string;
    readonly collections: readonly HIDCollectionInfo[];
    open(): Promise<void>;
    close(): Promise<void>;
    forget(): Promise<void>;
    sendReport(reportId: number, data: ArrayBufferView | ArrayBuffer): Promise<void>;
    sendFeatureReport(reportId: number, data: ArrayBufferView | ArrayBuffer): Promise<void>;
    receiveFeatureReport(reportId: number): Promise<DataView>;
}
interface HIDInputReportEvent extends Event {
    readonly device: HIDDevice;
    readonly reportId: number;
    readonly data: DataView;
}
interface HIDCollectionInfo {
    usage: number;
    usagePage: number;
    reportId: number;
    inputReports: number;
    outputReports: number;
    featureReports: number;
}
/**
 * @hidden
 */
/**
 * WebHID Transport class
 */
export declare class WebHID implements Transport {
    private device;
    readonly packetSize = 64;
    /**
     * WebHID constructor
     * @param device WebHID device to use
     * @param reportId Report ID to use
     */
    constructor(device: HIDDevice);
    private extendBuffer;
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
