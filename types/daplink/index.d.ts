import { CmsisDAP, DAPProtocol } from '../proxy';
import { Transport } from '../transport';
/**
 * DAPLink Class
 */
export declare class DAPLink extends CmsisDAP {
    /**
     * Progress event
     * @event
     */
    static EVENT_PROGRESS: string;
    /**
     * Serial read event
     * @event
     */
    static EVENT_SERIAL_DATA: string;
    /**
     * @hidden
     */
    protected serialPolling: boolean;
    /**
     * @hidden
     */
    protected serialListeners: boolean;
    /**
     * DAPLink constructor
     * @param transport Debug transport to use
     * @param mode Debug mode to use
     * @param clockFrequency Communication clock frequency to use (default 10000000)
     */
    constructor(transport: Transport, mode?: DAPProtocol, clockFrequency?: number);
    /**
     * 异步写入缓冲区数据到设备
     *
     * @param buffer 要写入的缓冲区数据
     * @param pageSize 每次写入的数据块大小
     * @param offset 写入数据的起始偏移量，默认为0
     * @returns 返回一个Promise，无返回值
     * @throws 如果写入过程中发生错误，则抛出异常
     */
    private writeBuffer;
    /**
     * 异步执行刷写操作
     *
     * @param buffer 待刷写的缓冲区，可以为 ArrayBuffer 或 ArrayBufferView 类型
     * @param pageSize 每页的大小，默认为 DEFAULT_PAGE_SIZE (默认62)
     * @returns 返回一个 Promise，无返回值
     * @throws 若刷写过程中出现错误，则抛出异常
     */
    flash(buffer: BufferSource, pageSize?: number): Promise<void>;
    /**
     * Get the serial baud rate setting
     * @returns Promise of baud rate
     */
    getSerialBaudrate(): Promise<number>;
    /**
     * Set the serial baud rate setting
     * @param baudrate The baudrate to use (defaults to 9600)
     * @returns Promise
     */
    setSerialBaudrate(baudrate?: number): Promise<void>;
    /**
     * Write serial data
     * @param data The data to write
     * @returns Promise
     */
    serialWrite(data: string): Promise<void>;
    /**
     * Read serial data
     * @returns Promise of any arrayBuffer read
     */
    serialRead(): Promise<ArrayBuffer | undefined>;
    /**
     * Start listening for serial data
     * @param serialDelay The serial delay to use (default 100)
     * @param autoConnect whether to automatically connect to the target (default true)
     */
    startSerialRead(serialDelay?: number, autoConnect?: boolean): Promise<void>;
    /**
     * Stop listening for serial data
     */
    stopSerialRead(): void;
}
export * from './enums';
