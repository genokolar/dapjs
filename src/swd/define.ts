// defines.ts
export const AP_NRF_RESET = 0x00;
export const AP_NRF_ERASEALL = 0x04;
export const AP_NRF_ERASEALLSTATUS = 0x08;
export const AP_NRF_APPROTECTSTATUS = 0x0c;
export const AP_NRF_IDR = 0xfc;
// Memory Access Port(MEM-AP)(AP)
export const AP_CSW = 0x00;
export const AP_TAR = 0x04;  // TAR寄存器中 写入或读取数据的内存地址
export const AP_DRW = 0x0c;  // DRW寄存器中 写入或读取的数据
export const AP_BD0 = 0x10;
export const AP_BD1 = 0x14;
export const AP_BD2 = 0x18;
export const AP_BD3 = 0x1c;
export const AP_DBGDRAR = 0xf8;
export const AP_IDR = 0xfc;
// Debug Port(DP)
export const DP_ABORT = 0x00;
export const DP_IDCODE = 0x00;
export const DP_CTRLSTAT = 0x04;
export const DP_SELECT = 0x0c;


分别为 reportid，swd序列命令号，序列数，序列信息[序列周期数和SWDIO模式]， 传输序列数据[每个周期1bit]

00 1D 04 20 FF FF FF FF               //32个序列周期[32bit数据]的输出高电平（最高64个序列周期）
00 1D 02 10 E7 79                     //16个周期[16bit数据]的JTAG-TO-SWD选择序列
00 1D 08 40 FF FF FF FF FF FF FF FF   //64个序列周期[64bit数据]的输出高电平（最高64个序列周期）
00 1D 07 38 FF FF FF FF FF FF FF      //56个序列周期[56bit数据]，56个周期输出高电平（最高64个序列周期）
00 1D 01 03 00                        //3个序列周期的输出低电平