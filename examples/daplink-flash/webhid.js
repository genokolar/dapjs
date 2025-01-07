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
        const device = await requestDevice();
        const transport = new DAPJS.WebHID(device);
        await common.flash(transport, program);
    } catch (error) {
        console.error(error.message || error);
    }
    process.exit();
})();