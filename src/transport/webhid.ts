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
const REPORTID = 0x90;

/**
 * WebHID Transport class
 */
export class WebHID implements Transport {
    public readonly packetSize = 63;

    /**
     * WebHID constructor
     * @param device WebHID device to use
     * @param reportId Report ID to use
     */
    constructor(private device: HIDDevice) {
    }

    private extendBuffer(data: BufferSource, packetSize: number): BufferSource {
        function isView(source: ArrayBuffer | ArrayBufferView): source is ArrayBufferView {
            return (source as ArrayBufferView).buffer !== undefined;
        }

        const arrayBuffer = isView(data) ? data.buffer : data;
        const length = Math.min(arrayBuffer.byteLength, packetSize);

        const result = new Uint8Array(length);
        result.set(new Uint8Array(arrayBuffer));

        return result;
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
        const dataView = await new Promise<DataView>(resolve => {
            this.device.oninputreport = function (this: HIDDevice, ev: HIDInputReportEvent) {
                resolve(ev.data);
            };
        });

        return dataView;
    }

    /**
     * Write to device
     * @param data Data to write
     * @returns Promise
     */
    public async write(data: BufferSource): Promise<void> {

        const buffer = this.extendBuffer(data, this.packetSize);
        await this.device.sendReport(REPORTID, buffer);
    }
}
