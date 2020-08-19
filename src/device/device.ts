import { DeviceData } from "../deviceData/deviceData";
import { DataSchema } from "../schema/dataSchema";

export class Device {
    id: string;
    guid: string;
    name: string;
    data: Array<DeviceData>;
    schema: Array<DataSchema>;
    structure: any;

    constructor(data) {
        const id = data['@rid'] || data.id || null;

        this.id = id ? id.toString().replace('#', '') : null;
        this.guid = data.guid || null;
        this.name = data.name || null;
        this.data = data.data || [];
        this.schema = data.schema || [];
        this.schema = this.schema.map(function (item) {
            return new DataSchema(item);
        });

        this.structure = (this.schema).reduce(function buildStructure(structure, item) {
            if (!item || !item.key) return structure;
    
            item.schema = Array.isArray(item.schema) ? item.schema : [];
            structure[item.key] = item.schema.reduce(buildStructure, {});
            structure[item.key]._name = item.name;
            structure[item.key]._unit = item.unit;
    
            return structure;
        }, {});
    }
}

export default Device;