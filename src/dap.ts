import {CMSISDAP, DapCmd} from "./transport/cmsis_dap";
import {IHID} from "./transport/hid";
import {addInt32, apReg, assert, bank, delay, readUInt32LE, regRequest} from "./util";

export const enum DapRegisters {
    CSYSPWRUPACK = 0x80000000,
    CDBGPWRUPACK = 0x20000000,
    CSYSPWRUPREQ = 0x40000000,
    CDBGPWRUPREQ = 0x10000000,

    TRNNORMAL = 0x00000000,
    MASKLANE = 0x00000f00,
}

export const enum Csw {
    CSW_SIZE = 0x00000007,
    CSW_SIZE8 = 0x00000000,
    CSW_SIZE16 = 0x00000001,
    CSW_SIZE32 = 0x00000002,
    CSW_ADDRINC = 0x00000030,
    CSW_NADDRINC = 0x00000000,
    CSW_SADDRINC = 0x00000010,
    CSW_PADDRINC = 0x00000020,
    CSW_DBGSTAT = 0x00000040,
    CSW_TINPROG = 0x00000080,
    CSW_HPROT = 0x02000000,
    CSW_MSTRTYPE = 0x20000000,
    CSW_MSTRCORE = 0x00000000,
    CSW_MSTRDBG = 0x20000000,
    CSW_RESERVED = 0x01000000,

    CSW_VALUE = (CSW_RESERVED | CSW_MSTRDBG | CSW_HPROT | CSW_DBGSTAT | CSW_SADDRINC),
}

export const enum DapVal {
    AP_ACC = 1 << 0,
    DP_ACC = 0 << 0,
    READ = 1 << 1,
    WRITE = 0 << 1,
    VALUE_MATCH = 1 << 4,
    MATCH_MASK = 1 << 5,
}

export const enum Reg {
    DP_0x0 = 0,
    DP_0x4 = 1,
    DP_0x8 = 2,
    DP_0xC = 3,
    AP_0x0 = 4,
    AP_0x4 = 5,
    AP_0x8 = 6,
    AP_0xC = 7,

    IDCODE = Reg.DP_0x0,
    ABORT = Reg.DP_0x0,
    CTRL_STAT = Reg.DP_0x4,
    SELECT = Reg.DP_0x8,

}

export const enum ApReg {
    CSW = 0x00,
    TAR = 0x04,
    DRW = 0x0C,

    IDR = 0xFC,
}

export class DAP {
    private dap: CMSISDAP;

    private dpSelect: number;
    private csw: number;
    private idcode: number;

    constructor(private device: IHID) {
        this.dap = new CMSISDAP(device);
    }

    public async reconnect() {
        await this.dap.disconnect();
        await delay(100);
        await this.init();
    }

    public async init() {
        await this.dap.connect();

        const n = await this.readDp(Reg.IDCODE);
        this.idcode = n;

        await this.writeReg(Reg.DP_0x0, 1 << 2); // clear sticky error
        await this.writeDp(Reg.SELECT, 0);
        await this.writeDp(Reg.CTRL_STAT, DapRegisters.CSYSPWRUPREQ | DapRegisters.CDBGPWRUPREQ);

        const m = DapRegisters.CDBGPWRUPACK | DapRegisters.CSYSPWRUPACK;
        let v = await this.readDp(Reg.CTRL_STAT);

        while ((v & m) !== m) {
            v = await this.readDp(Reg.CTRL_STAT);
        }

        await this.writeDp(
            Reg.CTRL_STAT,
            (DapRegisters.CSYSPWRUPREQ |
            DapRegisters.CDBGPWRUPREQ |
            DapRegisters.TRNNORMAL |
            DapRegisters.MASKLANE),
        );
        await this.writeDp(Reg.SELECT, 0);
        await this.readAp(ApReg.IDR);
    }

    public async writeReg(regId: Reg, val: number) {
        return this.regOp(regId, val);
    }

    public async readReg(regId: Reg) {
        const buf = await this.regOp(regId, null);
        const v = readUInt32LE(buf, 3);

        return v;
    }

    public async readDp(addr: Reg) {
        return this.readReg(addr);
    }

    public async readAp(addr: ApReg) {
        await this.writeDp(Reg.SELECT, bank(addr));
        return await this.readReg(apReg(addr, DapVal.READ));
    }

    public writeDp(addr: Reg, data: number) {
        if (addr === Reg.SELECT) {
            if (data === this.dpSelect) {
                return Promise.resolve();
            }

            this.dpSelect = data;
        }

        return this.writeReg(addr, data);
    }

    public async writeAp(addr: ApReg, data: number) {
        await this.writeDp(Reg.SELECT, bank(addr));

        if (addr === ApReg.CSW) {
            if (data === this.csw) {
                return Promise.resolve();
            }

            this.csw = data;
        }

        await this.writeReg(apReg(addr, DapVal.WRITE), data);
    }

    public async close() {
        return this.device.close();
    }

    public async readRegRepeat(regId: Reg, cnt: number) {
        assert(cnt <= 15);

        const request = regRequest(regId);
        const sendargs = [0, cnt];

        for (let i = 0; i < cnt; ++i) {
            sendargs.push(request);
        }

        const buf = await this.dap.cmdNums(DapCmd.DAP_TRANSFER, sendargs);

        if (buf[1] !== cnt) {
            throw new Error(("(many) Bad #trans " + buf[1]));
        } else if (buf[2] !== 1) {
            throw new Error(("(many) Bad transfer status " + buf[2]));
        }

        return buf.slice(3, 3 + cnt * 4);
    }

    public async writeRegRepeat(regId: Reg, data: Uint32Array) {
        assert(data.length <= 15);

        const request = regRequest(regId, true);
        const sendargs = [0, data.length];

        data.forEach((d) => {
            sendargs.push(request);
            addInt32(sendargs, d);
        });

        const buf = await this.dap.cmdNums(DapCmd.DAP_TRANSFER, sendargs);

        if (buf[2] !== 1) {
            throw new Error(("(many-wr) Bad transfer status " + buf[2]));
        }
    }

    private async regOp(regId: Reg, val: number) {
        const request = regRequest(regId, val !== null);
        const sendargs = [0, 1, request];

        if (val !== null) {
            addInt32(sendargs, val);
        }

        const buf = await this.dap.cmdNums(DapCmd.DAP_TRANSFER, sendargs);

        if (buf[1] !== 1) {
            console.error("Make sure you have initialised the DAP connection.");
            throw new Error(("Bad #trans " + buf[1]));
        } else if (buf[2] !== 1) {
            if (buf[2] === 2) {
                throw new Error(("Transfer wait"));
            }
            throw new Error(("Bad transfer status " + buf[2]));
        }

        return buf;
    }
}