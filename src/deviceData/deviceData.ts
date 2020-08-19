export class DeviceData {
    id: string;
    createdAt: string;

    constructor(data?) {
        const id = data['@rid'] || data.id || null;

        this.id = id ? id.toString().replace('#', '') : null;
        this.createdAt = data.createdAt || new Date();

        Object.keys(data).forEach(key => {
            if (key !== 'createdAt' && key !== '@rid' && key !== 'id')
                this[key] = data[key];
        });
    }
}

export default DeviceData;