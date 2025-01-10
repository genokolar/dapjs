// nrf_swd.ts
export interface NRFInfoStruct {
    flash_size: number;
    connected: number;
    codepage_size: number;
    codesize: number;
    config_id: number;
    device_id0: number;
    device_id1: number;
    info_part: number;
    info_variant: number;
    info_package: number;
    sd_info_area: number;
    ucir_lock: number;
  }
  
  export class NRF_SWD {
    private is_connected: boolean = false;
    private last_ack_check: number = 0;
    private ack_check_interval: number = 1000;
  
    private _task_write_flash: boolean = false;
    private _task_read_flash: boolean = false;
    private _offset: number = 0;
    private _file_size: number = 0;
    private _filename: string = "";
    private _percent: number = 0;
    private _speed: number = 0;
  
    private nrf_ufcr: NRFInfoStruct = {
      flash_size: 0,
      connected: 0,
      codepage_size: 0,
      codesize: 0,
      config_id: 0,
      device_id0: 0,
      device_id1: 0,
      info_part: 0,
      info_variant: 0,
      info_package: 0,
      sd_info_area: 0,
      ucir_lock: 0,
    };
  
    private new_info: boolean = false;
  
    public nrf_begin(muted: boolean = false): number {
      const temp = this.swd_init();
      this.nrf_abort_all();
      if (temp === 0x2ba01477) {
        this.is_connected = true;
        this.nrf_ufcr.connected = 1;
        if (this.nrf_read_lock_state()) {
          this.nrf_halt();
          this.nrf_read_ufcr();
          this.nrf_ufcr.connected = 2;
        }
      } else {
        this.is_connected = false;
        this.nrf_ufcr.connected = 0;
      }
      if (!muted) {
        this.new_info = true;
      }
      return temp;
    }
  
    public is_nrf_connected(): number {
      return this.nrf_ufcr.connected;
    }
  
    public do_nrf_swd(): void {
      if (this.is_connected) {
        if (this._task_write_flash) {
          this.flash_file(this._offset, this._filename);
          this._task_write_flash = false;
        } else if (this._task_read_flash) {
          this.dump_flash_to_file(this._offset, this._file_size, this._filename);
          this._task_read_flash = false;
        }
      }
    }
  
    private swd_init(): number {
      // Initialize SWD interface
      // This is a placeholder for the actual initialization logic
      console.log("SWD initialization");
      return 0x2ba01477; // Simulated ID code
    }
  
    private nrf_abort_all(): void {
      // Abort all ongoing operations
      console.log("NRF Abort all operations");
    }
  
    private nrf_halt(): void {
      // Halt the NRF device
      console.log("NRF Halt");
    }
  
    private nrf_read_lock_state(): boolean {
      // Read the lock state of the NRF device
      console.log("NRF Read lock state");
      return true; // Simulated lock state
    }
  
    private nrf_read_ufcr(): void {
      // Read the UFCR (User Flash Configuration Register)
      console.log("NRF Read UFCR");
      this.nrf_ufcr.flash_size = 1024; // Simulated flash size
      this.nrf_ufcr.connected = 2; // Simulated connected state
    }
  
    private flash_file(offset: number, filename: string): void {
      // Flash a file to the NRF device
      console.log(`Flashing file ${filename} to offset ${offset}`);
    }
  
    private dump_flash_to_file(offset: number, file_size: number, filename: string): void {
      // Dump flash content to a file
      console.log(`Dumping flash content to file ${filename} from offset ${offset} with size ${file_size}`);
    }
  
    public set_write_flash(offset: number, path: string): void {
      this._offset = offset;
      this._filename = path;
      this._percent = 0;
      this._speed = 0;
      this._task_write_flash = true;
    }
  
    public set_read_flash(offset: number, file_size: number, path: string): void {
      this._offset = offset;
      this._file_size = file_size;
      this._filename = path;
      this._percent = 0;
      this._speed = 0;
      this._task_read_flash = true;
    }
  
    public get_task_flash(percent: number[]): boolean {
      if (this._task_read_flash || this._task_write_flash) {
        percent[0] = this._percent;
        return true;
      }
      return false;
    }
  
    public get_last_speed(): number {
      return this._speed;
    }
  
    public set_new_main_info(state: boolean): void {
      this.new_info = state;
    }
  
    public get_new_main_info(): boolean {
      const temp_new_info = this.new_info;
      this.new_info = false;
      return temp_new_info;
    }
  
    public get_new_main_info(nrf_ufcr: NRFInfoStruct): void {
      nrf_ufcr.flash_size = this.nrf_ufcr.flash_size;
      nrf_ufcr.connected = this.nrf_ufcr.connected;
      nrf_ufcr.codepage_size = this.nrf_ufcr.codepage_size;
      nrf_ufcr.codesize = this.nrf_ufcr.codesize;
      nrf_ufcr.config_id = this.nrf_ufcr.config_id;
      nrf_ufcr.device_id0 = this.nrf_ufcr.device_id0;
      nrf_ufcr.device_id1 = this.nrf_ufcr.device_id1;
      nrf_ufcr.info_part = this.nrf_ufcr.info_part;
      nrf_ufcr.info_variant = this.nrf_ufcr.info_variant;
      nrf_ufcr.info_package = this.nrf_ufcr.info_package;
      nrf_ufcr.sd_info_area = this.nrf_ufcr.sd_info_area;
      nrf_ufcr.ucir_lock = this.nrf_ufcr.ucir_lock;
    }
  
    public set_last_speed(speed: number): void {
      this._speed = speed;
    }
  
    // Custom control port methods
    public nrf_port_selection(new_port: boolean): void {
      console.log(`NRF Port selection: ${new_port ? 'AP' : 'DP'}`);
    }
  
    public nrf_soft_reset(): void {
      console.log("NRF Soft reset");
    }
  
    public nrf_erase_all(): void {
      console.log("NRF Erase all");
    }
  }