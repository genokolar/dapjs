// swd.ts
export class SWD {
    private swd_clock_pin: number = 21; // 示例引脚
    private swd_data_pin: number = 19;  // 示例引脚
    private turn_state: boolean = false;
  
    public swd_begin(): void {
      // 初始化 SWD 接口
      console.log(`SWD Begin: Clock pin ${this.swd_clock_pin}, Data pin ${this.swd_data_pin}`);
      // pinMode(this.swd_clock_pin, OUTPUT);
      // pinMode(this.swd_data_pin, INPUT_PULLUP);
    }
  
    public swd_init(): number {
      // 初始化 SWD 接口并返回 ID
      this.swd_write(0xffffffff, 32);
      this.swd_write(0xffffffff, 32);
      this.swd_write(0xe79e, 16);
      this.swd_write(0xffffffff, 32);
      this.swd_write(0xffffffff, 32);
      this.swd_write(0, 32);
      this.swd_write(0, 32);
  
      let idcode: number = 0;
      this.DP_Read(0x00, idcode); // DP_IDCODE
      return idcode;
    }
  
    public AP_Write(addr: number, data: number): boolean {
      let retry = 15;
      while (retry--) {
        const state = this.swd_transfer(addr, true, false, data);
        if (state) return true;
      }
      return false;
    }
  
    public AP_Read(addr: number, data: number[]): boolean {
      let retry = 15;
      while (retry--) {
        const state = this.swd_transfer(addr, true, true, data[0]);
        if (state) return true;
      }
      return false;
    }
  
    public DP_Write(addr: number, data: number): boolean {
      let retry = 15;
      while (retry--) {
        const state = this.swd_transfer(addr, false, false, data);
        if (state) return true;
      }
      return false;
    }
  
    public DP_Read(addr: number, data: number[]): boolean {
      let retry = 15;
      while (retry--) {
        const state = this.swd_transfer(addr, false, true, data[0]);
        if (state) return true;
      }
      return false;
    }
  
    private swd_transfer(port_address: number, APorDP: boolean, RorW: boolean, data: number): boolean {
      const parity = APorDP ^ RorW ^ ((port_address >> 2) & 1) ^ ((port_address >> 3) & 1);
      const filled_address = (1 << 0) | (APorDP << 1) | (RorW << 2) | ((port_address & 0xC) << 1) | (parity << 5) | (1 << 7);
      this.swd_write(filled_address, 8);
      if (this.swd_read(3) === 1) {
        if (RorW) {
          data = this.swd_read(32);
          if (this.swd_read(1) === this.calculate_parity(data)) {
            this.swd_write(0, 1);
            return true;
          }
        } else {
          this.swd_write(data, 32);
          this.swd_write(this.calculate_parity(data), 1);
          this.swd_write(0, 1);
          return true;
        }
      }
      this.swd_write(0, 32);
      return false;
    }
  
    private calculate_parity(in_data: number): number {
      in_data = (in_data & 0xFFFF) ^ (in_data >> 16);
      in_data = (in_data & 0xFF) ^ (in_data >> 8);
      in_data = (in_data & 0xF) ^ (in_data >> 4);
      in_data = (in_data & 0x3) ^ (in_data >> 2);
      in_data = (in_data & 0x1) ^ (in_data >> 1);
      return in_data & 1;
    }
  
    private swd_write(in_data: number, bits: number): void {
      if (this.turn_state === 0) {
        this.swd_turn(true);
      }
      while (bits--) {
        // digitalWrite(this.swd_data_pin, in_data & 1);
        // digitalWrite(this.swd_clock_pin, LOW);
        // delayMicroseconds(2);
        in_data >>= 1;
        // digitalWrite(this.swd_clock_pin, HIGH);
        // delayMicroseconds(2);
      }
    }
  
    private swd_read(bits: number): number {
      let out_data = 0;
      let input_bit = 1;
      if (this.turn_state === 1) {
        this.swd_turn(false);
      }
      while (bits--) {
        // if (digitalRead(this.swd_data_pin)) {
        //   out_data |= input_bit;
        // }
        // digitalWrite(this.swd_clock_pin, LOW);
        // delayMicroseconds(2);
        input_bit <<= 1;
        // digitalWrite(this.swd_clock_pin, HIGH);
        // delayMicroseconds(2);
      }
      return out_data;
    }
  
    private swd_turn(WorR: boolean): void {
      // digitalWrite(this.swd_data_pin, HIGH);
      // pinMode(this.swd_data_pin, INPUT_PULLUP);
      // digitalWrite(this.swd_clock_pin, LOW);
      // delayMicroseconds(2);
      // digitalWrite(this.swd_clock_pin, HIGH);
      // delayMicroseconds(2);
      if (WorR) {
        // pinMode(this.swd_data_pin, OUTPUT);
      }
      this.turn_state = WorR;
    }
  }