const common = require('./common');
const DAPjs = require('../../');

const requestDevice = async () => {
    try {
        const device = await navigator.hid.requestDevice({
            filters: [{ vendorId: common.DAPLINK_VENDOR }]
        });
        return device[0]; // 返回选择的设备
    } catch (error) {
        console.error('请求设备失败:', error.message || error);
    }
}

(async () => {
    try {
        const program = await common.getFile();
        const devices = await navigator.hid.requestDevice({
            filters: [{vendorId: 0x1209, usagePage: 0xff00, usage: 0x0002}]
        });
        const transport = new DAPJS.WebHID(devices[0]);
        await common.flash(transport, program);
    } catch (error) {
        console.error(error.message || error);
    }
    process.exit();
})();