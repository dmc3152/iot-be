export class DataSchema {
    id: string;
    key: string;
    name: string;
    unit: string;
    schema: Array<DataSchema>;

    constructor(data) {
        const id = data['@rid'] || data.id || null;

        this.id = id ? id.toString().replace('#', '') : null;
        this.key = data.key || null;
        this.name = data.name || null;
        this.unit = data.unit || null;
        this.schema = data.schema || [];
    }
}

export default DataSchema;