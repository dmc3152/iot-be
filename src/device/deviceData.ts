export class DeviceData {
    createdAt: string;

    constructor(data) {
        this.createdAt = data.createdAt || null;
    }
}

export default DeviceData;