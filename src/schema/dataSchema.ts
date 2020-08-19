export class DataSchema {
    id: string;
    key: string;
    name: string;
    unit: string;
    type: string;
    schema: Array<DataSchema>;

    constructor(data) {
        const id = data['@rid'] || data.id || null;

        this.id = id ? id.toString().replace('#', '') : null;
        this.key = data.key || null;
        this.name = data.name || null;
        this.unit = data.unit || null;
        this.type = data.type || null;
        this.schema = Array.isArray(data.schema) ? data.schema.map(schema => new DataSchema(schema)) : [];
    }
}

export default DataSchema;